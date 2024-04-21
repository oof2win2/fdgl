import type { FDGLService } from "@fdgl/core-worker";

// the env that we pass to route handlers
export type CustomEnv = Omit<Env, "FDGL"> & {
	FDGL: Service<FDGLService>;
};
