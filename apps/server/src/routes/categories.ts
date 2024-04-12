import { Router } from "itty-router";
import type { CF, RequestType } from "../types";
import type { Categories } from "../db-types";

const categoriesRouter = Router<RequestType, CF>({ base: "/categories" });

// GET /
// get all categories
categoriesRouter.get("/", async (_req, env) => {
	const cached = await env.KV.get<Categories[]>("categories");
	if (cached) return cached;

	const categories = await env.kysely
		.selectFrom("Categories")
		.selectAll()
		.execute();

	await env.KV.put("categories", JSON.stringify(categories));

	return categories;
});

// GET /:id
// get a category by it's ID
categoriesRouter.get("/:id", async (req, env) => {
	const id = req.params.id;

	const cached = await env.KV.get<Categories[]>("categories");
	const found = cached ? cached.find((category) => category.id === id) : null;
	if (found) return found;

	const category = await env.kysely
		.selectFrom("Categories")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();

	return category ?? null;
});

export default categoriesRouter;
