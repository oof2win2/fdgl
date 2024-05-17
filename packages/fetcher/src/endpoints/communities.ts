import type { Community } from "@fdgl/types";
import type { KyInstance } from "ky";

export default class Communities {
	constructor(private readonly fetcher: KyInstance) {}

	async getById(id: string) {
		return await this.fetcher(`/communities/${id}`).json<Community>();
	}

	async getAll() {
		return await this.fetcher("/communities").json<Community[]>();
	}
}
