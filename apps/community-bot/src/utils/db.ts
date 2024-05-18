import { BunSqliteDialect } from "kysely-bun-sqlite";
import type { DB } from "$types/db-types";
import { Kysely } from "kysely";
import { Database } from "bun:sqlite";
import { ENV } from "$utils/env";
import { SerializePlugin } from "kysely-plugin-serialize";

const sqlite = new Database(ENV.DATABASE_URL);
export const db = new Kysely<DB>({
	dialect: new BunSqliteDialect({
		database: sqlite,
	}),
	plugins: [new SerializePlugin()],
});
