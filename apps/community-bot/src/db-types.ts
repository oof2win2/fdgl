import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type GuildConfig = {
    id: string;
    filterObjectId: string | null;
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
export type DB = {
    GuildConfig: GuildConfig;
    PagedData: PagedData;
};
