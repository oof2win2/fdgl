import type {
	Category,
	CategoryMergedEvent,
	Community,
	CommunityMergedEvent,
	FDGLEvent,
	Report,
} from "@fdgl/types";
import type { DatabaseAdapter, LogAdapter, ServerAdapter } from "..";
import { arraysIntersect } from "../utils/arraysIntersect";
import { playerReportUpdates } from "../handler/playerReportUpdates";

type Params = {
	updates: FDGLEvent[];
	db: DatabaseAdapter;
	logger?: LogAdapter;
	servers: ServerAdapter;
};

export async function systemUpdates(params: Params) {
	const { updates, db, logger, servers } = params;
	const createdCategories: Category[] = [];
	const deletedCategories: string[] = [];
	const mergedCategories: CategoryMergedEvent[] = [];
	const createdCommunities: Community[] = [];
	const deletedCommunities: string[] = [];
	const mergedCommunities: CommunityMergedEvent[] = [];

	// filter them all out
	for (const update of updates) {
		switch (update.eventType) {
			case "categoryCreated":
				createdCategories.push(update.category);
				break;
			case "categoryDeleted":
				deletedCategories.push(update.categoryId);
				break;
			case "categoryMerged":
				mergedCategories.push(update);
				break;
			case "communityCreated":
				createdCommunities.push(update.community);
				break;
			case "communityDeleted":
				deletedCommunities.push(update.communityId);
				break;
			case "communityMerged":
				mergedCommunities.push(update);
				break;
		}
	}

	// save the created ones into the database and do nothing else with them
	await db.addCategories(createdCategories);
	await db.addCommunities(createdCommunities);
	logger?.info(
		`Added ${createdCategories.length} categories and ${createdCommunities.length} communities to the database`,
	);

	// we first establish the list of affected reports by any of the changes
	const affectedCategories = mergedCategories
		.flatMap((merge) => [merge.fromCategoryId, merge.toCategoryId])
		.concat(deletedCategories);
	const affectedCommunities = mergedCommunities
		.flatMap((merge) => [merge.fromCommunityId, merge.toCommunityId])
		.concat(deletedCommunities);
	const affectedReports = await Promise.all([
		db.getReports({ categoryIds: affectedCategories }),
		db.getReports({ communityIds: affectedCommunities }),
	]).then((data) => data[0].concat(data[1]));
	// now we have a list of players that were affected by the changes
	const affectedPlayernames = Array.from(
		new Set(affectedReports.map((report) => report.playername)),
	);

	// now we perform the changes in the database
	const previousReports = await db.getReports({
		playernames: affectedPlayernames,
	});

	const previousReportsByPlayername = new Map<string, Report[]>();
	for (const report of previousReports) {
		const reports = previousReportsByPlayername.get(report.playername) || [];
		reports.push(report);
		previousReportsByPlayername.set(report.playername, reports);
	}

	const reportsToDelete: string[] = [];

	const reportsAfter = previousReports
		.map((report) => {
			// if the community was deleted, we delete the report
			if (deletedCommunities.includes(report.communityId)) {
				// the report should be deleted
				reportsToDelete.push(report.id);
				return null;
			}

			// if the community was merged, we update the report to have the new community
			const mergedCommunity = mergedCommunities.find(
				(merge) => merge.fromCommunityId === report.communityId,
			);
			if (mergedCommunity) {
				// the report should be updated to have the new community
				return {
					...report,
					communityId: mergedCommunity.toCommunityId,
				};
			}

			// if the category was deleted, we update the report to not have the deleted category
			if (arraysIntersect(deletedCategories, report.categoryIds)) {
				// the report should be updated to not have the deleted categories
				return {
					...report,
					categoryIds: report.categoryIds.filter(
						(categoryId) => !deletedCategories.includes(categoryId),
					),
				};
			}

			// if the category was merged, we update the report to have the new category
			if (
				arraysIntersect(
					mergedCategories.map((c) => c.fromCategoryId),
					report.categoryIds,
				)
			) {
				// the report should be updated to have the new category after merging
				const newCategories = report.categoryIds.map((categoryId) => {
					const merged = mergedCategories.find(
						(c) => c.fromCategoryId === categoryId,
					);
					return merged ? merged.toCategoryId : categoryId;
				});
				report.categoryIds = [...new Set(newCategories)];
			}

			// if there are no remaining categories after the merge or delete operation, we delete the report
			if (report.categoryIds.length === 0) {
				reportsToDelete.push(report.id);
				return null;
			}
		})
		.filter((report) => report) as Report[];

	// we group our reports after the changes by playername
	const afterReports = new Map<string, Report[]>();
	for (const report of reportsAfter) {
		const reports = afterReports.get(report.playername) || [];
		reports.push(report);
		afterReports.set(report.playername, reports);
	}

	// we need to modify our actions to have merged categories and communities
	const actions = await db.getActions();
	const modifiedActions = actions.map((action) => {
		for (const categoryId of action.categoryIds) {
			const mergedCategory = mergedCategories.find(
				(merge) => merge.fromCategoryId === categoryId,
			);
			if (mergedCategory) {
				action.categoryIds.push(mergedCategory.toCategoryId);
			}
		}
		return action;
	});

	const commandsToExecute: string[] = [];
	for (const [playername, after] of afterReports) {
		const before = previousReportsByPlayername.get(playername);
		// this shouldn't ever happen so just for type safety
		if (!before) continue;

		const commands = playerReportUpdates({
			filteredUpdates: after,
			previousReports: before,
			actions: modifiedActions,
		});
		if (commands?.length) commandsToExecute.push(...commands);
	}

	const actionsAfterProcess = actions.map((action) => {
		const newCategoryIds = [];
		for (const categoryId of action.categoryIds) {
			// there are three possible situations here
			// 1. the category was deleted
			// 2. the category was merged
			// 3. no change to the category
			const mergedCategory = mergedCategories.find(
				(merge) => merge.fromCategoryId === categoryId,
			);
			if (mergedCategory) {
				// the category was merged, so we only add the new category id to the final list
				newCategoryIds.push(mergedCategory.toCategoryId);
				continue;
			}

			// if the category was deleted, then we skip this category
			if (deletedCategories.includes(categoryId)) {
				continue;
			}

			// finally, if the category was not deleted or merged, we simply let it be
			newCategoryIds.push(categoryId);
		}
		action.categoryIds = newCategoryIds;
		return action;
	});

	logger?.info(
		`Executing ${commandsToExecute.length} commands from system updates.`,
	);

	// first we delete the reports that need to be deleted
	await db.deleteReports(reportsToDelete);
	// then we overwrite the report cateogorizations (communities and categories)
	await db.overwriteReportCategorizations(reportsAfter);
	// then we save the new actions
	await db.alterActionCategories(actionsAfterProcess);
	// then we save the commands
	await db.logExecutedActions(commandsToExecute);
	// and then we execute the commands
	await servers.executeAllServers(commandsToExecute);
}
