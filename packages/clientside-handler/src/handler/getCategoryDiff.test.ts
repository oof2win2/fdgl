import { getCategoryDiff } from "./getCategoryDiff";
import { expect, test, describe } from "bun:test";
import { createFakeReport } from "../../test/utils";

describe("getCategoryDiff", () => {
	test("Expect two empty arrays to provide no additions and deletions", () => {
		expect(getCategoryDiff([], [])).toEqual({
			addedCategories: [],
			removedCategories: [],
		});
	});

	test("Expect a removed category to show up as removed", () => {
		const report = createFakeReport();
		expect(getCategoryDiff([report], [])).toEqual({
			addedCategories: [],
			removedCategories: report.categoryIds,
		});
	});

	test("Expect an added category to show up as added", () => {
		const report = createFakeReport();
		expect(getCategoryDiff([], [report])).toEqual({
			addedCategories: report.categoryIds,
			removedCategories: [],
		});
	});
});
