import { Router, error, withParams } from "itty-router";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import * as v from "valibot";
import type { CF, RequestType } from "../types";
import { type AuthorizedRequest, communityAuthorize } from "../utils/auth";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import { generateId } from "../utils/nanoid";
import { createUploadUrl, verifyUploadUrl } from "../utils/proofUpload";

const ReportsRouter = Router({ base: "/reports" });

// GET /:id
// get a report by ID
ReportsRouter.get<RequestType, CF>("/:id", async (req, env, _ctx) => {
	const id = req.params.id;
	if (!id) return error(400, "No ID provided.");
	const report = await env.kysely
		.selectFrom("Reports")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	return report ?? null;
});

const DateSchema = v.transform(
	v.string([v.isoDateTime("The date is badly formatted.")]),
	(str) => new Date(str),
	[v.custom<Date>((date) => !Number.isNaN(date), "The date is invalid.")],
);

// GET /
// get reports by category, community, and time filters
const getReportsFiltered = v.object({
	// these two are technically optional but getAll returns an array even when no values are present
	categoryIds: v.array(v.string()),
	communityIds: v.array(v.string()),
	createdSince: v.nullable(DateSchema),
	revokedSince: v.nullable(DateSchema),
	updatedSince: v.nullable(DateSchema),
});
ReportsRouter.get<RequestType, CF>("/", withParams, async (req, env) => {
	const searchParams = new URL(req.url).searchParams;
	const params = v.parse(getReportsFiltered, {
		categoryIds: searchParams.getAll("categoryIds"),
		communityIds: searchParams.getAll("communityIds"),
		isRevoked: searchParams.getAll("isRevoked"),
		createdSince: searchParams.get("createdSince"),
		revokedSince: searchParams.get("revokedSince"),
		updatedSince: searchParams.get("updatedSince"),
	});

	// basic fetching of the reports with their categories
	let query = env.kysely
		.selectFrom("Reports")
		.selectAll("Reports")
		.select((qb) =>
			jsonArrayFrom(
				qb
					.selectFrom("ReportCategory")
					.select("ReportCategory.categoryId")
					.whereRef("ReportCategory.reportId", "=", "Reports.id"),
			).as("categories"),
		);
	if (params.communityIds.length)
		query = query.where("Reports.communityId", "in", params.communityIds);
	// this mess is basically selecting
	if (params.categoryIds.length)
		query = query.where((wb) =>
			wb(
				"Reports.id",
				"in",
				wb
					.selectFrom("ReportCategory")
					.select("ReportCategory.reportId")
					.where("ReportCategory.categoryId", "in", params.categoryIds),
			),
		);
	if (params.createdSince)
		query = query.where("Reports.createdAt", "<", params.createdSince);
	if (params.revokedSince)
		query = query.where("Reports.revokedAt", "<", params.revokedSince);
	if (params.updatedSince)
		query = query.where("Reports.updatedAt", "<", params.updatedSince);

	const results = await query.execute();
	const fixedCategories = results.map((report) => ({
		...report,
		categories: report.categories.map((c) => c.categoryId),
	}));
	return fixedCategories;
});

// POST /
// create a report
const createReportSchema = v.object({
	playername: v.string(),
	description: v.optional(v.string()),
	createdBy: v.string(),
	categoryIds: v.array(v.string(), [v.minLength(1), v.maxLength(100)]),
	proofCount: v.number([v.integer(), v.minValue(0), v.maxValue(25)]),
});
ReportsRouter.put<
	AuthorizedRequest<JSONParsedBody<typeof createReportSchema>>,
	CF
>(
	"/",
	communityAuthorize,
	getJSONBody(createReportSchema),
	async (req, env) => {
		const reportId = generateId();
		const body = req.jsonParsedBody;
		// we don't fetch categories from cache here because we need to be 100% sure that they exist
		const categories = (
			await env.kysely
				.selectFrom("Categories")
				.select("id")
				.where("id", "in", body.categoryIds)
				.execute()
		).map((c) => c.id);
		const invalidCategories = body.categoryIds.filter(
			(c) => !categories.includes(c),
		);
		if (invalidCategories.length)
			return error(
				400,
				`Categories ${invalidCategories.join(",")} are invalid`,
			);

		// first we create proof upload URLs
		const reportProofUrls = [];
		const proofIds = Array.from({ length: body.proofCount }, () =>
			generateId(),
		);

		for (const proofId of proofIds) {
			// create a URL to upload the files to with the base being set to whatever made the request here
			const url = await createUploadUrl(reportId, proofId, req.url, env);
			reportProofUrls.push(url);
		}

		// now we insert everything into the database
		await env.kysely
			.insertInto("Reports")
			.values({
				id: reportId,
				playername: body.playername,
				communityId: req.communityId,
				createdAt: new Date(),
				updatedAt: new Date(),
				description: body.description,
				createdBy: body.createdBy,
			})
			.execute();
		await env.kysely
			.insertInto("ReportCategory")
			.values(
				body.categoryIds.map((categoryId) => ({
					reportId: reportId,
					categoryId,
				})),
			)
			.execute();

		return {
			id: reportId,
			proofURLs: reportProofUrls,
		};
	},
);

// upload report proof
ReportsRouter.put<RequestType, CF>(
	"/:reportId/proof/:proofId",
	async (req, env) => {
		const isValidRequest = await verifyUploadUrl(req, env);
		if (!isValidRequest)
			return error(
				400,
				"The request is not authenticated properly or is expired",
			);

		const reportId = req.params.reportId;
		const proofId = req.params.proofId;
		// save the image into R2
		await env.R2.put(proofId, req.body);
		// save the info about the image into the database
		await env.kysely
			.insertInto("ReportProof")
			.values({
				reportId,
				proofId,
			})
			.execute();

		return "ok";
	},
);

ReportsRouter.get<RequestType, CF>(
	"/:reportId/proof/:proofId",
	async (req, env) => {
		const proofId = req.params.proofId;

		const img = await env.R2.get(proofId);
		if (!img) return error(404, "Proof not found");
		return img.body;
	},
);

ReportsRouter.delete<AuthorizedRequest<RequestType>, CF>(
	"/:id",
	communityAuthorize,
	async (req, env) => {
		const id = req.params.id;
		const report = await env.kysely
			.selectFrom("Reports")
			.select("communityId")
			.where("id", "=", id)
			.executeTakeFirst();
		if (!report) return error(404, "Report not found.");
		if (report.communityId !== req.communityId)
			return error(403, "You can't delete this report.");
		const revokedAt = new Date();
		await env.kysely
			.updateTable("Reports")
			.where("id", "=", id)
			.set({
				revokedAt: revokedAt,
				updatedAt: revokedAt,
			})
			.execute();
		return "ok";
	},
);

export default ReportsRouter;
