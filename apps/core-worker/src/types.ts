import { Kysely } from "kysely";
import type { DB, ReportProof, Reports } from "./db-types";

export type CustomEnv = {
	DB: Kysely<DB>;
	d1_db: D1Database;
} & Omit<Env, "DB">;

export type ReportWithProofAndCategories = Reports & {
	proof: Omit<ReportProof, "reportId">[];
	categories: { categoryId: string }[];
};
