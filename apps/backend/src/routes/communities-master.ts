import { AutoRouter } from "itty-router";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";

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
		using res = await env.FDGL.communities.createCommunity({
			name: req.jsonParsedBody.name,
			contact: req.jsonParsedBody.contact,
		});

		return res;
	},
);

export default masterCommunitiesRouter;
