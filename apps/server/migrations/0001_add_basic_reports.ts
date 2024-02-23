import { type Kysely } from "kysely";
import type { DB } from "../src/db-types";

export async function up(db: Kysely<DB>): Promise<void> {
	await db.schema
		.createTable("Community")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("contact", "text", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("Category")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("description", "text", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("Report")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("playername", "text", (col) => col.notNull())
		.addColumn("description", "text")
		.addColumn("createdBy", "text", (col) => col.notNull())
		// community and category id, deleted when the parent is deleted
		.addColumn("communityId", "text", (col) =>
			col.notNull().references("Community.id").onDelete("cascade"),
		)
		.addColumn("expiresAt", "text", (col) => col.notNull())
		// used for marking revocation status
		.addColumn("revokedAt", "text")
		.execute();

	await db.schema
		.createTable("ReportCategory")
		.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
		.addColumn("reportId", "text", (col) =>
			col.notNull().references("Report.id").onDelete("cascade"),
		)
		.addColumn("categoryId", "text", (col) => col.notNull())
		.addUniqueConstraint("ReportIdCategoryId", ["reportId", "categoryId"])
		.execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
	await db.schema.dropTable("Report").ifExists().execute();
	await db.schema.dropTable("ReportCategory").ifExists().execute();
	await db.schema.dropTable("Category").ifExists().execute();
	await db.schema.dropTable("Community").ifExists().execute();
}
