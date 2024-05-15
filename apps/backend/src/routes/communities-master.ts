import { AutoRouter } from "itty-router";
import * as z from "zod";
import { type JSONParsedBody, getJSONBody } from "$utils/jsonBody";

const masterCommunitiesRouter = AutoRouter({
	base: "/master/communities",
});

// PUT /communities
// create community
const createCommunitySchema = z.object({
	contact: z.string(),
	name: z.string(),
});
masterCommunitiesRouter.put<JSONParsedBody<typeof createCommunitySchema>>(
	"/",
	getJSONBody(createCommunitySchema),
	async (req, env) => {
		console.log(req.jsonParsedBody);
		const res = await env.FDGL.communities.createCommunity({
			name: req.jsonParsedBody.name,
			contact: req.jsonParsedBody.contact,
		});

		return res;
	},
);

export default masterCommunitiesRouter;
