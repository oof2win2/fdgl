import type { Report } from "@fdgl/types";
import type { Action } from "../types";
import { arraysIntersect } from "../utils/arraysIntersect";

/**
 * Get the difference of categories applied before and after
 */
export function getCategoryDiff(
	reportsBefore: Pick<Report, "categoryIds">[],
	reportsAfter: Pick<Report, "categoryIds">[],
) {
	const categoriesBefore = new Set<string>();
	const categoriesAfter = new Set<string>();

	for (const report of reportsBefore) {
		for (const categoryId of report.categoryIds) {
			categoriesBefore.add(categoryId);
		}
	}
	for (const report of reportsAfter) {
		for (const categoryId of report.categoryIds) {
			categoriesAfter.add(categoryId);
		}
	}

	const addedCategories = new Set<string>();
	const removedCategories = new Set<string>();

	for (const categoryId of categoriesAfter) {
		if (!categoriesBefore.has(categoryId)) {
			addedCategories.add(categoryId);
		}
	}
	for (const categoryId of categoriesBefore) {
		if (!categoriesAfter.has(categoryId)) {
			removedCategories.add(categoryId);
		}
	}

	return {
		addedCategories: [...addedCategories],
		removedCategories: [...removedCategories],
	};
}
