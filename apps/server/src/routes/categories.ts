import { Router } from "itty-router";
import type { CF, RequestType } from "../types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";

const categoriesRouter = Router<RequestType, CF>({ base: "/categories" });

// GET /
// get all categories
categoriesRouter.get("/", async (_req, env, _ctx) => {
	const db = drizzle(env.DB, { schema });
	const categories = await db.query.Categories.findMany();
	return categories;
});

// GET /:id
// get a category by it's ID
categoriesRouter.get("/:id", async (req, env, _ctx) => {
	const id = req.params.id;
	const db = drizzle(env.DB, { schema });
	const category = await db.query.Categories.findFirst({
		where: (category, { eq }) => eq(category.id, id),
	});
	return category ?? null;
});

export default categoriesRouter;
