import { object, string, optional, type Output, array, merge } from "valibot";

export const Report = object({
	id: string(),
	playername: string(),
	description: optional(string()),
	createdBy: string(),
	communityId: string(),

	categoryIds: array(string()),
	proofLinks: array(string()),

	createdAt: string(),
	updatedAt: string(),
});
export type Report = Output<typeof Report>;

export const Revocation = merge([
	Report,
	object({
		revokedAt: string(),
	}),
]);
export type Revocation = Output<typeof Revocation>;

export const Community = object({
	id: string(),
	contact: string(),
});
export type Community = Output<typeof Community>;

export const Category = object({
	id: string(),
	name: string(),
	description: string(),
});
export type Category = Output<typeof Category>;
