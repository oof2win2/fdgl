import type { Report, Revocation } from "@fdgl/types";
import type { DatabaseAdapter } from "../database-adapter";
import type { LogAdapter } from "../log-adapter";
import type { ServerAdapter } from "../server-handler";
import { arraysIntersect } from "../utils/arraysIntersect";
import { playerReportUpdates } from "./playerReportUpdates";

type Params = {
	updates: (Report | Revocation)[];
	db: DatabaseAdapter;
	logger?: LogAdapter;
	servers: ServerAdapter;
};

export async function onReportUpdates({
	updates,
	db,
	logger,
	servers,
}: Params) {
	const followedCommunities = (await db.getFollowedCategories()).map(
		(community) => community.id,
	);
	const followedCategories = (await db.getFollowedCategories()).map(
		(category) => category.id,
	);
	const actions = await db.getActions();

	// we need to group the updates by playername
	const updatesByPlayer = new Map<string, (Report | Revocation)[]>();
	for (const update of updates) {
		const playerReports = updatesByPlayer.get(update.playername) || [];
		playerReports.push(update);
		updatesByPlayer.set(update.playername, playerReports);
	}

	const commands: string[] = [];

	// now we can handle the updates for each player
	for (const [playername, updates] of updatesByPlayer) {
		const filteredUpdates = updates.filter((update) => {
			// if we don't follow the community then ignore the report
			if (!followedCommunities.includes(update.communityId)) return false;

			// get an intersection of the categories we follow and the report's categories
			// if there is one, then we are interested in this report
			const hasIntersection = arraysIntersect(
				update.categoryIds,
				followedCategories,
			);
			if (hasIntersection) return true;
			return false;
		});
		// none of the updates matched our filters, so we just don't process it
		// (but still save it to the db for future reference)
		if (!filteredUpdates.length) continue;

		const previousReports = await db.getPlayerReports(playername);

		const commandsToExecute = playerReportUpdates({
			filteredUpdates,
			previousReports,
			actions,
		});

		// if we got back some commands that should be executed, then we add them to the list
		if (commandsToExecute?.length) commands.push(...commandsToExecute);
	}

	logger?.info(`Executing ${updates.length} commands from report updates.`);

	// now we save the updates to the db
	await db.addReportUpdates(updates);

	// now we save the executed actions to the db
	await db.logExecutedActions(commands);

	// now we execute the actions
	for (const command of commands) {
		await servers.executeAllServers(command);
	}
}
