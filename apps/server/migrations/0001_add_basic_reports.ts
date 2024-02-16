import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
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
			col.notNull().references("Community.id").onDelete("cascade")
		)
		.addColumn("categoryId", "text", (col) =>
			col.notNull().references("Category.id").onDelete("cascade")
		)
		// used for marking revocation status
		.addColumn("revokedAt", "text")
		.addColumn("expiresAt", "text", (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("Report").ifExists().execute();
	await db.schema.dropTable("Category").ifExists().execute();
	await db.schema.dropTable("Community").ifExists().execute();
}
