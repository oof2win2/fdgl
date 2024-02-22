import type { Report, Revocation } from "@fdgl/types";
import type { DatabaseAdapter } from "../database-adapter";
import type { LogAdapter } from "../log-adapter";
import type { ServerAdapter } from "../server-handler";
import type { Action } from "../types";
import { arraysIntersect } from "../utils/arraysIntersect";
import { getCategoryDiff } from "./getCategoryDiff";
import { getActionDiff } from "./getActionDiff";

type Params = {
	updates: (Report | Revocation)[];
	db: DatabaseAdapter;
	followedCommunities: string[];
	followedCategories: string[];
	actions: Action[];
};

/**
 * Handle player report updates for a single player
 * @returns The actions to execute
 */
export async function playerReportUpdates({
	updates,
	db,
	followedCategories,
	followedCommunities,
	actions,
}: Params): Promise<string[] | null> {
	// first check if the player is the same for all updates, else throw
	const playername = updates[0].playername;
	if (updates.some((update) => update.playername !== playername)) {
		throw new Error("All updates must be for the same player");
	}

	// we need to filter out the updates that we are interested in for processing
	const filteredUpdates = updates.filter((update) => {
		// if we don't follow the community then ignore the report
		if (!followedCommunities.includes(update.communityId)) return false;

		// get an intersection of the categories we follow and the report's categories
		// if there is one, then we are interested in this report
		const hasIntersection = arraysIntersect(
			update.categoryIds,
			followedCategories
		);
		if (hasIntersection) return true;
		return false;
	});

	// there were no updates we are interested in, so we can return early
	// since the reports don't match our filters, none of the updates are to be saved
	if (filteredUpdates.length === 0) return null;

	// now we fetch all of the player's preexisting reports
	const reportsBefore = await db.getPlayerReports(playername);

	let reportsAfter = [...reportsBefore];
	for (const update of filteredUpdates) {
		// if the update is a revocation, we remove the report from the list
		if (update.isRevoked) {
			reportsAfter = reportsAfter.filter((report) => report.id !== update.id);
		} else {
			reportsAfter.push(update);
		}
	}

	// get the list of actions that should be executed and undone
	const actionDiff = getActionDiff(reportsBefore, reportsAfter, actions);
	// then get the list of commands to execute
	const commandsToExexute: string[] = [];
	for (const actionID of actionDiff.actionsToUndo) {
		const action = actions.find((action) => action.id === actionID);
		if (!action) {
			throw new Error(`Action with id ${actionID} not found`);
		}
		commandsToExexute.push(
			action.undoCommand.replaceAll("{playername}", playername)
		);
	}
	for (const actionID of actionDiff.actionsToExecute) {
		const action = actions.find((action) => action.id === actionID);
		if (!action) {
			throw new Error(`Action with id ${actionID} not found`);
		}
		commandsToExexute.push(
			action.runCommand.replaceAll("{playername}", playername)
		);
	}
	return commandsToExexute;
}
