import type { FDGLService } from "@fdgl/core-worker";
import type { Kysely } from "kysely";
import type { DB } from "./db-types";

export type BaseCFEnv = Omit<Env, "FDGL"> & {
	FDGL: Service<FDGLService>;
};

// the env that we pass to route handlers
export type CustomEnv = Omit<BaseCFEnv, "DB"> & {
	DB: Kysely<DB>;
	d1_db: D1Database;
};
