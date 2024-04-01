import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const Categories = sqliteTable("Categories", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
});

export const Communities = sqliteTable("Communities", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	contact: text("contact").notNull(),
});

export const Authorization = sqliteTable("Authorization", {
	id: text("id").primaryKey(),
	communityId: text("id")
		.notNull()
		.references(() => Communities.id),
	expiresAt: text("id").notNull(),
});
export const authorizationRelations = relations(Authorization, ({ one }) => ({
	community: one(Communities, {
		fields: [Authorization.communityId],
		references: [Communities.id],
	}),
}));

export const Reports = sqliteTable("Reports", {
	id: text("id").primaryKey(),
	playername: text("playername").notNull(),
	description: text("description"),
	communityId: text("communityId")
		.notNull()
		.references(() => Communities.id),
	createdBy: text("createdBy").notNull(),
	createdAt: text("createdAt").notNull(),
	revokedAt: text("revokedAt"),
	updatedAt: text("updatedAt")
		.notNull()
		.$default(() => new Date().toISOString())
		.$onUpdate(() => new Date().toISOString()),
});
export const reportRelations = relations(Reports, ({ one, many }) => ({
	community: one(Communities, {
		fields: [Reports.communityId],
		references: [Communities.id],
	}),
	categories: many(ReportCategories),
	proof: many(ReportProof),
}));

export const ReportCategories = sqliteTable("ReportCategory", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	reportId: text("reportId")
		.notNull()
		.references(() => Reports.id),
	categoryId: text("categoryId")
		.notNull()
		.references(() => Categories.id),
});
export const reportCategoriesRelations = relations(
	ReportCategories,
	({ one }) => ({
		report: one(Reports, {
			fields: [ReportCategories.reportId],
			references: [Reports.id],
		}),
		category: one(Categories, {
			fields: [ReportCategories.categoryId],
			references: [Categories.id],
		}),
	}),
);

export const ReportProof = sqliteTable("ReportProof", {
	proofId: text("proofId").primaryKey(),
	reportId: text("reportId")
		.notNull()
		.references(() => Reports.id),
});
export const reportProofRelations = relations(ReportProof, ({ one }) => ({
	report: one(Reports, {
		fields: [ReportProof.reportId],
		references: [Reports.id],
	}),
}));
