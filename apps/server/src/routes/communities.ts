import { Router } from "itty-router";
import type { CF, RequestType } from "../types";

const communitiesRouter = Router({ base: "/communities" });

// GET /
// get all communities
communitiesRouter.get<RequestType, CF>("/", async (_req, env, _ctx) => {
	const categories = await env.kysely
		.selectFrom("Communities")
		.selectAll()
		.execute();
	return categories;
});

// GET /:id
// get a community by it's ID
communitiesRouter.get<RequestType, CF>("/:id", async (req, env, _ctx) => {
	const id = req.params.id;
	const category = await env.kysely
		.selectFrom("Communities")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	return category ?? null;
});

export default communitiesRouter;
