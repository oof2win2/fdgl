import type { ColumnType, JSONColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Authorization = {
	apikey: string;
	communityId: string;
	/**
	 * @kyselyType(Date)
	 */
	expiresAt: Date;
};
export type Categories = {
	id: string;
	name: string;
	description: string;
};
export type Communities = {
	id: string;
	name: string;
	contact: string;
};
export type FilterObject = {
	id: string;
	/**
	 * JSONB object of category filters
	 * @kyselyType(JSONColumnType<Record<string, boolean>>)
	 */
	filteredCategories: JSONColumnType<Record<string, boolean>>;
	/**
	 * JSONB object of community filters
	 * @kyselyType(JSONColumnType<Record<string, boolean>>)
	 */
	filteredCommunities: JSONColumnType<Record<string, boolean>>;
};
export type ReportCategory = {
	id: Generated<number>;
	reportId: string;
	categoryId: string;
};
export type ReportProof = {
	proofId: string;
	reportId: string;
	/**
	 * @kyselyType("image/jpeg" | "image/png")
	 */
	filetype: "image/jpeg" | "image/png";
};
export type Reports = {
	id: string;
	playername: string;
	description: string | null;
	communityId: string;
	createdBy: string;
	/**
	 * @kyselyType(Date)
	 */
	revokedAt: Date | null;
	/**
	 * @kyselyType(Date)
	 */
	createdAt: Date;
	/**
	 * @kyselyType(Date)
	 */
	updatedAt: Date;
};
export type DB = {
	Authorization: Authorization;
	Categories: Categories;
	Communities: Communities;
	FilterObject: FilterObject;
	ReportCategory: ReportCategory;
	ReportProof: ReportProof;
	Reports: Reports;
};
