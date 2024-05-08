import {
	type Output,
	array,
	literal,
	merge,
	object,
	string,
	union,
} from "valibot";

export const Report = object({
	id: string(),
	playername: string(),
	description: string(),
	createdBy: string(),
	communityId: string(),

	categoryIds: array(string()),
	proofLinks: array(string()),

	createdAt: string(),
	isRevoked: literal(false),
});
export type Report = Output<typeof Report>;

export const CreateReport = object({
	playername: string(),
	description: string(),
	createdBy: string(),

	categoryIds: array(string()),
	proofLinks: array(string()),
});
export type CreateReport = Output<typeof CreateReport>;

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

export const FilterObject = object({
	id: string(),
	categoryFilters: array(string()),
	communityFilters: array(string()),
});
export type FilterObject = Output<typeof FilterObject>;

export const CommunityCreationNotification = object({
	type: literal("communityCreation"),
	communityId: string(),
});
export type CommunityCreationNotification = Output<
	typeof CommunityCreationNotification
>;

export const CommunityMergeNotification = object({
	type: literal("communityMerge"),
	sourceId: string(),
	targetId: string(),
});
export type CommunityMergeNotification = Output<
	typeof CommunityMergeNotification
>;

export const CategoryCreationNotification = object({
	type: literal("categoryCreated"),
	categoryId: string(),
});
export type CategoryCreationNotification = Output<
	typeof CategoryCreationNotification
>;

export const CategoryMergedNotification = object({
	type: literal("categoryMerged"),
	sourceId: string(),
	targetId: string(),
});
export type CategoryMergedNotification = Output<
	typeof CategoryMergedNotification
>;

export const SystemUpdateNotification = union([
	CommunityCreationNotification,
	CommunityMergeNotification,
	CategoryCreationNotification,
	CategoryMergedNotification,
]);
export type SystemUpdateNotification = Output<typeof SystemUpdateNotification>;
