import { error } from "itty-router";
import type { CustomEnv, RequestType } from "../types";
import jwt from "@tsndr/cloudflare-worker-jwt";

export async function MasterAuthenticate(req: RequestType, env: CustomEnv) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);
	if (authValue !== env.MASTER_API_KEY) return error(401);
}

export type AuthorizedRequest<T extends RequestType = RequestType> = T & {
	communityId: string;
};
export async function communityAuthorize(
	req: AuthorizedRequest,
	env: CustomEnv
) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);
	const isValid = await jwt.verify(authValue, env.JWT_SECRET);
	if (!isValid) return error(401);
	const decoded = jwt.decode(authValue);
	const jwtId = decoded.payload?.jti;
	const communityId = decoded.payload?.sub;
	const expiry = decoded.payload?.exp;
	if (!jwtId || !communityId || !expiry)
		return error(500, {
			message: "An error occured with an invalid JWT token",
		});
	const expiresAt = expiry * 1000;
	// the JWT is invalid so we ignore it
	if (Date.now() > expiresAt)
		return error(401, { message: "The JWT is expired" });
	const auth = await env.kysely
		.selectFrom("Authorization")
		.selectAll()
		.where("id", "=", jwtId)
		.executeTakeFirst();
	if (!auth) return error(401, { message: "The JWT is expired" });
	req.communityId = communityId;
}
