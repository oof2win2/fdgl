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
		// we filter the reports that we don't follow out
		if (!followedCommunities.includes(update.communityId)) continue;
		// get an intersection of the categories we follow and the report's categories
		// if there is one, then we are interested in this report and we add it to the list
		const hasIntersection = arraysIntersect(
			update.categoryIds,
			followedCategories,
		);
		if (!hasIntersection) continue;

		const playerReports = updatesByPlayer.get(update.playername) || [];
		playerReports.push(update);
		updatesByPlayer.set(update.playername, playerReports);
	}

	const commands: string[] = [];
	const previousPlayerReports = await db.getReports({
		playernames: Array.from(updatesByPlayer.keys()),
	});
	const previousPlayerReportsMap = new Map();
	for (const report of previousPlayerReports) {
		const reports = previousPlayerReportsMap.get(report.playername) || [];
		reports.push(report);
		previousPlayerReportsMap.set(report.playername, reports);
	}

	// now we can handle the updates for each player
	for (const [playername, updates] of updatesByPlayer) {
		const previousReports = previousPlayerReportsMap.get(playername) || [];

		const commandsToExecute = playerReportUpdates({
			filteredUpdates: updates,
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
	await servers.executeAllServers(commands);
}
