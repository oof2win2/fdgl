import { AutoRouter, error } from "itty-router";
import * as z from "zod";
import { type JSONParsedBody, getJSONBody } from "../utils/jsonBody";
import { generateId } from "$utils/id";
import { db } from "$utils/db";
import { sql } from "kysely";

const masterCategoriesRouter = AutoRouter({
	base: "/master/categories",
});

// PUT /categories
// create category
const createCategorySchema = z.object({
	name: z.string(),
	description: z.string(),
});
masterCategoriesRouter.put<JSONParsedBody<typeof createCategorySchema>>(
	"/",
	getJSONBody(createCategorySchema),
	async (req) => {
		const id = generateId();

		const data = req.jsonParsedBody;

		await db
			.insertInto("Categories")
			.values({
				id,
				name: data.name,
				description: data.description,
			})
			.execute();

		await db
			.insertInto("SystemEvent")
			.values({
				createdAt: new Date(),
				data: {
					type: "categoryCreated",
					categoryId: id,
				},
			})
			.execute();

		return { id };
	},
);

// POST /categories/:id
// update category (by replacing)
const updateCategorySchema = z.object({
	name: z.string(),
	description: z.string(),
});
masterCategoriesRouter.post<JSONParsedBody<typeof updateCategorySchema>>(
	"/:id/update",
	getJSONBody(updateCategorySchema),
	async (req) => {
		const id = req.params.id;
		const data = req.jsonParsedBody;

		const exists = await db
			.selectFrom("Categories")
			.select("id")
			.where("id", "=", id)
			.executeTakeFirst();
		if (!exists) return error(404, { message: "Category not found" });

		await db
			.updateTable("Categories")
			.set({
				name: data.name,
				description: data.description,
			})
			.where("id", "=", id)
			.limit(1)
			.execute();

		return { status: "ok" };
	},
);

masterCategoriesRouter.post("/merge", async (req) => {
	const params = new URL(req.url).searchParams;
	const source = params.get("source");
	const dest = params.get("dest");

	if (!source) return error(400, { message: "Missing source" });
	if (!dest) return error(400, { message: "Missing destination" });

	await db.transaction().execute(async (tx) => {
		// we first attempt to change all report categories where the categoryId is the source category
		// and change them to the destination category
		// the OR IGNORE will leave behind any conflicting objects. since there is a PK on both
		// the reportId and categoryId, reports which already have a record for the source category
		// will have the old category object present
		// we can then easily delete the remaining ones as they are the "ex-conflicting" ones
		const update = sql`UPDATE OR IGNORE ReportCategory SET categoryId=${dest} WHERE categoryId=${source}`;
		await update.execute(tx);

		await tx
			.deleteFrom("ReportCategory")
			.where("categoryId", "=", source)
			.execute();
	});

	// and finally we create a system event
	await db
		.insertInto("SystemEvent")
		.values({
			createdAt: new Date(),
			data: {
				type: "categoryMerged",
				sourceId: source,
				targetId: dest,
			},
		})
		.execute();

	return { status: "ok" };
});

export default masterCategoriesRouter;
