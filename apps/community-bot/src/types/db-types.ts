import type { APIEmbedField } from "discord-api-types/v10";
import type { ColumnType, JSONColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type GuildConfig = {
	id: string;
	filterObjectId: string | null;
	communityId: string | null;
};
export type PagedData = {
	id: string;
	/**
	 * @kyselyType(APIEmbedField[])
	 */
	data: APIEmbedField[];
	currentPage: number;
	/**
	 * @kyselyType(Date)
	 */
	expiresAt: Date;
};
export type ReportCreation = {
	/**
	 * the ID of the report creation process
	 */
	id: string;
	playername: string;
	/**
	 * JSONB object of category filters
	 * @kyselyType(JSONColumnType<Array<string>>)
	 */
	categories: JSONColumnType<Array<string>> | null;
	/**
	 * JSONB object of community filters
	 * @kyselyType(JSONColumnType<Array<string>>)
	 */
	proofLinks: JSONColumnType<Array<string>> | null;
	description: string;
	/**
	 * @kyselyType(Date)
	 */
	expiresAt: Date;
};
export type DB = {
	GuildConfig: GuildConfig;
	PagedData: PagedData;
	ReportCreation: ReportCreation;
};
