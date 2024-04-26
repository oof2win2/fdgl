import type { APIEmbedField } from "discord-api-types/v10";

export interface PagedData {
	id: string;
	data: APIEmbedField[];
	currentPage: number;
	expiresAt: Date;
}

export interface DB {
	PagedData: PagedData;
}
