import type { Kysely } from "kysely";
import type { DB, ReportProof, Reports } from "./db-types";

export type CustomEnv = {
	DB: Kysely<DB>;
	d1_db: D1Database;
} & Omit<Env, "DB">;

export type ReportWithProofAndCategories = Reports & {
	proof: Omit<ReportProof, "reportId">[];
	categories: { categoryId: string }[];
};

export type R2EventNotification = {
	account: string;
	action:
		| "PutObject"
		| "CopyObject"
		| "CompleteMultipartUpload"
		| "DeleteObject";
	bucket: string;
	object: {
		key: string;
		size?: number;
		eTag?: string;
	};
};
