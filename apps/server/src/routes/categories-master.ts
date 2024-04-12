import { Router, error } from "itty-router";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import { generateId } from "../utils/nanoid";

const masterCategoriesRouter = Router({ base: "/master/categories" });

// PUT /categories
// create category
const createCategorySchema = object({
	name: string(),
	description: string(),
});
masterCategoriesRouter.put<JSONParsedBody<typeof createCategorySchema>, CF>(
	"/",
	getJSONBody(createCategorySchema),
	async (req, env) => {
		const id = generateId();
		await env.kysely
			.insertInto("Categories")
			.values({
				id,
				name: req.jsonParsedBody.name,
				description: req.jsonParsedBody.description,
			})
			.execute();

		// purge the categories from cache
		await env.KV.delete("categories");

		return { id };
	},
);

// DELETE /categories/:id
// delete category
masterCategoriesRouter.delete<RequestType, CF>("/:id", async (req, env) => {
	const id = req.params.id;
	const category = await env.kysely
		.selectFrom("Categories")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	if (!category) return error(404, { message: "Category not found" });
	await env.kysely.deleteFrom("Categories").where("id", "=", id).execute();

	// purge the categories from cache
	await env.KV.delete("categories");

	// TODO: do something with all reports on delete
	return { status: "ok" };
});

// POST /categories/:id
// update category (by replacing)
const updateCategorySchema = object({
	name: string(),
	description: string(),
});
masterCategoriesRouter.post<JSONParsedBody<typeof updateCategorySchema>, CF>(
	"/:id/update",
	getJSONBody(updateCategorySchema),
	async (req, env) => {
		const id = req.params.id;
		const category = await env.kysely
			.selectFrom("Categories")
			.selectAll()
			.where("id", "=", id)
			.executeTakeFirst();
		if (!category) return error(404, { message: "Category not found" });
		await env.kysely
			.updateTable("Categories")
			.set({
				name: req.jsonParsedBody.name,
				description: req.jsonParsedBody.description,
			})
			.where("id", "=", id)
			.execute();

		// purge the categories from cache
		await env.KV.delete("categories");

		return { status: "ok" };
	},
);

masterCategoriesRouter.post<RequestType, CF>("/merge", async (req, env) => {
	const params = new URL(req.url).searchParams;
	const source = params.get("source");
	const dest = params.get("dest");

	if (!source) return error(400, { message: "Missing source" });
	if (!dest) return error(400, { message: "Missing destination" });

	const sourceCategory = await env.kysely
		.selectFrom("Categories")
		.select("id")
		.where("id", "=", source)
		.executeTakeFirst();
	if (!sourceCategory)
		return error(400, { message: "The source category does not exist" });
	const destCategory = await env.kysely
		.selectFrom("Categories")
		.select("id")
		.where("id", "=", source)
		.executeTakeFirst();
	if (!destCategory)
		return error(400, { message: "The destination category does not exist" });
	await env.kysely.deleteFrom("Categories").where("id", "=", source).execute();

	// purge the categories from cache
	await env.KV.delete("categories");

	// TODO: do something with the reports
	return { status: "ok" };
});

export default masterCategoriesRouter;
