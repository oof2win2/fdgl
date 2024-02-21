import type { Category, Community, Report } from "@fdgl/types";
import type {
	Action,
	ActionLog,
	BlacklistEntry,
	IgnorelistEntry,
} from "./types";

export interface DatabaseAdapter {
	// get all reports in the database
	getAllReports(): Promise<Report[]>;
	// get reports but only for a single player
	getPlayerReports(playername: string): Promise<Report[]>;

	getIgnorelistEntries(): Promise<IgnorelistEntry[]>;
	getBlacklistEntries(): Promise<BlacklistEntry[]>;

	// get all actions
	getActions(): Promise<Action[]>;
	// log actions as executed at the current date and time
	logExecutedActions(commands: string[]): Promise<void>;
	// get a list of all actions that have been executed since a certain date
	getExecutedActions(since: Date): Promise<ActionLog[]>;

	getFollowedCategories(): Promise<Category[]>;
	getFollowedCommunities(): Promise<Community[]>;

	// add a report to the database
	addReport(report: Report): Promise<void>;
	// add a category to the database
	addCategory(category: Category): Promise<void>;
	// add a community to the database
	addCommunity(community: Community): Promise<void>;

	// delete a report from the database
	deleteReport(reportId: string): Promise<void>;
	// delete a category from the database
	deleteCategory(categoryId: string): Promise<void>;
	// delete a community from the database
	deleteCommunity(communityId: string): Promise<void>;
}
