import type { IRequestStrict } from "itty-router";
import type { Kysely } from "kysely";
import type { DB } from "./db-types";

// the env that we get from cloudflare
type Env = {
	DB: D1Database;
};
// the env that we pass to route handlers
export type CustomEnv = {
	kysely: Kysely<DB>;
	master_api_key: string;
};
// create a convenient duple
export type CFEnv = [env: Env, context: ExecutionContext];
export type CF = [env: CustomEnv, context: ExecutionContext];

export type RequestType = IRequestStrict & {};
export type JSONParsedRequestType<T> = RequestType & {
	jsonParsedBody: T;
};
