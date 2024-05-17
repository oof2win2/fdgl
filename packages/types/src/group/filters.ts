import { z } from "zod";

export const FilterObject = z.object({
	id: z.string(),
	categoryFilters: z.string().array(),
	communityFilters: z.string().array(),
});
export type FilterObject = z.infer<typeof FilterObject>;

export const UpsertFilterObject = z.object({
	categoryFilters: z.string().array(),
	communityFilters: z.string().array(),
});
export type UpsertFilterObject = z.infer<typeof UpsertFilterObject>;
