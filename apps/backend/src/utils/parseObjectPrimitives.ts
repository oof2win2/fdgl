export const parseObjectPrimitives = (obj: URLSearchParams): any => {
	return Object.fromEntries(
		Object.entries(obj).map(([k, v]) => {
			if (typeof v === "object") return [k, parseObjectPrimitives(v)];
			if (!isNaN(Number.parseFloat(v))) return [k, parseFloat(v)];
			if (v === "true") return [k, true];
			if (v === "false") return [k, false];
			if (typeof v === "string") return [k, v];
			return [k, null];
		}),
	);
};
