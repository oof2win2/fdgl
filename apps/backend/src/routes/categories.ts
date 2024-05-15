import { db } from "$utils/db";
import { AutoRouter } from "itty-router";

const categoriesRouter = AutoRouter({ base: "/categories" });

// GET /
// get all categories
categoriesRouter.get("/", async () => {
	const categories = await db.selectFrom("Categories").selectAll().execute();

	return categories;
});

// GET /:id
// get a category by it's ID
categoriesRouter.get("/:id", async (req) => {
	const id = req.params.id;

	const category = await db
		.selectFrom("Categories")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();

	return category ?? null;
});

export default categoriesRouter;
