import type {
	Report,
	CreateReport,
	Revocation,
	GetReportFilters,
} from "@fdgl/types";
import type { KyInstance } from "ky";
import type { AuthManager } from "../auth";

export default class Reports {
	constructor(
		private readonly fetcher: KyInstance,
		private auth: AuthManager,
	) {}

	async getById(id: string) {
		return await this.fetcher(`reports/${id}`).json<Report | Revocation>();
	}

	async getFiltered(filters: GetReportFilters = {}) {
		const params = new URLSearchParams();
		for (const id of filters.categoryIds ?? []) {
			params.append("categoryIds", id);
		}
		for (const id of filters.communityIds ?? []) {
			params.append("categoryIds", id);
		}
		if (filters.playername) params.set("playername", filters.playername);
		if (filters.createdSince)
			params.set("createdSince", filters.createdSince.toISOString());
		if (filters.revokedSince)
			params.set("createdSince", filters.revokedSince.toISOString());
		if (filters.updatedSince)
			params.set("createdSince", filters.updatedSince.toISOString());

		return await this.fetcher(`reports?${params.toString()}`).json<
			(Report | Revocation)[]
		>();
	}

	async create(data: CreateReport) {
		return await this.fetcher("reports", {
			method: "post",
			json: data,
			headers: {
				"x-fdgl-apikey": this.auth.getAuth(),
			},
		}).json<{ id: string }>();
	}

	async revoke(id: string) {
		return await this.fetcher(`reports/${id}`, {
			method: "delete",
			headers: {
				"x-fdgl-apikey": this.auth.getAuth(),
			},
		}).json<{ id: string }>();
	}
}
