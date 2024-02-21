import type { Report } from "@fdgl/types";
import type { DatabaseAdapter } from "../database-adapter";
import { arraysIntersect } from "../utils/arraysIntersect";
import { getCategoryDiff } from "./getActionDiff";
import type { ServerAdapter } from "../server-handler";
import { getExecuteCommand } from "../utils/getActionCommand";

export async function onReportCreated(
	report: Report,
	db: DatabaseAdapter,
	servers: ServerAdapter
) {
	// if we don't follow the community then ignore the report
	const followedCommunities = await db.getFollowedCommunities();
	if (
		!followedCommunities.some(
			(community) => community.id === report.communityId
		)
	)
		return;

	// if we don't follow any of the categories then ignore the report
	const followedCategories = await db.getFollowedCategories();
	if (
		!arraysIntersect(
			followedCategories.map((category) => category.id),
			report.categoryIds
		)
	)
		return;

	const playerReports = await db.getPlayerReports(report.playername);

	const categoryDiff = getCategoryDiff(playerReports, [
		...playerReports,
		report,
	]);

	if (categoryDiff.addedCategories.length === 0) {
		await db.addReport(report);
		return;
	}
	const actions = await db.getActions();
	const actionIDsToApply = new Set<string>();
	actions.forEach((action) => {
		// apply the action if the added categories intersect with the action's categories
		const shouldApply = arraysIntersect(
			action.categoryIds,
			categoryDiff.addedCategories
		);
		if (shouldApply) actionIDsToApply.add(action.id);
	});
	const actionsToApply = actions.filter((action) =>
		actionIDsToApply.has(action.id)
	);

	// all necessary actions have been applied
	if (actionsToApply.length === 0) {
		await db.addReport(report);
		return;
	}

	// create the commands and execute them
	const commands = actionsToApply.map((action) =>
		getExecuteCommand(action, report)
	);
	for (const command of commands) {
		await servers.executeAllServers(command);
	}
	// save the report as handled
	await db.addReport(report);
	// log the actions as executed
	await db.logExecutedActions(commands);
	return;
}
