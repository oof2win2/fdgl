import { Router, error } from "itty-router";
import type { CF, RequestType } from "../types";
import type { Expression } from "kysely";
import type { DB } from "../db-types";
import type { SqlBool } from "kysely";
import type { StringReference } from "kysely";

const ReportsRouter = Router<RequestType, CF>({ base: "/reports" });

// GET /:id
// get a report by ID
ReportsRouter.get("/:id", async (req, env, _ctx) => {
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
ReportsRouter.get("/", async (req, env) => {
	const params = new URL(req.url).searchParams;

	const query = env.kysely
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
			check("categoryId");
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

	const results = query.execute();
	return results;
});

export default ReportsRouter;
