import type { JSONColumnType } from "kysely";

export type JSONBStringBoolRecord = JSONColumnType<Record<string, boolean>>;

export type AuthorizedResource =
	| {
			type: "community";
			id: string;
	  }
	| {
			type: "filter";
			id: string;
	  };
export type JSONBAuthorizedResources = AuthorizedResource[];
