import type { Report } from "@fdgl/types";
import type { Action } from "../types";
import { arraysIntersect } from "../utils/arraysIntersect";

/**
 * Get the oldest report that is valid for a given action
 */
export function getOldestReportForAction(
	reports: Report[],
	action: Action
): Report | null {
	// get the reports that match the action's categories
	const filteredReports = reports.filter((report) =>
		arraysIntersect(report.categoryIds, action.categoryIds)
	);
	if (filteredReports.length === 0) return null;

	let oldestReport = filteredReports[0];
	for (const report of filteredReports) {
		if (report.createdAt < oldestReport.createdAt) {
			oldestReport = report;
		}
	}
	return oldestReport;
}
