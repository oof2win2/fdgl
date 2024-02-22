import { expect, test, describe } from "bun:test";
import { getActionDiff } from "./getActionDiff";
import {
	createFDGLId,
	createFakeAction,
	createFakeReport,
	createTimes,
} from "../../test/utils";

describe("getActionDiff", () => {
	test("Expect no actions to be executed or undone if no categories are added or removed", () => {
		const categoryIDs = createTimes(createFDGLId, 25);
		const reportsBefore = categoryIDs.map((id) => ({ categoryIds: [id] }));
		const reportsAfter = [...reportsBefore];
		const actions = createTimes(createFakeAction, [categoryIDs], 5);
		const diff = getActionDiff(reportsBefore, reportsAfter, actions);
		expect(diff.actionsToExecute).toEqual([]);
		expect(diff.actionsToUndo).toEqual([]);
	});

	test("Expect actions to be executed if categories are added", () => {
		const categoryIDs = createTimes(createFDGLId, 25);
		const reportsAfter = categoryIDs.map((id) => ({ categoryIds: [id] }));
		const actions = createTimes(createFakeAction, [categoryIDs], 5);
		const diff = getActionDiff([], reportsAfter, actions);
		expect(diff.actionsToExecute).toEqual(actions.map((action) => action.id));
		expect(diff.actionsToUndo).toEqual([]);
	});

	test("Expect actions to be undone if categories are removed", () => {
		const categoryIDs = createTimes(createFDGLId, 25);
		const reportsBefore = categoryIDs.map((id) => ({ categoryIds: [id] }));
		const actions = createTimes(createFakeAction, [categoryIDs], 5);
		const diff = getActionDiff(reportsBefore, [], actions);
		expect(diff.actionsToExecute).toEqual([]);
		expect(diff.actionsToUndo).toEqual(actions.map((action) => action.id));
	});

	test("Expect no changes if the same categories are added and removed", () => {
		const categoryIDs = createTimes(createFDGLId, 25);
		const actions = createTimes(createFakeAction, [categoryIDs], 5);
		const categoriesBefore = categoryIDs.map((id) => ({ categoryIds: [id] }));
		const categoriesAfter = [...categoriesBefore];
		// shuffle the array (i.e. they got revoked and others got created instead)
		categoriesAfter.sort(() => Math.random() - 0.5);
		const diff = getActionDiff(categoriesBefore, categoriesAfter, actions);
		expect(diff.actionsToExecute).toEqual([]);
		expect(diff.actionsToUndo).toEqual([]);
	});
});
