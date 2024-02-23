import { faker } from "@faker-js/faker";
import type { Report, Revocation } from "@fdgl/types";
import type { Action } from "../src/types";

/**
 * Get a random element from an array
 */
export function randomElementFromArray<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function randomElementsFromArray<T>(arr: T[], count?: number): T[] {
	const amountOfElements = count ?? Math.floor(Math.random() * arr.length) + 1;
	return (
		arr
			// sort the array randomly
			.sort(() => 0.5 - Math.random())
			// get the first count elements of the randomly sorted array
			.slice(0, amountOfElements)
	);
}

// biome-ignore lint/suspicious/noExplicitAny: lazy to fix it and it works
export function createTimes<F extends (...args: any[]) => any>(
	creator: F,
	params: Parameters<F> | (() => Parameters<F>),
	count: number,
): ReturnType<F>[];
// biome-ignore lint/suspicious/noExplicitAny: lazy to fix it and it works
export function createTimes<F extends () => any>(creator: F, count: number): ReturnType<F>[];
// biome-ignore lint/suspicious/noExplicitAny: lazy to fix it and it works
export function createTimes<F extends (...args: any[]) => any>(
	creator: F,
	params: Parameters<F> | (() => Parameters<F>) | number,
	count?: number,
): ReturnType<F>[] {
	if (typeof params === "number") {
		return Array.from({ length: params }, () => creator());
	}

	return Array.from({ length: count as number }, () =>
		typeof params === "function" ? creator(...params()) : creator(...params),
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

export function createRevocation(report: Report): Revocation {
	return {
		...report,
		revokedAt: faker.date.recent().toISOString(),
		isRevoked: true,
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
