import {
	type BaseSchema,
	safeParse,
	type Output,
	type SchemaIssues,
} from "valibot";
import { error } from "itty-router";
import type { JSONParsedRequestType, RequestType } from "../types";

type ErrorSchema = {
	path: string;
	message: string;
};
type ErrorResponse = {
	errors: ErrorSchema[];
};
function parseIssues(issues: SchemaIssues): ErrorResponse {
	const errors = issues.map((issue) => {
		const fullPath = issue.path
			? issue.path.map((item) => item.key).join("/")
			: "/";
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

export type JSONParsedBody<
	Schema extends BaseSchema,
	T extends RequestType = RequestType
> = T & {
	jsonParsedBody: Output<Schema>;
};

export function getJSONBody<Schema extends BaseSchema>(validator: Schema) {
	return async (oldReq: RequestType) => {
		const req = oldReq as JSONParsedRequestType<Output<Schema>>;
		try {
			if (req.headers.get("content-type") !== "application/json")
				return error(400);
			const data = safeParse(validator, await req.json());
			if (data.success) {
				req.jsonParsedBody = data.output;
			} else {
				return error(400, parseIssues(data.issues));
			}
		} catch {
			return error(400, "Invalid JSON body");
		}
	};
}
