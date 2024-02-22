import type { Report } from "@fdgl/types";
import { arraysIntersect } from "../utils/arraysIntersect";
import type { Action } from "../types";
import { getCategoryDiff } from "./getCategoryDiff";

// reduce the report to the minimum required fields
// this is mainly for testing purposes so we don't need to generate so many fields
type MinimumReport = Pick<Report, "categoryIds">;

export function getActionDiff(
	reportsBefore: MinimumReport[],
	reportsAfter: MinimumReport[],
	actions: Action[]
) {
	// get the difference of categories from the reports before and after
	// i.e. what categories were removed and added
	const categoryDiff = getCategoryDiff(reportsBefore, reportsAfter);

	const actionsRanBefore = new Set<string>();
	const actionsAfter = new Set<string>();

	// now we can check the actions to see if they should be executed
	for (const action of actions) {
		// if the action's categories intersect with the added categories, then we should execute the action
		const ranBefore = arraysIntersect(
			action.categoryIds,
			categoryDiff.addedCategories
		);
		if (ranBefore) actionsRanBefore.add(action.id);

		// if the action's categories intersect with the removed categories, then we should undo the action
		const ranAfter = arraysIntersect(
			action.categoryIds,
			categoryDiff.removedCategories
		);
		if (ranAfter) actionsAfter.add(action.id);
	}

	// now we find the actions that should be undone (the ones that aren't in the new set)
	// and the actions that should be executed (the ones that aren't in the old set)
	const actionsToExecute = [...actionsRanBefore].filter(
		(action) => !actionsAfter.has(action)
	);
	const actionsToUndo = [...actionsAfter].filter(
		(action) => !actionsRanBefore.has(action)
	);

	return {
		actionsToExecute,
		actionsToUndo,
	};
}
