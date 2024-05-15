import { error } from "itty-router";
import type * as z from "zod";
import type { JSONParsedRequestType, RequestType } from "$types/request";
import { parseZodIssues } from "./parseZodIssues";

export type JSONParsedBody<
	Schema extends z.ZodTypeAny,
	T extends RequestType = RequestType,
> = T & {
	jsonParsedBody: z.infer<Schema>;
};

export function getJSONBody<Schema extends z.ZodTypeAny>(schema: Schema) {
	return async (req: JSONParsedRequestType<z.infer<Schema>>) => {
		try {
			if (req.headers.get("content-type") !== "application/json")
				return error(400);
			const data = schema.safeParse(await req.json());
			if (data.success) {
				req.jsonParsedBody = data.data;
			} else {
				return error(400, parseZodIssues(data.error));
			}
		} catch {
			return error(400, "Invalid JSON body");
		}
	};
}
