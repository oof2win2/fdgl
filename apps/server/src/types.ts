import type { IRequestStrict } from "itty-router";
import type { Kysely } from "kysely";
import type { DB } from "./db-types";

// the env that we pass to route handlers
export type CustomEnv = {
	kysely: Kysely<DB>;
	MASTER_API_KEY: string;
	JWT_SECRET: string;
	R2: R2Bucket;
	R2_accessKeyId: string;
	R2_secretAccessKey: string;
	R2_bucket_name: string;
	CF_account_id: string;
};
// create a convenient duple
export type CFEnv = [env: Env, context: ExecutionContext];
export type CF = [env: CustomEnv, context: ExecutionContext];

export type RequestType = IRequestStrict & {};
export type JSONParsedRequestType<T> = RequestType & {
	jsonParsedBody: T;
};
