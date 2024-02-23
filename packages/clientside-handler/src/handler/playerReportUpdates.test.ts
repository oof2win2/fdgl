import { describe, expect, test } from "bun:test";
import {
	createFakeAction,
	createFakeReport,
	createRevocation,
	createTimes,
} from "../../test/utils";
import { getExecuteCommand, getUndoCommand } from "../utils/getActionCommand";
import { playerReportUpdates } from "./playerReportUpdates";

describe("playerReportUpdates", () => {
	test("Expect it to return an empty array if no actions are provided", () => {
		const reports = createTimes(
			createFakeReport,
			[{ communityIds: ["3"], categoryIds: ["1"], playername: "bob" }],
			3,
		).map((report, i) => {
			// update the report creation time to be in order
			report.createdAt = new Date(2021, 1, i + 1).toISOString();
			return report;
		});
		// the reports in the array are in order of creation

		const result = playerReportUpdates({
			filteredUpdates: reports.slice(1),
			previousReports: reports.slice(0, 1),
			actions: [],
		});
		// the reports were valid with the filters, but no actions were provided
		expect(result).toEqual([]);
	});

	test("Expect it to do nothing if no updates are provided", () => {
		const categoryIds = ["1"];
		const reports = createTimes(
			createFakeReport,
			[{ communityIds: ["3"], categoryIds, playername: "bob" }],
			3,
		);
		const action = createFakeAction(categoryIds);

		const result = playerReportUpdates({
			filteredUpdates: [],
			previousReports: reports,
			actions: [action],
		});
		// the reports were valid with the filters, but no actions were provided
		expect(result).toEqual([]);
	});

	test("Expect it to do nothing if the action was ran even though a new report was created", () => {
		const reports = createTimes(
			createFakeReport,
			[{ communityIds: ["3"], categoryIds: ["1"], playername: "bob" }],
			3,
		).map((report, i) => {
			// update the report creation time to be in order
			report.createdAt = new Date(2021, 1, i + 1).toISOString();
			return report;
		});
		const action = createFakeAction(["1", "2"]);

		const update = createFakeReport({
			communityIds: ["3"],
			categoryIds: ["2"],
			playername: "bob",
		});

		const result = playerReportUpdates({
			filteredUpdates: [update],
			previousReports: reports,
			actions: [action],
		});

		expect(result).toEqual([]);
	});

	test("Expect it to do return an action execution if the action was not yet executed", () => {
		const reports = createTimes(
			createFakeReport,
			[{ communityIds: ["3"], categoryIds: ["1"], playername: "bob" }],
			3,
		);
		const firstAction = createFakeAction(["1"]);
		const secondAction = createFakeAction(["2"]);

		const update = createFakeReport({
			communityIds: ["3"],
			categoryIds: ["2"],
			playername: "bob",
		});

		const result = playerReportUpdates({
			filteredUpdates: [update],
			previousReports: reports,
			actions: [firstAction, secondAction],
		});
		const executionCommand = getExecuteCommand(secondAction, update);
		expect(result).toEqual([executionCommand]);
	});

	test("Expect it to do return an action undo if the action was executed but the report was revoked", () => {
		const report = createFakeReport({
			communityIds: ["3"],
			categoryIds: ["1"],
			playername: "bob",
		});
		const revocation = createRevocation(report);

		const action = createFakeAction(["1"]);

		const result = playerReportUpdates({
			filteredUpdates: [revocation],
			previousReports: [report],
			actions: [action],
		});

		const undoCommand = getUndoCommand(action, revocation);
		expect(result).toEqual([undoCommand]);
	});

	test("Expect it to redo an action if the report was revoked but another valid report exists", () => {
		const reportCreateData = {
			communityIds: ["3"],
			categoryIds: ["1"],
			playername: "bob",
		};
		const report = createFakeReport(reportCreateData);
		const revocation = createRevocation(report);
		const newReport = createFakeReport(reportCreateData);

		// we need the reports to be in certain order
		report.createdAt = new Date(2021, 1, 1).toISOString();
		newReport.createdAt = new Date(2021, 1, 2).toISOString();
		revocation.revokedAt = new Date(2021, 1, 3).toISOString();

		const action = createFakeAction(["1"]);

		const result = playerReportUpdates({
			actions: [action],
			filteredUpdates: [revocation],
			previousReports: [report, newReport],
		});

		const undoCommand = getUndoCommand(action, revocation);
		const executionCommand = getExecuteCommand(action, newReport);
		expect(result).toEqual([undoCommand, executionCommand]);
	});

	test("Expect it to redo an action if the report was revoked and then a new report was created after the revocation", () => {
		const reportCreateData = {
			communityIds: ["3"],
			categoryIds: ["1"],
			playername: "bob",
		};
		const report = createFakeReport(reportCreateData);
		const revocation = createRevocation(report);
		const newReport = createFakeReport(reportCreateData);

		// we need the reports to be in certain order
		report.createdAt = new Date(2021, 1, 1).toISOString();
		revocation.revokedAt = new Date(2021, 1, 2).toISOString();
		newReport.createdAt = new Date(2021, 1, 3).toISOString();

		const action = createFakeAction(["1"]);

		const result = playerReportUpdates({
			actions: [action],
			filteredUpdates: [revocation],
			previousReports: [report, newReport],
		});

		const undoCommand = getUndoCommand(action, revocation);
		const executionCommand = getExecuteCommand(action, newReport);
		expect(result).toEqual([undoCommand, executionCommand]);
	});
});
