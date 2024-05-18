import { db } from "./db";
import { fdgl } from "./fdgl";

export async function getFilterObject(guildId: string) {
	let guildConfig = await db
		.selectFrom("GuildConfig")
		.selectAll()
		.where("id", "=", guildId)
		.executeTakeFirst();

	if (!guildConfig || !guildConfig.filterObjectId) {
		// if there is no guild config, we create it first
		const filterObjectId = await fdgl.communities.createFilterObject([], []);

		// upsert the guild config if we had previous values present
		guildConfig = {
			...guildConfig,
			id: guildId,
			filterObjectId,
			communityId: null,
		};
		// upsert the guild config, if it exists but without a filter object then we
		// only set the filter object ID
		await db
			.insertInto("GuildConfig")
			.values(guildConfig)
			.onConflict((cb) => cb.column("id").doUpdateSet({ filterObjectId }))
			.execute();
	}

	// biome-ignore lint/style/noNonNullAssertion: we are guaranteed to have a filter object id at this point
	const filterObjectId = guildConfig.filterObjectId!;

	const filterObject = await fdgl.filters.getById(filterObjectId);
	if (!filterObject) throw new Error("Filter object not found");
	return filterObject;
}
