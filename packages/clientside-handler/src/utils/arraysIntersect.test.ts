// arraysIntersect.test.js
import { arraysIntersect } from "./arraysIntersect";
import { expect, test, describe } from "bun:test";

describe("arraysIntersect", () => {
	test("Expect two empty arrays do not intersect", () => {
		expect(arraysIntersect([], [])).toBe(false);
	});

	test("Expect two arrays with two different contents to not intersect", () => {
		const arrayOne = [1, 2, 3, 4, 5];
		const arrayTwo = [10, 20, 30, 40, 50];
		expect(arraysIntersect(arrayOne, arrayTwo)).toBe(false);
	});

	test("Expect the same input array to intersect", () => {
		const arrayOne = [1, 2, 3, 4, 5];
		expect(arraysIntersect(arrayOne, arrayOne)).toBe(true);
	});

	test("Expect two different arrays with one shared element to intersect", () => {
		const arrayOne = [1, 2, 3, 4];
		const arrayTwo = [6, 7, 8, 9];
		expect(arraysIntersect(arrayOne, arrayTwo)).toBe(false);
		arrayOne.push(5);
		arrayTwo.push(5);
		expect(arraysIntersect(arrayOne, arrayTwo)).toBe(true);
	});
});
