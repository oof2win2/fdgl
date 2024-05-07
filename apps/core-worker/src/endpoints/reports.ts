import { jsonArrayFrom } from "kysely/helpers/sqlite";
import type { ReportProof } from "../types";
import type { CustomEnv, ReportWithProofAndCategories } from "../types";
import { generateId } from "../utils/generateId";

const getExtensionForFiletype = (type: ReportProof["filetype"]): string => {
	if (type === "image/jpeg") return ".jpeg";
	if (type === "image/png") return ".png";
	throw new Error("unsupported filetype");
};

const reportProofToUrls = (
	proof: Omit<ReportProof, "reportId">[],
	baseurl: string,
): string[] => {
	return proof.map(
		(item) =>
			`${baseurl}/${item.proofId}.${getExtensionForFiletype(item.filetype)}`,
	);
};

const fixReport = (report: ReportWithProofAndCategories, baseurl: string) => {
	return {
		...report,
		proof: reportProofToUrls(report.proof, baseurl),
		categories: report.categories.map((c) => c.categoryId),
	};
};

type GetReportsFilters = {
	categoryIds?: string[];
	communityIds?: string[];
	playername?: string;
	createdSince?: Date;
	revokedSince?: Date;
	updatedSince?: Date;
};

type ReportCreateData = {
	playername: string;
	description: string;
	createdBy: string;
	categoryIds: string[];
	/**
	 * The number of proof objects the requester intends to upload. The proof requests should already be checked
	 * to match filetype and filesize requirements prior to this function
	 */
	proofRequestCount: number;
};

export class Reports {
	constructor(protected env: CustomEnv) {}

	/**
	 * Get a single report by its ID
	 * @param id ID of the report
	 */
	async getReport(id: string) {
		const report = await this.env.DB.selectFrom("Reports")
			.selectAll()
			.select((qb) => [
				jsonArrayFrom(
					qb
						.selectFrom("ReportCategory")
						.select("ReportCategory.categoryId")
						.where("ReportCategory.reportId", "=", id),
				).as("categories"),
				jsonArrayFrom(
					qb
						.selectFrom("ReportProof")
						.select(["ReportProof.proofId", "ReportProof.filetype"])
						.where("ReportProof.reportId", "=", id),
				).as("proof"),
			])
			.where("Reports.id", "=", id)
			.executeTakeFirst();

		if (!report) return null;
		return fixReport(report, this.env.R2_BUCKET_PUBLIC_BASEURL);
	}

	/**
	 * Get multiple reports filtered by communities, categories, or creation/update dates
	 */
	async getReports(filters: GetReportsFilters) {
		// basic fetching of the reports with their categories
		let query = this.env.DB.selectFrom("Reports")
			.selectAll("Reports")
			.select((qb) => [
				jsonArrayFrom(
					qb
						.selectFrom("ReportCategory")
						.select("ReportCategory.categoryId")
						.whereRef("ReportCategory.reportId", "=", "Reports.id"),
				).as("categories"),
				jsonArrayFrom(
					qb
						.selectFrom("ReportProof")
						.select(["ReportProof.proofId", "ReportProof.filetype"])
						.whereRef("ReportProof.reportId", "=", "Reports.id"),
				).as("proof"),
			]);
		if (filters.playername)
			query = query.where("Reports.playername", "=", filters.playername);
		if (filters.communityIds?.length)
			query = query.where("Reports.communityId", "in", filters.communityIds);
		// this mess is basically selecting matching categories
		if (filters.categoryIds?.length)
			query = query.where((wb) =>
				wb(
					"Reports.id",
					"in",
					wb
						.selectFrom("ReportCategory")
						.select("ReportCategory.reportId")
						.where(
							"ReportCategory.categoryId",
							"in",
							filters.categoryIds as string[],
						),
				),
			);
		if (filters.createdSince)
			query = query.where("Reports.createdAt", "<", filters.createdSince);
		if (filters.revokedSince)
			query = query.where("Reports.revokedAt", "<", filters.revokedSince);
		if (filters.updatedSince)
			query = query.where("Reports.updatedAt", "<", filters.updatedSince);

		const results = await query.execute();
		const fixedCategories = results.map((report) =>
			fixReport(report, this.env.R2_BUCKET_PUBLIC_BASEURL),
		);
		return fixedCategories;
	}

	/**
	 * Create a report for a community
	 * @param data Data to create the report with
	 * @param communityId The ID of the community creating the report
	 * @returns ID of the created report
	 */
	async createReport(data: ReportCreateData, communityId: string) {
		const categories = (
			await this.env.DB.selectFrom("Categories")
				.select("id")
				.where("id", "in", data.categoryIds)
				.execute()
		).map((c) => c.id);
		const invalidCategories = data.categoryIds.filter(
			(c) => !categories.includes(c),
		);
		if (invalidCategories.length) return "invalidCategories";

		const reportId = generateId();

		// now we insert everything into the database
		await this.env.DB.insertInto("Reports")
			.values({
				id: reportId,
				playername: data.playername,
				communityId: communityId,
				createdAt: new Date(),
				updatedAt: new Date(),
				description: data.description,
				createdBy: data.createdBy,
			})
			.execute();
		await this.env.DB.insertInto("ReportCategory")
			.values(
				data.categoryIds.map((c) => ({
					reportId,
					categoryId: c,
				})),
			)
			.execute();

		const generatedProofIds = [];
		for (let i = 0; i < data.proofRequestCount; i++) {
			const proofId = generateId(4);
			generatedProofIds.push(proofId);
		}

		return {
			id: reportId,
			proofIds: generatedProofIds,
		};
	}

	/**
	 * Revoke a report
	 * @param id ID of the report to revoke
	 * @param communityId ID of the community requesting the revocation
	 * @returns A status of the action which was performed
	 */
	async revokeReport(id: string, communityId: string) {
		const report = await this.env.DB.selectFrom("Reports")
			.select(["id", "communityId"])
			.where("id", "=", id)
			.executeTakeFirst();

		if (!report) return "notFound";
		if (report.communityId !== communityId) return "noAccess";

		// change the report to revoked
		const revokedAt = new Date();
		await this.env.DB.updateTable("Reports")
			.where("id", "=", id)
			.set({
				revokedAt: revokedAt,
				updatedAt: revokedAt,
			})
			.limit(1)
			.execute();
		return "ok";
	}
}
