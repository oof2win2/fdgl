import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	// add report proof
	await db.schema
		.createTable("ReportProof")
		.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
		.addColumn("reportId", "text", (col) =>
			col.notNull().references("Report.id").onDelete("cascade")
		)
		.addColumn("proofLink", "text", (col) => col.notNull())
		.execute();

	// add auth table
	await db.schema
		.createTable("Authorization")
		.addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
		.addColumn("communityId", "text", (col) => col.notNull())
		.addColumn("expiresAt", "text", (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("Authorization").ifExists().execute();
	await db.schema.dropTable("ReportProof").ifExists().execute();
}