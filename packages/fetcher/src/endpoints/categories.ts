import type { Category } from "@fdgl/types";
import type { KyInstance } from "ky";

export default class Categories {
	constructor(private readonly fetcher: KyInstance) {}

	async getById(id: string) {
		return await this.fetcher(`/categories/${id}`).json<Category>();
	}

	async getAll() {
		return await this.fetcher("/categories").json<Category[]>();
	}
}
