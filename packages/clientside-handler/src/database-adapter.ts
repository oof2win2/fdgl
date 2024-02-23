import type { Category, Community, Report, Revocation } from "@fdgl/types";
import type {
	Action,
	ActionLog,
	BlacklistEntry,
	IgnorelistEntry,
} from "./types";

/**
 * Filter parameters for the getReports method
 *
 * If a parameter is not provided, it is not used as a filter.
 * All parameters are used as an AND filter.
 */
type GetReportFilters = {
	playernames?: string[];
	communityIds?: string[];
	categoryIds?: string[];
};

export interface DatabaseAdapter {
	// get reports
	getReports(filters?: GetReportFilters): Promise<Report[]>;
	// delete reports from the db
	deleteReports(reportIds: string[]): Promise<void>;

	// overwrite the reports in the database to the new filters
	overwriteReportCategorizations(
		reports: Pick<Report, "id" | "categoryIds" | "communityId">[],
	): Promise<void>;

	getIgnorelistEntries(): Promise<IgnorelistEntry[]>;
	getBlacklistEntries(): Promise<BlacklistEntry[]>;

	// get all actions
	getActions(): Promise<Action[]>;
	// alter the categories of actions
	alterActionCategories(
		actions: Pick<Action, "id" | "categoryIds">[],
	): Promise<void>;
	// log actions as executed at the current date and time
	saveExecutedActions(commands: string[]): Promise<void>;
	// get a list of all actions that have been executed since a certain date
	getExecutedActions(since: Date): Promise<ActionLog[]>;

	getFollowedCategories(): Promise<Category[]>;
	getFollowedCommunities(): Promise<Community[]>;

	// add a report to the database
	addReportUpdates(updates: (Report | Revocation)[]): Promise<void>;
	// add categories to the database
	addCategories(categories: Category[]): Promise<void>;
	// add communities to the database
	addCommunities(communities: Community[]): Promise<void>;

	// delete a category from the database
	deleteCategory(categoryId: string): Promise<void>;
	// delete a community from the database
	deleteCommunity(communityId: string): Promise<void>;
}
