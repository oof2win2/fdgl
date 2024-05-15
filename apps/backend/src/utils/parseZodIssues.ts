import type { ZodError } from "zod";

type ErrorSchema = {
	path: string;
	message: string;
};
type ErrorResponse = {
	errors: ErrorSchema[];
};
export function parseZodIssues(error: ZodError): ErrorResponse {
	const issues = error.issues;
	console.log(issues);
	const errors = issues.map((issue) => {
		const fullPath = issue.path.length ? issue.path.join("/") : "/";
		console.log(issue);
		return {
			path: fullPath,
			message: issue.message,
		};
	});
	return {
		errors,
	};
}
