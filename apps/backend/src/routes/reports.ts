import { AutoRouter, error } from "itty-router";
import * as z from "zod";
import {
	type CommunityAuthorizedRequest,
	communityAuthorize,
} from "$utils/auth";
import { type JSONParsedBody, getJSONBody } from "$utils/jsonBody";
import { AwsV4Signer } from "aws4fetch";
import { db } from "$utils/db";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import type {
	Categories,
	ReportCategory,
	ReportProof,
	Reports,
} from "$types/db-types";
import { ENV } from "$utils/env";
import { qsParse } from "$utils/qs-parser";
import { generateId } from "$utils/id";
import { parseZodIssues } from "$utils/parseZodIssues";

const ReportsRouter = AutoRouter({ base: "/reports" });

const getExtensionForFiletype = (type: ReportProof["filetype"]): string => {
	if (type === "image/jpeg") return ".jpeg";
	if (type === "image/png") return ".png";
	throw new Error("unsupported filetype");
};

const reportProofToUrls = (
	proof: Omit<ReportProof, "reportId">[],
): string[] => {
	return proof.map(
		(item) =>
			`${ENV.S3_BUCKET_URL}/${item.proofId}.${getExtensionForFiletype(
				item.filetype,
			)}`,
	);
};

type ReportWithProofAndCategories = Reports & {
	categories: Omit<ReportCategory, "reportId">[];
	proof: Omit<ReportProof, "reportId">[];
};

const fixReport = (report: ReportWithProofAndCategories) => {
	return {
		...report,
		proof: reportProofToUrls(report.proof),
		categories: report.categories.map((c) => c.categoryId),
	};
};

// GET /:id
// get a report by ID
ReportsRouter.get("/:id", async (req) => {
	const id = req.params.id;
	if (!id) return error(400, "No ID provided.");

	const report = await db
		.selectFrom("Reports")
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

	return fixReport(report);
});

// GET /
// get reports by category, community, and time filters
const getReportsFiltered = z.object({
	categoryIds: z.string().array().optional(),
	communityIds: z.string().array().optional(),
	playername: z.string().optional(),
	createdSince: z.coerce.date(),
	revokedSince: z.coerce.date(),
	updatedSince: z.coerce.date(),
});
ReportsRouter.get("/", async (req) => {
	const searchParams = new URL(req.url).searchParams;
	const params = getReportsFiltered.safeParse(qsParse(searchParams));
	if (!params.success) return error(400, parseZodIssues(params.error));

	const filters = params.data;

	// basic fetching of the reports with their categories
	let query = db
		.selectFrom("Reports")
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
	const fixedReports = results.map((report) => fixReport(report));
	return fixedReports;
});

// POST /
// create a report
const createReportSchema = z.object({
	playername: z.string(),
	description: z.string(),
	createdBy: z.string(),
	// categoryIds: v.array(v.string(), [v.minLength(1), v.maxLength(100)]),
	categoryIds: z.string().array().min(1).max(100),
	proofRequests: z
		.array(
			z.object({
				// filesize must be between 1 byte and 4MB
				// we then transform it to a string for ease of use later
				filesize: z.number().min(1).max(4_000_000),
				filetype: z.enum(["image/jpeg", "image/png"], {
					invalid_type_error:
						"Image content type must be image/jpeg or image/png",
				}),
			}),
		)
		.max(10),
});
ReportsRouter.put<
	CommunityAuthorizedRequest<JSONParsedBody<typeof createReportSchema>>
>("/", communityAuthorize, getJSONBody(createReportSchema), async (req) => {
	const body = req.jsonParsedBody;
	const categories = await db
		.selectFrom("Categories")
		.select("id")
		.where("id", "in", body.categoryIds)
		.execute();
	const categoryIds = categories.map((c) => c.id);
	const invalidCategories = body.categoryIds.filter(
		(c) => !categoryIds.includes(c),
	);
	if (invalidCategories.length)
		return error(400, "Some or all categories provided are invalid");
	const reportId = generateId();
	const reportProofIds = Array.from(
		{
			length: body.proofRequests.length,
		},
		() => generateId(4),
	);

	// now we insert everything into the database
	// we use a transaction so that everything either works or fails
	await db.transaction().execute(async (tx) => {
		await tx
			.insertInto("Reports")
			.values({
				id: reportId,
				playername: body.playername,
				communityId: req.communityId,
				createdAt: new Date(),
				updatedAt: new Date(),
				description: body.description,
				createdBy: body.createdBy,
			})
			.execute();
		await tx
			.insertInto("ReportCategory")
			.values(
				body.categoryIds.map((c) => ({
					reportId,
					categoryId: c,
				})),
			)
			.execute();
	});

	// first we create proof upload URLs
	const reportProofUrls = [];

	// create the aws signer
	const baseR2Url = new URL(ENV.S3_BUCKET_URL);
	// expire the URL in 1 hour
	baseR2Url.searchParams.set("X-Amz-Expires", "3600");

	for (let i = 0; i < body.proofRequests.length; i++) {
		// for every request for proof, we ensure that the image is within our spec
		// we already know that the image filetypes are image/jpeg or image/png
		// and the size of each image is under 8MB
		// for every new proof, we create a URL
		const proofReq = body.proofRequests[i];
		const proofId = reportProofIds[i];

		// the proof pathname is the id of the report, the id of the proof, and the filetype
		baseR2Url.pathname = `/${reportId}.${proofId}.${getExtensionForFiletype(
			proofReq.filetype,
		)}`;
		// baseR2Url.searchParams.set("Content-Length", proofReq.filesize);
		const signer = new AwsV4Signer({
			accessKeyId: ENV.S3_ACCESS_KEY_ID,
			secretAccessKey: ENV.S3_SECRET_ACCESS_KEY,
			url: baseR2Url.toString(),
			method: "PUT",
			// sign the query instead of auth header, we aren't passing them the header
			signQuery: true,
			headers: {
				"Content-Length": proofReq.filesize,
				"Content-Type": proofReq.filetype,
			},
			// sign even the content length and type headers
			allHeaders: true,
		});

		// create a URL to upload the files to with the base being set to whatever made the request here
		const data = await signer.sign();

		reportProofUrls.push(data.url.toString());
	}

	return {
		id: reportId,
		proofURLs: reportProofUrls,
	};
});

// revoke a report
ReportsRouter.delete<CommunityAuthorizedRequest>(
	"/:id",
	communityAuthorize,
	async (req) => {
		const id = req.params.id;

		const report = await db
			.selectFrom("Reports")
			.select(["id", "communityId"])
			.where("id", "=", id)
			.executeTakeFirst();

		if (!report)
			return error(404, {
				message: "This report was not found",
			});
		if (report.communityId !== req.communityId)
			return error(403, {
				message: "This report doesn't belong to your community",
			});

		const revokedAt = new Date();
		await db
			.updateTable("Reports")
			.where("id", "=", id)
			.set({
				revokedAt: revokedAt,
				updatedAt: revokedAt,
			})
			.limit(1)
			.execute();

		return { status: "ok" };
	},
);

export default ReportsRouter;
