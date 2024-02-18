import { Router, error, withParams } from "itty-router";
import type { CF, RequestType } from "../types";
import * as v from "valibot";
import { getJSONBody, type JSONParsedBody } from "../utils/json-body";
import { communityAuthorize, type AuthorizedRequest } from "../utils/auth";
import { nanoid } from "nanoid";
import { jsonArrayFrom } from "kysely/helpers/sqlite";

const ReportsRouter = Router({ base: "/reports" });

// GET /:id
// get a report by ID
ReportsRouter.get<RequestType, CF>("/:id", async (req, env, _ctx) => {
	const id = req.params["id"];
	const report = await env.kysely
		.selectFrom("Report")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	return report ?? null;
});

const MaybeDateSchema = v.coerce(v.optional(v.date()), (i) => {
	// if there is no string return nothing
	if (!i) return undefined;
	const d = new Date(i as string);
	return Number.isNaN(d) ? null : d;
});

// GET /
// get reports by category, community, and time filters
const getReportsFiltered = v.object({
	// these two are technically optional but getAll returns an array even when no values are present
	categoryIds: v.array(v.string()),
	communityIds: v.array(v.string()),
	createdSince: MaybeDateSchema,
	revokedSince: MaybeDateSchema,
	updatedSince: MaybeDateSchema,
});
ReportsRouter.get<RequestType, CF>("/", withParams, async (req, env) => {
	const searchParams = new URL(req.url).searchParams;
	console.log(req.params);
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
		.selectFrom("Report")
		.selectAll("Report")
		.select((qb) => [
			jsonArrayFrom(
				qb
					.selectFrom("ReportCategory")
					.select("ReportCategory.categoryId")
					.whereRef("ReportCategory.reportId", "=", "Report.id")
			).as("categories"),
		]);
	if (params.communityIds.length)
		query = query.where("Report.communityId", "in", params.communityIds);
	// this mess is basically selecting
	if (params.categoryIds.length)
		query = query.where((wb) =>
			wb(
				"Report.id",
				"in",
				wb
					.selectFrom("ReportCategory")
					.select("ReportCategory.reportId")
					.where("ReportCategory.categoryId", "in", params.categoryIds)
			)
		);
	if (params.createdSince)
		query = query.where(
			"Report.createdAt",
			"<",
			params.createdSince.toISOString()
		);
	if (params.revokedSince)
		query = query.where(
			"Report.revokedAt",
			"<",
			params.revokedSince.toISOString()
		);
	if (params.updatedSince)
		query = query.where(
			"Report.updatedAt",
			"<",
			params.updatedSince.toISOString()
		);

	// TODO: add filtering of categories in SQL itself rather than in clientside JS

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
	description: v.string(),
	createdBy: v.string(),
	categoryIds: v.array(v.string(), [v.minLength(1)]),
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
		const reportId = nanoid();
		const body = req.jsonParsedBody;
		try {
			await env.kysely
				.insertInto("Report")
				.values({
					id: reportId,
					playername: body.playername,
					communityId: req.communityId,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
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
					}))
				)
				.execute();
			// TODO: handle uploading proof
			// const generatedReportProof
			// await env.kysely.insertInto("ReportProof").values
			return {
				id: reportId,
				proofURLs: [],
			};
		} catch {
			// delete the report data if it happened to get inserted
			await env.kysely
				.deleteFrom("Report")
				.where("id", "=", reportId)
				.execute();
			await env.kysely
				.deleteFrom("ReportCategory")
				.where("reportId", "=", reportId)
				.execute();
			await env.kysely
				.deleteFrom("ReportProof")
				.where("reportId", "=", reportId)
				.execute();
			return error(500, { message: "Creating report failed" });
		}
	}
);

export default ReportsRouter;
