import { Router } from "itty-router";
import type { CF, RequestType } from "../types";

const categoriesRouter = Router<RequestType, CF>({ base: "/categories" });

// GET /
// get all categories
categoriesRouter.get("/", async (_req, env, _ctx) => {
	const categories = await env.kysely
		.selectFrom("Categories")
		.selectAll()
		.execute();
	return categories;
});

// GET /:id
// get a category by it's ID
categoriesRouter.get("/:id", async (req, env, _ctx) => {
	const id = req.params.id;
	const category = await env.kysely
		.selectFrom("Categories")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	return category ?? null;
});

export default categoriesRouter;
