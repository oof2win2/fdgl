import { Kysely } from "kysely";
import { defineConfig } from "kysely-migrate";
import { Database } from "bun:sqlite";
import { BunSqliteDialect } from "kysely-bun-sqlite";

if (!Bun.env["DB_FILENAME"])
	throw new Error("DB filename not specified in .env");
const db = new Database(Bun.env["DB_FILENAME"]);

export default defineConfig({
	db: new Kysely({
		dialect: new BunSqliteDialect({ database: db }),
	}),
	migrationFolder: "migrations",
	codegen: { dialect: "sqlite", out: "src/db-types.ts" },
});
