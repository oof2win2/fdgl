import { Router, error } from "itty-router";
import type { CF, RequestType } from "../types";
import { object, string } from "valibot";
import { getJSONBody, type JSONParsedBody } from "../utils/json-body";
import { nanoid } from "nanoid";

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
		const id = nanoid();
		await env.kysely
			.insertInto("Category")
			.values({
				id,
				name: req.jsonParsedBody.name,
				description: req.jsonParsedBody.description,
			})
			.execute();
		return { id };
	}
);

// DELETE /categories/:id
// delete category
masterCategoriesRouter.delete<RequestType, CF>("/:id", async (req, env) => {
	const id = req.params["id"];
	const category = await env.kysely
		.selectFrom("Category")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	if (!category) return error(404, { message: "Category not found" });
	await env.kysely.deleteFrom("Category").where("id", "=", id).execute();
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
		const id = req.params["id"];
		const category = await env.kysely
			.selectFrom("Category")
			.selectAll()
			.where("id", "=", id)
			.executeTakeFirst();
		if (!category) return error(404, { message: "Category not found" });
		await env.kysely
			.updateTable("Category")
			.set({
				name: req.jsonParsedBody.name,
				description: req.jsonParsedBody.description,
			})
			.where("id", "=", id)
			.execute();
		return { status: "ok" };
	}
);

masterCategoriesRouter.post<RequestType, CF>("/merge", async (req, ctx) => {
	const params = new URL(req.url).searchParams;
	const source = params.get("source");
	const dest = params.get("dest");
	if (!source) return error(400, { message: "Missing source" });
	if (!dest) return error(400, { message: "Missing destination" });
	const sourceCategory = await ctx.kysely
		.selectFrom("Category")
		.select("id")
		.where("id", "=", source)
		.executeTakeFirst();
	if (!sourceCategory)
		return error(400, { message: "The source category does not exist" });
	const destCategory = await ctx.kysely
		.selectFrom("Category")
		.select("id")
		.where("id", "=", source)
		.executeTakeFirst();
	if (!destCategory)
		return error(400, { message: "The destination category does not exist" });
	await ctx.kysely.deleteFrom("Category").where("id", "=", source).execute();
	// TODO: do something with the reports
	return { status: "ok" };
});

export default masterCategoriesRouter;
