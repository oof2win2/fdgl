import type { FDGLEvent } from "@fdgl/types";
import type { KyInstance } from "ky";

export default class Misc {
	constructor(private readonly fetcher: KyInstance) {}

	async getSystemUpdates(since?: Date) {
		let url = "misc/system-updates";
		if (since) url += `?since=${since.toISOString()}`;
		return await this.fetcher(url).json<FDGLEvent>();
	}
}
