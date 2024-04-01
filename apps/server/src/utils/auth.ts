import { error } from "itty-router";
import type { RequestType } from "../types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

export async function MasterAuthenticate(req: RequestType, env: Env) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);
	if (authValue !== env.MASTER_API_KEY) return error(401);
}

export type AuthorizedRequest<T extends RequestType = RequestType> = T & {
	communityId: string;
};
export async function communityAuthorize(req: AuthorizedRequest, env: Env) {
	const authId = req.headers.get("x-fdgl-auth");
	if (!authId) return error(401);

	const db = drizzle(env.DB, { schema });

	const auth = await db.query.Authorization.findFirst({
		where: eq(schema.Authorization.id, authId),
	});

	if (!auth) return error(401);

	req.communityId = auth.communityId;
}
