import type { Generated } from "kysely";

export type Authorization = {
	apikey: string;
	communityId: string;
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
export type ReportCategory = {
	id: Generated<number>;
	reportId: string;
	categoryId: string;
};
export type ReportProof = {
	proofId: string;
	reportId: string;
	filetype: "image/jpeg" | "image/png";
};
export type Reports = {
	id: string;
	playername: string;
	description: string | null;
	communityId: string;
	createdBy: string;
	revokedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};
export type DB = {
	Authorization: Authorization;
	Categories: Categories;
	Communities: Communities;
	ReportCategory: ReportCategory;
	ReportProof: ReportProof;
	Reports: Reports;
};
