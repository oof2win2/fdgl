import type { Category, FilterObject, UpsertFilterObject } from "@fdgl/types";
import type { KyInstance } from "ky";
import type { AuthManager } from "../auth";

export default class Filters {
	constructor(
		private readonly fetcher: KyInstance,
		private auth: AuthManager,
	) {}

	async getById(id: string) {
		return await this.fetcher(`filters/${id}`).json<FilterObject>();
	}

	async upsert(filter: UpsertFilterObject) {
		return await this.fetcher("filters", {
			method: "post",
			json: filter,
			headers: {
				"x-fdgl-apikey": this.auth.getAuth(),
			},
		}).json<{ id: string }>();
	}
}
