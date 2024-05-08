import { generateId } from "../utils/generateId";
import type { CustomEnv } from "../types";

type CreateCategoryParams = {
	name: string;
	description: string;
};

type UpdateCategoryParams = {
	id: string;
	name: string;
	description: string;
};

export class Misc {
	constructor(protected env: CustomEnv) {}

	/**
	 * Get all system events created after a date
	 */
	async getSystemEvents(createdAfter?: Date) {
		let query = this.env.DB.selectFrom("SystemEvent").selectAll();
		if (createdAfter) {
			query = query.where("createdAt", ">", createdAfter);
		}
		const events = await query.execute();
		return events;
	}
}
