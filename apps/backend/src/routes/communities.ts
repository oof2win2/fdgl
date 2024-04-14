import { AutoRouter } from "itty-router";
import type { CF, RequestType } from "../types";

const communitiesRouter = AutoRouter<RequestType, CF>({ base: "/communities" });

// GET /
// get all communities
communitiesRouter.get("/", async (_req, env) => {
	using communities = await env.FDGL.communities.getAllCommunities();

	return communities;
});

// GET /:id
// get a community by it's ID
communitiesRouter.get("/:id", async (req, env) => {
	using community = await env.FDGL.communities.getCommunity(req.params.id);

	return community ?? null;
});

export default communitiesRouter;
