import { generateId } from "../utils/generateId";
import { datePlus } from "itty-time";
import type { CustomEnv } from "../types";

type CreateCommunityParams = {
	name: string;
	contact: string;
};

export class Communities {
	constructor(protected env: CustomEnv) {}

	/**
	 * Get a single community by its ID
	 * @param id ID of the community
	 */
	async getCommunity(id: string) {
		const community = await this.env.DB.selectFrom("Communities")
			.selectAll()
			.where("id", "=", id)
			.executeTakeFirst();
		return community ?? null;
	}

	/**
	 * Get all communities
	 */
	async getAllCommunities() {
		const communities = await this.env.DB.selectFrom("Communities")
			.selectAll()
			.execute();
		return communities;
	}

	/**
	 * Create a community. Master API method
	 */
	async createCommunity(data: CreateCommunityParams) {
		const communityId = generateId();
		const expiry = datePlus("365 days");
		const apikey = generateId(32);

		// TODO: validation that contact is a discord user
		await this.env.DB.insertInto("Communities")
			.values({
				id: communityId,
				contact: data.contact,
				name: data.name,
			})
			.execute();
		await this.env.DB.insertInto("Authorization")
			.values({
				apikey: apikey,
				communityId,
				expiresAt: expiry,
			})
			.execute();

		await this.env.DB.insertInto("SystemEvent")
			.values({
				createdAt: new Date(),
				data: {
					type: "communityCreation",
					communityId,
				},
			})
			.execute();

		return {
			id: communityId,
			apikey,
		};
	}

	/**
	 * Merge two communities. Master API method
	 * @param source The community that is "deleted"
	 * @param target The community all of the reports are attributed to
	 */
	async mergeCommunities(source: string, target: string) {
		throw new Error("Unimplemented");

		await this.env.DB.insertInto("SystemEvent")
			.values({
				createdAt: new Date(),
				data: {
					type: "communityMerge",
					sourceId: source,
					targetId: destination,
				},
			})
			.execute();
	}

	/**
	 * Get a filter object by it's ID
	 */
	async getFilterObject(id: string) {
		const obj = await this.env.DB.selectFrom("FilterObject")
			.selectAll()
			.where("id", "=", id)
			.executeTakeFirst();
		if (!obj) return null;
		const filter = {
			id: obj.id,
			filteredCommunities: Object.keys(obj.filteredCommunities),
			filteredCategories: Object.keys(obj.filteredCategories),
		};
		return filter;
	}

	/**
	 * Create a filter object
	 */
	async createFilterObject(
		communityFilters: string[],
		categoryFilters: string[],
	) {
		const id = generateId();
		const arrayToObject = (ids: string[]) =>
			ids.reduce<Record<string, boolean>>((record, current) => {
				record[current] = true;
				return record;
			}, {});
		await this.env.DB.insertInto("FilterObject")
			.values({
				id,
				filteredCommunities: JSON.stringify(arrayToObject(communityFilters)),
				filteredCategories: JSON.stringify(arrayToObject(categoryFilters)),
			})
			.execute();
		return id;
	}

	/**
	 * Update a filter object by ID
	 */
	async updateFilterObject(
		id: string,
		communityFilters: string[],
		categoryFilters: string[],
	) {
		const arrayToObject = (ids: string[]) =>
			ids.reduce<Record<string, boolean>>((record, current) => {
				record[current] = true;
				return record;
			}, {});

		await this.env.DB.updateTable("FilterObject")
			.where("id", "=", id)
			.set({
				filteredCommunities: JSON.stringify(arrayToObject(communityFilters)),
				filteredCategories: JSON.stringify(arrayToObject(categoryFilters)),
			})
			.execute();

		return "ok";
	}
}
