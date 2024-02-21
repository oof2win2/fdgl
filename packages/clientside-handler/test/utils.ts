import { faker } from "@faker-js/faker";
import type { Report } from "@fdgl/types";

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

export function generateFDGLId() {
	return faker.string.alphanumeric({ length: 16 });
}

export function createFakeReport(
	playername?: string,
	categoryIds?: string[],
	communityIds?: string[]
): Report {
	const communityId = communityIds
		? randomElementFromArray(communityIds)
		: generateFDGLId();
	const categories = categoryIds
		? randomElementsFromArray(categoryIds)
		: createTimes(generateFDGLId, faker.number.int({ max: 25 }));
	const createdAt = faker.date.past().toISOString();
	return {
		id: generateFDGLId(),
		playername: playername ?? faker.internet.userName(),
		proofLinks: [],
		description: Math.random() > 0.5 ? faker.lorem.sentences() : null,
		communityId,
		categoryIds: categories,
		createdAt,
		updatedAt: createdAt,
		createdBy: faker.internet.userName(),
	};
}
