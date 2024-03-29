import { Router, error } from "itty-router";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { datePlus } from "itty-time";
import { generateId } from "../utils/nanoid";

const masterCommunitiesRouter = Router({ base: "/master/communities" });

// PUT /communities
// create community
const createCommunitySchema = object({
	contact: string(),
	name: string(),
});
masterCommunitiesRouter.put<JSONParsedBody<typeof createCommunitySchema>, CF>(
	"/",
	getJSONBody(createCommunitySchema),
	async (req, env) => {
		const communityId = generateId();
		// TODO: validation that contact is a discord user
		await env.kysely
			.insertInto("Communities")
			.values({
				id: communityId,
				contact: req.jsonParsedBody.contact,
				name: req.jsonParsedBody.name,
			})
			.execute();

		const expiry = datePlus("365 days");
		const apikeyId = generateId();
		const apikey = await jwt.sign(
			{
				jti: apikeyId,
				exp: Math.floor(Date.now() / 1000) + 86400,
				sub: communityId,
			},
			env.JWT_SECRET,
		);
		await env.kysely
			.insertInto("Authorization")
			.values({
				id: apikeyId,
				communityId,
				expiresAt: expiry.toISOString(),
			})
			.execute();
		return { id: communityId, apikey };
	},
);

// DELETE /communities/:id
// delete community
masterCommunitiesRouter.delete<RequestType, CF>("/:id", async (req, env) => {
	const id = req.params.id;
	const community = await env.kysely
		.selectFrom("Communities")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	if (!community) return error(404, { message: "Community not found" });
	await env.kysely.deleteFrom("Communities").where("id", "=", id).execute();
	await env.kysely
		.deleteFrom("Reports")
		.where("communityId", "=", id)
		.execute();
	// TODO: do something with all reports on delete
	return { status: "ok" };
});

export default masterCommunitiesRouter;
