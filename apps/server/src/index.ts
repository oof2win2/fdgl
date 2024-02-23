import { Database } from "bun:sqlite";
import { error, json } from "itty-router";
import { Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { type DB } from "./db-types";
import router from "./router";
import type { CustomEnv } from "./types";

if (!Bun.env.DB_FILENAME) throw new Error("DB filename not specified in .env");

const kysely = new Kysely<DB>({
	dialect: new BunSqliteDialect({
		database: new Database(Bun.env.DB_FILENAME),
	}),
	log: (event) => {
		console.log(event.query.sql);
	},
});

const getEnv = (key: string): string => {
	const value = Bun.env[key];
	if (!value) throw new Error(`Env key ${key} was not provided`);
	return value;
};

export default {
	port: 3000,
	fetch: (request: Request) => {
		const env: CustomEnv = {
			kysely,
			MASTER_API_KEY: getEnv("MASTER_API_KEY"),
			JWT_SECRET: getEnv("JWT_SECRET"),
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
