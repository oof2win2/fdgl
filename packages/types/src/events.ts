import { object, literal, type Output, string } from "valibot";
import { Category, Community } from "./baseTypes";

export const CategoryCreatedEvent = object({
	eventType: literal("categoryCreated"),
	category: Category,
});
export type CategoryCreatedEvent = Output<typeof CategoryCreatedEvent>;

export const CategoryDeletedEvent = object({
	eventType: literal("categoryDeleted"),
	categoryId: string(),
});
export type CategoryDeletedEvent = Output<typeof CategoryDeletedEvent>;

export const CategoryMergedEvent = object({
	eventType: literal("categoryMerged"),
	fromCategoryId: string(),
	toCategoryId: string(),
});
export type CategoryMergedEvent = Output<typeof CategoryMergedEvent>;

export const CommunityCreatedEvent = object({
	eventType: literal("communityCreated"),
	community: Community,
});
export type CommunityCreatedEvent = Output<typeof CommunityCreatedEvent>;

export const CommunityDeletedEvent = object({
	eventType: literal("communityDeleted"),
	communityId: string(),
});
export type CommunityDeletedEvent = Output<typeof CommunityDeletedEvent>;

export const CommunityMergedEvent = object({
	eventType: literal("communityMerged"),
	fromCommunityId: string(),
	toCommunityId: string(),
});
export type CommunityMergedEvent = Output<typeof CommunityMergedEvent>;

export type FDGLEvent =
	| CategoryCreatedEvent
	| CategoryDeletedEvent
	| CategoryMergedEvent
	| CommunityCreatedEvent
	| CommunityDeletedEvent
	| CommunityMergedEvent;
