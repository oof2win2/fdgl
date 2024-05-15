export const qsParse = (
	params: URLSearchParams,
): Record<string, string | string[]> => {
	const obj: Record<string, string | string[]> = {};

	for (const key of Object.keys(params)) {
		const allValues = params.getAll(key);
		if (allValues.length === 1) obj[key] = allValues[0];
		else obj[key] = allValues;
	}

	return obj;
};
