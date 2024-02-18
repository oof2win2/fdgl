import { type Kysely } from "kysely";
import type { DB } from "../src/db-types";

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.alterTable("Report")
		.dropColumn("expiresAt")
		.addColumn("createdAt", "text", (col) => col.notNull())
		.addColumn("updatedAt", "text", (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<DB>): Promise<void> {}
