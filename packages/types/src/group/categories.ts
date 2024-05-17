import { z } from "zod";

export const Category = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
});
export type Category = z.infer<typeof Category>;

export const CreateCategory = z.object({
	name: z.string(),
	description: z.string(),
});
export type CreateCategory = z.infer<typeof CreateCategory>;

export const ModifyCategory = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
});
export type ModifyCategory = z.infer<typeof ModifyCategory>;
