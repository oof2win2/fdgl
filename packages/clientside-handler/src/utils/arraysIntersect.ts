/**
 * Check if two arrays have any intersection
 */
export function arraysIntersect<T>(arrayA: T[], arrayB: T[]): boolean {
	return arrayA.some((item) => arrayB.includes(item));
}
