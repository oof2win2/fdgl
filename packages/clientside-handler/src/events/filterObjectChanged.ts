import type { FilterObject, Report } from "@fdgl/types";
import type { DatabaseAdapter, LogAdapter, ServerAdapter } from "..";
import { playerReportUpdates } from "../handler/playerReportUpdates";

type Params = {
	filterObject: FilterObject;
	db: DatabaseAdapter;
	logger?: LogAdapter;
	servers: ServerAdapter;
};

// handler for when a filter object is changed
export async function filterObjectChanged(params: Params) {
	const { filterObject, db, logger, servers } = params;
	const prevFilteredCategories = await db.getFollowedCategories();
	const prevFilteredCommunities = await db.getFollowedCommunities();

	const previouslyValidReports = await db.getReports({
		categoryIds: prevFilteredCategories.map((c) => c.id),
		communityIds: prevFilteredCommunities.map((c) => c.id),
	});

	const newlyValidReports = await db.getReports({
		categoryIds: filterObject.categoryFilters,
		communityIds: filterObject.communityFilters,
	});

	// get our reports filtered by playername
	const previousByPlayername = new Map<string, Report[]>();
	const newByPlayername = new Map<string, Report[]>();

	const allPlayernames = new Set<string>();

	for (const report of previouslyValidReports) {
		const reports = previousByPlayername.get(report.playername) || [];
		reports.push(report);
		previousByPlayername.set(report.playername, reports);
		allPlayernames.add(report.playername);
	}
	for (const report of newlyValidReports) {
		const reports = newByPlayername.get(report.playername) || [];
		reports.push(report);
		newByPlayername.set(report.playername, reports);
		allPlayernames.add(report.playername);
	}

	// pass it off to the difference function and get back commands to execute
	const commandsToExecute: string[] = [];

	const actions = await db.getActions();
	for (const playername of allPlayernames) {
		const previousReports = previousByPlayername.get(playername) || [];
		const filteredUpdates = newByPlayername.get(playername) || [];

		const commands = playerReportUpdates({
			filteredUpdates,
			previousReports,
			actions,
		});

		if (commands?.length) commandsToExecute.push(...commands);
	}

	logger?.info(
		`Executed ${commandsToExecute.length} commands for filter object change`,
	);

	// first we need to update our followed categories and communities
	await db.setFollowedCategories(filterObject.categoryFilters);
	await db.setFollowedCommunities(filterObject.communityFilters);
	// then we save our commands to the db
	await db.saveExecutedActions(commandsToExecute);
	// and finally execute the commands
	await servers.executeAllServers(commandsToExecute);
}
