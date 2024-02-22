import { expect, test, describe } from "bun:test";
import {
	createFakeAction,
	createFakeReport,
	createTimes,
} from "../../test/utils";
import { getActionCause } from "./getActionCause";

describe("getActionCause", () => {
	test("Expect to return null if no intersecting reports are provided", () => {
		const action = createFakeAction(["1", "2"]);
		expect(getActionCause([], action)).toBe(null);

		// now with an actual report that still doesn't intersect
		const report = createFakeReport({ categoryIds: ["3", "4"] });
		expect(getActionCause([report], action)).toBe(null);
	});

	test("Expect it to return the only report if only one is provided", () => {
		const action = createFakeAction(["1", "2"]);
		const report = createFakeReport({ categoryIds: ["1", "2"] });
		expect(getActionCause([report], action)).toBe(report);
	});

	test("Expect it to return the oldest report if multiple are provided", () => {
		const action = createFakeAction(["1", "2"]);
		const reports = createTimes(
			createFakeReport,
			[{ categoryIds: ["1", "2"] }],
			5
		);
		// we alter the createdAt of each report
		const oldestReport = reports[0];
		oldestReport.createdAt = new Date(0).toISOString();
		reports[1].createdAt = new Date(1000).toISOString();
		reports[2].createdAt = new Date(2000).toISOString();
		reports[3].createdAt = new Date(3000).toISOString();
		reports[4].createdAt = new Date(4000).toISOString();

		// now shuffle the array
		reports.sort(() => Math.random() - 0.5);

		expect(getActionCause(reports, action)).toBe(oldestReport);
	});

	test("Expect it to return the later report if earlier reports are not valid within the action", () => {
		const action = createFakeAction(["1", "2"]);
		const oldReport = createFakeReport({ categoryIds: ["3", "4"] });
		const newReport = createFakeReport({ categoryIds: ["1", "2"] });

		oldReport.createdAt = new Date(5000).toISOString();
		newReport.createdAt = new Date(10_000).toISOString();
		const reports = [oldReport, newReport];

		expect(getActionCause(reports, action)).toBe(newReport);
	});
});
