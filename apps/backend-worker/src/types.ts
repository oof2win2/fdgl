import { Kysely } from "kysely";
import type { DB, ReportProof, Reports } from "./db-types";

export type CustomEnv = {
	DB: Kysely<DB>;
	d1_db: D1Database;
} & Omit<Env, "DB">;

export interface ReportWithProofAndCategories {
	proof: Omit<ReportProof, "reportId">[];
	categories: { categoryId: string }[];
}
