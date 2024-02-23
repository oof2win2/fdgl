import { Router, error } from "itty-router";
import { nanoid } from "nanoid";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";

const masterCommunitiesRouter = Router({ base: "/master/communities" });

// PUT /communities
// create community
const createCommunitySchema = object({
	contact: string(),
});
masterCommunitiesRouter.put<JSONParsedBody<typeof createCommunitySchema>, CF>(
	"/",
	getJSONBody(createCommunitySchema),
	async (req, env) => {
		const id = nanoid();
		// TODO: validation that contact is a discord user
		await env.kysely
			.insertInto("Community")
			.values({
				id,
				contact: req.jsonParsedBody.contact,
			})
			.execute();
		return { id };
	},
);

// DELETE /communities/:id
// delete community
masterCommunitiesRouter.delete<RequestType, CF>("/:id", async (req, env) => {
	const id = req.params.id;
	const community = await env.kysely
		.selectFrom("Community")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	if (!community) return error(404, { message: "Community not found" });
	await env.kysely.deleteFrom("Community").where("id", "=", id).execute();
	await env.kysely.deleteFrom("Report").where("communityId", "=", id).execute();
	// TODO: do something with all reports on delete
	return { status: "ok" };
});

export default masterCommunitiesRouter;
