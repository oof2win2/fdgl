import { Router } from "itty-router";
import type { CF, RequestType } from "../types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";

const communitiesRouter = Router({ base: "/communities" });

// GET /
// get all communities
communitiesRouter.get<RequestType, CF>("/", async (_req, env) => {
	const db = drizzle(env.DB, { schema });
	const communities = await db.query.Communities.findMany();
	return communities;
});

// GET /:id
// get a community by it's ID
communitiesRouter.get<RequestType, CF>("/:id", async (req, env, _ctx) => {
	const id = req.params.id;
	const db = drizzle(env.DB, { schema });

	const community = await db.query.Communities.findFirst({
		where: (community, { eq }) => eq(community.id, id),
	});

	return community ?? null;
});

export default communitiesRouter;
