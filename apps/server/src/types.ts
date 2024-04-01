import type { IRequestStrict } from "itty-router";

// create a convenient duple
export type CFEnv = [env: Env, context: ExecutionContext];
export type CF = [env: Env, context: ExecutionContext];

export type RequestType = IRequestStrict & {};
export type JSONParsedRequestType<T> = RequestType & {
	jsonParsedBody: T;
};
