import { AutoRouter, error } from "itty-router";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import { datePlus } from "itty-time";
import { generateId } from "../utils/nanoid";

const masterCommunitiesRouter = AutoRouter<RequestType, CF>({
	base: "/master/communities",
});

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
		await env.DB.insertInto("Communities")
			.values({
				id: communityId,
				contact: req.jsonParsedBody.contact,
				name: req.jsonParsedBody.name,
			})
			.execute();

		const expiry = datePlus("365 days");
		const apikeyId = generateId();
		const apikey = generateId(32);
		await env.DB.insertInto("Authorization")
			.values({
				apikey: apikeyId,
				communityId,
				expiresAt: expiry,
			})
			.execute();

		// purge the communities from cache
		await env.KV.delete("communities");

		return { id: communityId, apikey };
	},
);

// DELETE /communities/:id
// delete community
masterCommunitiesRouter.delete("/:id", async (req, env) => {
	const id = req.params.id;
	const community = await env.DB.selectFrom("Communities")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	if (!community) return error(404, { message: "Community not found" });
	await env.DB.deleteFrom("Communities").where("id", "=", id).execute();
	await env.DB.deleteFrom("Reports").where("communityId", "=", id).execute();

	// purge the communities from cache
	await env.KV.delete("communities");

	// TODO: do something with all reports on delete
	return { status: "ok" };
});

export default masterCommunitiesRouter;
