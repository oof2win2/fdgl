import { faker } from "@faker-js/faker";
import type { Report } from "@fdgl/types";
import type { Action } from "../src/types";

/**
 * Get a random element from an array
 */
export function randomElementFromArray<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function randomElementsFromArray<T>(arr: T[], count?: number): T[] {
	if (!count) {
		count = Math.floor(Math.random() * arr.length) + 1;
	}
	return (
		arr
			// sort the array randomly
			.sort(() => 0.5 - Math.random())
			// get the first count elements of the randomly sorted array
			.slice(0, count)
	);
}

export function createTimes<F extends (...args: any[]) => any>(
	creator: F,
	params: Parameters<F> | (() => Parameters<F>),
	count: number
): ReturnType<F>[];
export function createTimes<F extends () => any>(
	creator: F,
	count: number
): ReturnType<F>[];
export function createTimes<F extends (...args: any[]) => any>(
	creator: F,
	params: Parameters<F> | (() => Parameters<F>) | number,
	count?: number
): ReturnType<F>[] {
	if (typeof params === "number") {
		return Array.from({ length: params }, () => creator());
	}

	// TODO: remove the type cast when i figure out why `count` can be undefined here according to types - which it can't
	return Array.from({ length: count as number }, () =>
		typeof params === "function" ? creator(...params()) : creator(...params)
	);
}

export function createFDGLId() {
	return faker.string.alphanumeric({ length: 16 });
}
type createFakeReportParams = {
	playername?: string;
	categoryIds?: string[];
	communityIds?: string[];
};
export function createFakeReport(params: createFakeReportParams = {}): Report {
	const communityId = params.communityIds
		? randomElementFromArray(params.communityIds)
		: createFDGLId();
	const categories = params.categoryIds
		? randomElementsFromArray(params.categoryIds)
		: createTimes(createFDGLId, faker.number.int({ max: 25 }));
	const createdAt = faker.date.past().toISOString();
	return {
		id: createFDGLId(),
		playername: params.playername ?? faker.internet.userName(),
		proofLinks: [],
		description: Math.random() > 0.5 ? faker.lorem.sentences() : null,
		communityId,
		categoryIds: categories,
		createdAt,
		createdBy: faker.internet.userName(),
		isRevoked: false,
	};
}

export function createFakeAction(categoryIds: string[]): Action {
	return {
		id: createFDGLId(),
		categoryIds: categoryIds,
		runCommand: "run command {playername}",
		undoCommand: "undo command {playername}",
	};
}
