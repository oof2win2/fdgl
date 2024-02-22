import type { Report, Revocation } from "@fdgl/types";
import type { DatabaseAdapter } from "../database-adapter";
import type { LogAdapter } from "../log-adapter";
import type { ServerAdapter } from "../server-handler";
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
	const followedCommunities = await db.getFollowedCategories();
	const followedCategories = await db.getFollowedCategories();
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
	for (const [_, updates] of updatesByPlayer) {
		const commandsToExecute = await playerReportUpdates({
			updates,
			db,
			actions,
			followedCommunities: followedCommunities.map((c) => c.id),
			followedCategories: followedCategories.map((c) => c.id),
		});
		if (commandsToExecute) commands.push(...commandsToExecute);
	}

	// now we save the updates to the db
	await db.addReportUpdates(updates);

	// now we save the executed actions to the db
	await db.logExecutedActions(commands);

	// now we execute the actions
	for (const command of commands) {
		await servers.executeAllServers(command);
	}
}
