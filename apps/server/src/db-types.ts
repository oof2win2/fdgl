import type { Generated } from "kysely";

export type Community = {
	id: string;
	contact: string;
};

export type Category = {
	id: string;
	name: string;
	description: string;
};

export type Report = {
	id: string;
	playername: string;
	description: string | null;
	createdBy: string;
	communityId: string;

	revokedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ReportCategory = {
	id: Generated<number>;
	reportId: string;
	categoryId: string;
};

export type ReportProof = {
	id: Generated<number>;
	reportId: string;
	proofLink: string;
};

export type Authorization = {
	id: string;
	communityId: string;
	expiresAt: string;
};

export interface DB {
	Community: Community;
	Category: Category;
	Report: Report;
	ReportCategory: ReportCategory;
	ReportProof: ReportProof;
	Authorization: Authorization;
}
