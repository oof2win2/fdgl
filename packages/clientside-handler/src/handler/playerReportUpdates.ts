import type { Report, Revocation } from "@fdgl/types";
import type { DatabaseAdapter } from "../database-adapter";
import type { Action } from "../types";
import { arraysIntersect } from "../utils/arraysIntersect";
import { getActionCause } from "../actions/getActionCause";
import { getExecuteCommand } from "../utils/getActionCommand";

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
	// the playername should be the same for all reports
	const reportsBefore = await db.getPlayerReports(
		filteredUpdates[0]!.playername
	);

	let reportsAfter = [...reportsBefore];
	for (const update of filteredUpdates) {
		// if the update is a revocation, we remove the report from the list
		if (update.isRevoked) {
			reportsAfter = reportsAfter.filter((report) => report.id !== update.id);
		} else {
			reportsAfter.push(update);
		}
	}

	// now we have the reports before and after the updates.
	// we can begin processing the actions

	const commandsToRun = [];

	for (const action of actions) {
		const prevCause = getActionCause(reportsBefore, action);
		const newCause = getActionCause(reportsAfter, action);

		// if the cause is null, we don't need to do anything
		// (the action's categories are not in the reports)
		if (prevCause === null && newCause === null) continue;
		// or if the cause is the same, we don't need to do anything
		if (prevCause?.id === newCause?.id) continue;

		// if the prevCause is null then we simply add an execution command
		// if the newCause is null then we simply add an undo command
		// if they differ then we add an undo and an execution command (redo)

		if (prevCause === null) {
			// add an execution command
			commandsToRun.push(getExecuteCommand(action, newCause!));
		} else if (newCause === null) {
			// add an undo command
			commandsToRun.push(getExecuteCommand(action, prevCause));
		} else {
			// add an undo command
			commandsToRun.push(getExecuteCommand(action, prevCause));
			// add an execution command
			commandsToRun.push(getExecuteCommand(action, newCause));
		}
	}

	return commandsToRun;
}
