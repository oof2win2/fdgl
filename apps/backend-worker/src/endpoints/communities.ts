import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { BaseEndpoint } from "./base";
import { generateId } from "../utils/generateId";
import { datePlus } from "itty-time";

type CreateCommunityParams = {
	name: string;
	contact: string;
};

export class Communities extends BaseEndpoint {
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
	}
}
