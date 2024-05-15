import { db } from "$utils/db";
import { AutoRouter } from "itty-router";

const communitiesRouter = AutoRouter({ base: "/communities" });

// GET /
// get all communities
communitiesRouter.get("/", async () => {
	const communities = await db.selectFrom("Communities").selectAll().execute();

	return communities;
});

// GET /:id
// get a community by it's ID
communitiesRouter.get("/:id", async (req) => {
	const community = await db
		.selectFrom("Communities")
		.selectAll()
		.where("id", "=", req.params.id)
		.executeTakeFirst();

	return community ?? null;
});

export default communitiesRouter;
