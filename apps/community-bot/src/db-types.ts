export interface PagedData {
	id: string;
	data: string;
	currentPage: number;
	expiresAt: Date;
}

export interface DB {
	PagedData: PagedData;
}
