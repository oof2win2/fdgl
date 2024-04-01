import { Router, error, withParams } from "itty-router";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import * as v from "valibot";
import type { CF, RequestType } from "../types";
import { type AuthorizedRequest, communityAuthorize } from "../utils/auth";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import { generateId } from "../utils/nanoid";
import { createUploadUrl, verifyUploadUrl } from "../utils/proofUpload";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { ReportCategories, ReportProof, Reports } from "../schema";
import { SQL, and, eq, gt, inArray } from "drizzle-orm";
import { arraysIntersect } from "../utils/arraysIntersect";

const ReportsRouter = Router({ base: "/reports" });

// GET /:id
// get a report by ID
ReportsRouter.get<RequestType, CF>("/:id", async (req, env, _ctx) => {
	const id = req.params.id;
	if (!id) return error(400, "No ID provided.");

	const db = drizzle(env.DB, { schema });
	const report = await db.query.Reports.findFirst({
		where: eq(Reports.id, id),
	});
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

	const db = drizzle(env.DB, { schema });
	const reports = await db.query.Reports.findMany({
		with: {
			categories: true,
			proof: true,
		},
		where: (report, { and, inArray }) => {
			const args: SQL[] = [];

			if (params.communityIds.length)
				args.push(inArray(report.communityId, params.communityIds));

			if (params.createdSince)
				args.push(gt(report.createdAt, params.createdSince.toISOString()));
			if (params.revokedSince)
				args.push(gt(report.revokedAt, params.revokedSince.toISOString()));
			if (params.updatedSince)
				args.push(gt(report.updatedAt, params.updatedSince.toISOString()));
			return and(...args);
		},
	});

	const fixedCategories = reports
		.map((report) => ({
			...report,
			categories: report.categories.map((c) => c.categoryId),
		}))
		.filter((report) => {
			// TODO: try implementing this in sql
			// if a category filter was provided, filter the reports in accordance to the categories as well
			if (params.categoryIds) {
				if (arraysIntersect(report.categories, params.categoryIds)) return true;
				return false;
			}
			// if there was no filter provided then ignore and return the report
			return true;
		});
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
		const db = drizzle(env.DB, { schema });
		const categories = await db.query.Categories.findMany({
			where: (category, { inArray }) => inArray(category.id, body.categoryIds),
		}).then((cats) => cats.map((c) => c.id));
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
		await db.insert(Reports).values({
			id: reportId,
			playername: body.playername,
			communityId: req.communityId,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			description: body.description,
			createdBy: body.createdBy,
		});
		await db.insert(ReportCategories).values(
			body.categoryIds.map((categoryId) => ({
				reportId: reportId,
				categoryId,
			})),
		);

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

		const db = drizzle(env.DB, { schema });

		// save the image into R2
		await env.R2.put(proofId, req.body);
		// save the info about the image into the database
		await db.insert(ReportProof).values({ reportId, proofId });

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

		const db = drizzle(env.DB, { schema });

		const report = await db.query.Reports.findFirst({
			where: (report, { eq }) => eq(report.id, id),
			columns: {
				communityId: true,
			},
		});

		if (!report) return error(404, "Report not found.");
		if (report.communityId !== req.communityId)
			return error(403, "You can't delete this report.");
		const revokedAt = new Date().toISOString();
		await db
			.update(Reports)
			.set({
				revokedAt: revokedAt,
				updatedAt: revokedAt,
			})
			.where(eq(Reports.id, id));
		return "ok";
	},
);

export default ReportsRouter;
