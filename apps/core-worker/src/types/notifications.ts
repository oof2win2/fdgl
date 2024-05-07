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

export type CategoryUpdatedNotification = {
	type: "categoryUpdated";
	categoryId: string;
};

export type CategoriesMergedNotification = {
	type: "categoryDeleted";
	sourceId: string;
	targetId: string;
};

export type SystemEventNotificationContent =
	| CommunityCreationNotification
	| CommunityMergeNotification
	| CategoryCreatedNotification
	| CategoryUpdatedNotification
	| CategoriesMergedNotification;
