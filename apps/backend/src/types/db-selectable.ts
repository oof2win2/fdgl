import type { Selectable } from "kysely";
import type * as DB from "./db-types";

export type AuthKey = Selectable<DB.AuthKey>;
export type Categories = Selectable<DB.Categories>;
export type Communities = Selectable<DB.Communities>;
export type FilterObject = Selectable<DB.FilterObject>;
export type ReportCategory = Selectable<DB.ReportCategory>;
export type ReportProof = Selectable<DB.ReportProof>;
export type Reports = Selectable<DB.Reports>;
export type SystemEvent = Selectable<DB.SystemEvent>;
