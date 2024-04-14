import { AutoRouter, error } from "itty-router";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";

const masterCategoriesRouter = AutoRouter<RequestType, CF>({
	base: "/master/categories",
});

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
		const id = await env.FDGL.categories.createCategory({
			name: req.jsonParsedBody.name,
			description: req.jsonParsedBody.description,
		});

		return { id };
	},
);

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

		const status = await env.FDGL.categories.updateCategory({
			id,
			name: req.jsonParsedBody.name,
			description: req.jsonParsedBody.description,
		});

		if (status === "notFound")
			return error(404, { message: "Category not found" });

		return { status: "ok" };
	},
);

masterCategoriesRouter.post<RequestType, CF>("/merge", async (req, env) => {
	const params = new URL(req.url).searchParams;
	const source = params.get("source");
	const dest = params.get("dest");

	if (!source) return error(400, { message: "Missing source" });
	if (!dest) return error(400, { message: "Missing destination" });

	const status = await env.FDGL.categories.mergeCategories(source, dest);

	if (status === "sourceNotFound")
		return error(400, { message: "Invalid source" });
	if (status === "destNotFound")
		return error(400, { message: "Invalid destination" });

	// TODO: notify of the changes
	return { status: "ok" };
});

export default masterCategoriesRouter;
