import type { IRequestStrict } from "itty-router";
import type { FDGLService } from "@fdgl/core-worker";

// the env that we pass to route handlers
export type CustomEnv = Omit<Env, "FDGL"> & {
	FDGL: Service<FDGLService>;
};
// create a convenient duple
export type CFEnv = [env: Env, context: ExecutionContext];
export type CF = [env: CustomEnv, context: ExecutionContext];

export type RequestType = IRequestStrict & {};
export type JSONParsedRequestType<T> = RequestType & {
	jsonParsedBody: T;
};
