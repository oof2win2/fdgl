import type { IRequestStrict } from "itty-router";
import type { Kysely } from "kysely";
import type { DB } from "./db-types";

// the env that we pass to route handlers
export type CustomEnv = {
	kysely: Kysely<DB>;
	MASTER_API_KEY: string;
	JWT_SECRET: string;
	R2_SIGNING_SECRET: string;
	R2: R2Bucket;
};
// create a convenient duple
export type CFEnv = [env: Env, context: ExecutionContext];
export type CF = [env: CustomEnv, context: ExecutionContext];

export type RequestType = IRequestStrict & {};
export type JSONParsedRequestType<T> = RequestType & {
	jsonParsedBody: T;
};
