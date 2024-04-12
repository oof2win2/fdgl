import { Router } from "itty-router";
import type { CF, RequestType } from "../types";
import type { Communities } from "../db-types";

const communitiesRouter = Router({ base: "/communities" });

// GET /
// get all communities
communitiesRouter.get<RequestType, CF>("/", async (_req, env) => {
	const cached = await env.KV.get<Communities[]>("communities");
	if (cached) return cached;

	const communities = await env.kysely
		.selectFrom("Communities")
		.selectAll()
		.execute();

	await env.KV.put("communities", JSON.stringify(communities));

	return communities;
});

// GET /:id
// get a community by it's ID
communitiesRouter.get<RequestType, CF>("/:id", async (req, env) => {
	const id = req.params.id;

	const cached = await env.KV.get<Communities[]>("communities", {
		type: "json",
	});

	const found = cached ? cached.find((community) => community.id === id) : null;
	if (found) return found;

	const category = await env.kysely
		.selectFrom("Communities")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();

	return category ?? null;
});

export default communitiesRouter;
