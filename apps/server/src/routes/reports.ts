import { Router, error } from "itty-router";
import type { CF, RequestType } from "../types";
import type { Expression } from "kysely";
import type { DB } from "../db-types";
import type { SqlBool } from "kysely";
import type { StringReference } from "kysely";
import {
	array,
	integer,
	maxValue,
	minLength,
	minValue,
	number,
	object,
	string,
} from "valibot";
import { getJSONBody, type JSONParsedBody } from "../utils/json-body";
import { communityAuthorize, type AuthorizedRequest } from "../utils/auth";
import { nanoid } from "nanoid";
import { datePlus } from "itty-time";

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

// GET /
// get reports by filters
ReportsRouter.get<RequestType, CF>("/", async (req, env) => {
	const params = new URL(req.url).searchParams;

	// TODO: reimplement filtering for categoryIds with kysely json or something
	const reports = env.kysely
		.selectFrom("Report")
		.selectAll()
		.where((wb) => {
			const ands: Expression<SqlBool>[] = [];
			const check = (key: StringReference<DB, "Report">) => {
				const values = params.getAll(key);
				if (!values.length) return;
				if (values.length === 1) ands.push(wb(key, "=", values[0]));
				else ands.push(wb(key, "in", values));
			};

			check("playername");
			check("communityId");
			check("createdBy");

			const createdAfter = params.get("createdAfter");
			if (createdAfter) {
				const date = new Date(createdAfter);
				if (!isNaN(date.valueOf())) {
					ands.push(wb("createdAt", ">", date.toISOString()));
				}
			}
			const expiresAfter = params.get("expiresAfter");
			if (expiresAfter) {
				const date = new Date(expiresAfter);
				if (!isNaN(date.valueOf())) {
					ands.push(wb("expiresAt", ">", date.toISOString()));
				}
			}
			const expiresBefore = params.get("expiresBefore");
			if (expiresBefore) {
				const date = new Date(expiresBefore);
				if (!isNaN(date.valueOf())) {
					ands.push(wb("expiresAt", "<", date.toISOString()));
				}
			}

			return wb.and(ands);
		});

	const results = reports.execute();
	return results;
});

// POST /
// create a report
const createReportSchema = object({
	playername: string(),
	description: string(),
	createdBy: string(),
	categoryIds: array(string(), [minLength(1)]),
	proofCount: number([integer(), minValue(0), maxValue(25)]),
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
					expiresAt: datePlus("6 months").toISOString(),
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
