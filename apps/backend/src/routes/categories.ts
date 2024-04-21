import { AutoRouter } from "itty-router";
import type { CF, RequestType } from "../types";

const categoriesRouter = AutoRouter<RequestType, CF>({ base: "/categories" });

// GET /
// get all categories
categoriesRouter.get("/", async (_req, env) => {
	const categories = await env.FDGL.categories.getAllCategories();
	return categories;
});

// GET /:id
// get a category by it's ID
categoriesRouter.get("/:id", async (req, env) => {
	const id = req.params.id;

	const category = await env.FDGL.categories.getCategory(id);

	return category ?? null;
});

export default categoriesRouter;
