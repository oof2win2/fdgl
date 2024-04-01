import { Router, error } from "itty-router";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import { generateId } from "../utils/nanoid";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { Categories } from "../schema";
import { eq } from "drizzle-orm";

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

		const db = drizzle(env.DB, { schema });

		await db.insert(Categories).values({
			id,
			name: req.jsonParsedBody.name,
			description: req.jsonParsedBody.description,
		});

		return { id };
	},
);

// DELETE /categories/:id
// delete category
masterCategoriesRouter.delete<RequestType, CF>("/:id", async (req, env) => {
	const id = req.params.id;

	const db = drizzle(env.DB, { schema });

	const category = await db.query.Categories.findFirst({
		where: eq(Categories.id, id),
		columns: { id: true },
	});

	if (!category) return error(404, { message: "Category not found" });

	await db.delete(Categories).where(eq(Categories.id, id));

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

		const db = drizzle(env.DB, { schema });

		const category = await db.query.Categories.findFirst({
			where: eq(Categories.id, id),
			columns: { id: true },
		});

		if (!category) return error(404, { message: "Category not found" });

		await db
			.update(Categories)
			.set({
				name: req.jsonParsedBody.name,
				description: req.jsonParsedBody.description,
			})
			.where(eq(Categories.id, id));

		return { status: "ok" };
	},
);

masterCategoriesRouter.post<RequestType, CF>("/merge", async (req, env) => {
	const params = new URL(req.url).searchParams;
	const source = params.get("source");
	const dest = params.get("dest");
	if (!source) return error(400, { message: "Missing source" });
	if (!dest) return error(400, { message: "Missing destination" });

	const db = drizzle(env.DB, { schema });

	const sourceCategory = db.query.Categories.findFirst({
		where: eq(Categories.id, source),
		columns: { id: true },
	});

	if (!sourceCategory)
		return error(400, { message: "The source category does not exist" });

	const destCategory = db.query.Categories.findFirst({
		where: eq(Categories.id, dest),
		columns: { id: true },
	});

	if (!destCategory)
		return error(400, { message: "The destination category does not exist" });

	await db.delete(Categories).where(eq(Categories.id, source));

	// TODO: do something with the reports
	return { status: "ok" };
});

export default masterCategoriesRouter;
