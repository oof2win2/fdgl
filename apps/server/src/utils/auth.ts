import { error } from "itty-router";
import type { CustomEnv, RequestType } from "../types";

export async function MasterAuthenticate(req: RequestType, env: CustomEnv) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);
	if (authValue !== env.master_api_key) return error(401);
}
