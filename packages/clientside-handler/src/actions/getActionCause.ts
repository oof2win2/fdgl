import type { Report } from "@fdgl/types";
import type { Action } from "../types";

export function getActionCause(
	reports: Report[],
	action: Action
): Report | null {
	// filter the reports to the ones that have the action's categories
	const filteredReports = reports.filter((report) =>
		report.categoryIds.some((category) => action.categoryIds.includes(category))
	);
	if (filteredReports.length === 0) return null;

	// now we get the report that was created first
	return filteredReports.reduce((prev, current) =>
		prev.createdAt < current.createdAt ? prev : current
	);
}
