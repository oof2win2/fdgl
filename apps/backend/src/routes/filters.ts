import type { FilterObject } from "$types/db-selectable";
import {
	addResource,
	genericAuthorize,
	type GenericAuthorizedRequest,
} from "$utils/auth";
import { db } from "$utils/db";
import { generateId } from "$utils/id";
import { getJSONBody, type JSONParsedBody } from "$utils/jsonBody";
import { AutoRouter } from "itty-router";
import { z } from "zod";

const filtersRouter = AutoRouter({ base: "/filters" });

const normalizeFilterObject = (obj: FilterObject) => {
	return {
		id: obj.id,
		filteredCommunities: Object.keys(obj.filteredCommunities),
		filteredCategories: Object.keys(obj.filteredCategories),
	};
};

// GET /:id
// get a filter by its ID
filtersRouter.get("/:id", async (req) => {
	const filter = await db
		.selectFrom("FilterObject")
		.selectAll()
		.where("id", "=", req.params.id)
		.executeTakeFirst();

	return filter ? normalizeFilterObject(filter) : null;
});

// POST /
// upsert your filter object
const upsertFilterSchema = z.object({
	categoryFilters: z.string().array(),
	communityFilters: z.string().array(),
});
filtersRouter.post<
	GenericAuthorizedRequest<JSONParsedBody<typeof upsertFilterSchema>>
>("/", genericAuthorize, getJSONBody(upsertFilterSchema), async (req) => {
	const newFilterObjectId = generateId();

	const filteredCategories: Record<string, true> = {};
	const filteredCommunities: Record<string, true> = {};

	for (const category of req.jsonParsedBody.categoryFilters) {
		filteredCategories[category] = true;
	}
	for (const community of req.jsonParsedBody.communityFilters) {
		filteredCommunities[community] = true;
	}

	const returned = await db
		.insertInto("FilterObject")
		.values({
			id: newFilterObjectId,
			filteredCategories: JSON.stringify(filteredCategories),
			filteredCommunities: JSON.stringify(filteredCommunities),
		})
		.onConflict((cb) =>
			cb.doUpdateSet({
				filteredCategories: (eb) => eb.ref("excluded.filteredCategories"),
				filteredCommunities: (eb) => eb.ref("excluded.filteredCommunities"),
			}),
		)
		.returning("id as id") // return the ID of the existing record or the new record
		.executeTakeFirstOrThrow();

	// if the generated ID is the same as the returned ID, we need to give the user permissions to write to this
	if (returned.id === newFilterObjectId) {
		await addResource(req, {
			type: "filter",
			id: newFilterObjectId,
		});
	}

	return {
		id: returned.id,
	};
});

export default filtersRouter;
