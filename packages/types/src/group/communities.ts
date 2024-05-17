import { z } from "zod";

export const Community = z.object({
	id: z.string(),
	name: z.string(),
	contact: z.string(),
});
export type Community = z.infer<typeof Community>;

export const CreateCommunity = z.object({
	name: z.string(),
	contact: z.string(),
});
export type CreateCommunity = z.infer<typeof CreateCommunity>;
