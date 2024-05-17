import { z } from "zod";
import { Category } from "./categories";
import { Community } from "./communities";

export const CategoryCreatedEvent = z.object({
	eventType: z.literal("categoryCreated"),
	category: Category,
});
export type CategoryCreatedEvent = z.infer<typeof CategoryCreatedEvent>;

export const CategoryDeletedEvent = z.object({
	eventType: z.literal("categoryDeleted"),
	categoryId: z.string(),
});
export type CategoryDeletedEvent = z.infer<typeof CategoryDeletedEvent>;

export const CategoryMergedEvent = z.object({
	eventType: z.literal("categoryMerged"),
	fromCategoryId: z.string(),
	toCategoryId: z.string(),
});
export type CategoryMergedEvent = z.infer<typeof CategoryMergedEvent>;

export const CommunityCreatedEvent = z.object({
	eventType: z.literal("communityCreated"),
	community: Community,
});
export type CommunityCreatedEvent = z.infer<typeof CommunityCreatedEvent>;

export const CommunityDeletedEvent = z.object({
	eventType: z.literal("communityDeleted"),
	communityId: z.string(),
});
export type CommunityDeletedEvent = z.infer<typeof CommunityDeletedEvent>;

export const CommunityMergedEvent = z.object({
	eventType: z.literal("communityMerged"),
	fromCommunityId: z.string(),
	toCommunityId: z.string(),
});
export type CommunityMergedEvent = z.infer<typeof CommunityMergedEvent>;

export type FDGLEvent =
	| CategoryCreatedEvent
	| CategoryDeletedEvent
	| CategoryMergedEvent
	| CommunityCreatedEvent
	| CommunityDeletedEvent
	| CommunityMergedEvent;
