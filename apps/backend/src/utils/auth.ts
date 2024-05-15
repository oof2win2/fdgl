import { error } from "itty-router";
import { ENV } from "./env";
import type { RequestType } from "$types/request";
import { db } from "./db";

export async function MasterAuthenticate(req: RequestType) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);
	if (authValue !== ENV.MASTER_API_KEY) return error(401);
}

export type AuthorizedRequest<T extends RequestType = RequestType> = T & {
	communityId: string;
};
export async function communityAuthorize(req: AuthorizedRequest) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);

	const apikey = await db
		.selectFrom("Authorization")
		.selectAll()
		.where("apikey", "=", authValue)
		.executeTakeFirst();

	if (!apikey) return error(401);

	// check if the apikey is expired
	// if so, first delete the key from the db and then return a 401
	if (apikey.expiresAt < new Date()) {
		await db
			.deleteFrom("Authorization")
			.where("apikey", "=", authValue)
			.execute();
		return error(401);
	}

	req.communityId = apikey.communityId;
}
