import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Authorization = {
    id: string;
    communityId: string;
    expiresAt: string;
};
export type Categories = {
    id: string;
    name: string;
    description: string;
};
export type Communities = {
    id: string;
    name: string;
    contact: string;
};
export type ReportCategory = {
    id: Generated<number>;
    reportId: string;
    categoryId: string;
};
export type ReportProof = {
    id: Generated<number>;
    reportId: string;
    proofId: string;
};
export type Reports = {
    id: string;
    playername: string;
    description: string | null;
    communityId: string;
    revokedAt: string | null;
    createdAt: string;
    updatedAt: string;
};
export type DB = {
    Authorization: Authorization;
    Categories: Categories;
    Communities: Communities;
    ReportCategory: ReportCategory;
    ReportProof: ReportProof;
    Reports: Reports;
};
