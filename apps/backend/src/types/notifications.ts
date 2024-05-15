export type CommunityCreationNotification = {
	type: "communityCreation";
	communityId: string;
};

export type CommunityMergeNotification = {
	type: "communityMerge";
	sourceId: string;
	targetId: string;
};

export type CategoryCreatedNotification = {
	type: "categoryCreated";
	categoryId: string;
};

export type CategoriesMergedNotification = {
	type: "categoryMerged";
	sourceId: string;
	targetId: string;
};

export type SystemEventNotificationContent =
	| CommunityCreationNotification
	| CommunityMergeNotification
	| CategoryCreatedNotification
	| CategoriesMergedNotification;
