import {
	object,
	string,
	type Output,
	array,
	merge,
	nullable,
	literal,
} from "valibot";

export const Report = object({
	id: string(),
	playername: string(),
	description: nullable(string()),
	createdBy: string(),
	communityId: string(),

	categoryIds: array(string()),
	proofLinks: array(string()),

	createdAt: string(),
	isRevoked: literal(false),
});
export type Report = Output<typeof Report>;

export const Revocation = merge([
	Report,
	object({
		revokedAt: string(),
		isRevoked: literal(true),
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
