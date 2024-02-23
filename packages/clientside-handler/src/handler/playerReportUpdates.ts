import type { Report, Revocation } from "@fdgl/types";
import type { Action } from "../types";
import { getActionCause } from "../actions/getActionCause";
import { getExecuteCommand, getUndoCommand } from "../utils/getActionCommand";

type Params = {
	// the updates to process, but already pre-filtered with community and category filters
	filteredUpdates: (Report | Revocation)[];
	// the previous reports of the player
	previousReports: Report[];
	actions: Action[];
};

/**
 * Handle player report updates for a single player
 * @returns The actions to execute
 */
export function playerReportUpdates({
	filteredUpdates,
	previousReports,
	actions,
}: Params): string[] | null {
	let reportsAfter = [...previousReports];
	const revocations = filteredUpdates.filter(
		(update): update is Revocation => update.isRevoked
	);
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
		const prevCause = getActionCause(previousReports, action);
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
			// the revocation must exist otherwise the report would still be in the list
			// and not be revoked (so the null assert is safe here)
			const revocation = revocations.find(
				(revocation) => revocation.id === prevCause.id
			);
			// add an undo command
			commandsToRun.push(getUndoCommand(action, revocation!));
		} else {
			// the revocation must exist otherwise the report would still be in the list
			// and not be revoked (so the null assert is safe here)
			const revocation = revocations.find(
				(revocation) => revocation.id === prevCause.id
			);

			// add an undo command
			commandsToRun.push(getUndoCommand(action, revocation!));
			// add an execution command
			commandsToRun.push(getExecuteCommand(action, newCause));
		}
	}

	return commandsToRun;
}
