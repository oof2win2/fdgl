import { error, json } from "itty-router";
import router from "./router";
import type { CustomEnv } from "./types";
import { Kysely } from "kysely";
import { type DB } from "./db-types";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { Database } from "bun:sqlite";

if (!Bun.env["DB_FILENAME"])
	throw new Error("DB filename not specified in .env");

const kysely = new Kysely<DB>({
	dialect: new BunSqliteDialect({
		database: new Database(Bun.env["DB_FILENAME"]),
	}),
	log: (event) => {
		console.log(event.query.sql);
	},
});

const master_api_key = Bun.env["master_api_key"];
if (!master_api_key) throw new Error("Master API key not provided");

export default {
	port: 3000,
	fetch: (request: Request) => {
		const env: CustomEnv = {
			kysely,
			master_api_key,
		};
		const ctx: ExecutionContext = {
			waitUntil: (_: Promise<unknown>) => null,
			passThroughOnException: () => null,
		};
		return router
			.handle(request, env, ctx)
			.then(json)
			.catch((err) => {
				console.log(err);
				return error(500, { message: "An internal server error occured" });
			});
	},
};
