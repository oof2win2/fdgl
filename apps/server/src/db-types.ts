export type Community = {
	id: string;
	contact: string;
};

export type Category = {
	id: string;
	name: string;
	description: string;
};

export type Report = {
	id: string;
	playername: string;
	description: string | null;
	createdBy: string;
	communityId: string;
	categoryId: string;
	revokedAt: string | null;
	createdAt: string;
	expiresAt: string;
};

export interface DB {
	Community: Community;
	Category: Category;
	Report: Report;
}
