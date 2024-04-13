import { AutoRouter, error } from "itty-router";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import * as v from "valibot";
import type { CF, RequestType } from "../types";
import { type AuthorizedRequest, communityAuthorize } from "../utils/auth";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import { generateId } from "../utils/nanoid";
import { AwsV4Signer } from "aws4fetch";

const ReportsRouter = AutoRouter<RequestType, CF>({ base: "/reports" });

// GET /:id
// get a report by ID
ReportsRouter.get("/:id", async (req, env) => {
	const id = req.params.id;
	if (!id) return error(400, "No ID provided.");
	const report = await env.DB.selectFrom("Reports")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
	return report ?? null;
});

const DateSchema = v.transform(
	v.string([v.isoDateTime("The date is badly formatted.")]),
	(str) => new Date(str),
	[v.custom<Date>((date) => !Number.isNaN(date), "The date is invalid.")],
);

// GET /
// get reports by category, community, and time filters
const getReportsFiltered = v.object({
	// these two are technically optional but getAll returns an array even when no values are present
	categoryIds: v.array(v.string()),
	communityIds: v.array(v.string()),
	createdSince: v.nullable(DateSchema),
	revokedSince: v.nullable(DateSchema),
	updatedSince: v.nullable(DateSchema),
});
ReportsRouter.get("/", async (req, env) => {
	const searchParams = new URL(req.url).searchParams;
	const params = v.parse(getReportsFiltered, {
		categoryIds: searchParams.getAll("categoryIds"),
		communityIds: searchParams.getAll("communityIds"),
		isRevoked: searchParams.getAll("isRevoked"),
		createdSince: searchParams.get("createdSince"),
		revokedSince: searchParams.get("revokedSince"),
		updatedSince: searchParams.get("updatedSince"),
	});

	// basic fetching of the reports with their categories
	let query = env.DB.selectFrom("Reports")
		.selectAll("Reports")
		.select((qb) =>
			jsonArrayFrom(
				qb
					.selectFrom("ReportCategory")
					.select("ReportCategory.categoryId")
					.whereRef("ReportCategory.reportId", "=", "Reports.id"),
			).as("categories"),
		);
	if (params.communityIds.length)
		query = query.where("Reports.communityId", "in", params.communityIds);
	// this mess is basically selecting
	if (params.categoryIds.length)
		query = query.where((wb) =>
			wb(
				"Reports.id",
				"in",
				wb
					.selectFrom("ReportCategory")
					.select("ReportCategory.reportId")
					.where("ReportCategory.categoryId", "in", params.categoryIds),
			),
		);
	if (params.createdSince)
		query = query.where("Reports.createdAt", "<", params.createdSince);
	if (params.revokedSince)
		query = query.where("Reports.revokedAt", "<", params.revokedSince);
	if (params.updatedSince)
		query = query.where("Reports.updatedAt", "<", params.updatedSince);

	const results = await query.execute();
	const fixedCategories = results.map((report) => ({
		...report,
		categories: report.categories.map((c) => c.categoryId),
	}));
	return fixedCategories;
});

// POST /
// create a report
const createReportSchema = v.object({
	playername: v.string(),
	description: v.string(),
	createdBy: v.string(),
	categoryIds: v.array(v.string(), [v.minLength(1), v.maxLength(100)]),
	proofRequests: v.array(
		v.object({
			// filesize must be between 1 byte and 8MB
			// we then transform it to a string for ease of use later
			filesize: v.transform(
				v.number([v.minValue(1), v.maxValue(8_000_000)]),
				(num) => num.toString(),
			),
			filetype: v.picklist(
				["image/jpeg", "image/png"],
				"Image content type must be image/jpeg or image/png",
			),
		}),
		[v.maxLength(10)],
	),
});
ReportsRouter.put<
	AuthorizedRequest<JSONParsedBody<typeof createReportSchema>>,
	CF
>(
	"/",
	communityAuthorize,
	getJSONBody(createReportSchema),
	async (req, env) => {
		const reportId = generateId();
		const body = req.jsonParsedBody;
		// we don't fetch categories from cache here because we need to be 100% sure that they exist
		const categories = (
			await env.DB.selectFrom("Categories")
				.select("id")
				.where("id", "in", body.categoryIds)
				.execute()
		).map((c) => c.id);
		const invalidCategories = body.categoryIds.filter(
			(c) => !categories.includes(c),
		);
		if (invalidCategories.length)
			return error(
				400,
				`Categories ${invalidCategories.join(",")} are invalid`,
			);

		// first we create proof upload URLs
		const reportProofUrls = [];

		// create the aws signer
		const baseR2Url = new URL(
			`https://${env.R2_BUCKET_NAME}.${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
		);
		// expire the URL in 1 hour
		baseR2Url.searchParams.set("X-Amz-Expires", "3600");

		for (const proofReq of body.proofRequests) {
			// for every request for proof, we ensure that the image is within our spec
			// we already know that the image filetypes are image/jpeg or image/png
			// and the size of each image is under 8MB
			// for every new proof, we create a URL
			const proofId = generateId();

			baseR2Url.pathname = `/${proofId}.png`;
			// baseR2Url.searchParams.set("Content-Length", proofReq.filesize);
			const signer = new AwsV4Signer({
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
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

		// now we insert everything into the database
		await env.DB.insertInto("Reports")
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

		return {
			id: reportId,
			proofURLs: reportProofUrls,
		};
	},
);

ReportsRouter.delete<AuthorizedRequest<RequestType>, CF>(
	"/:id",
	communityAuthorize,
	async (req, env) => {
		const id = req.params.id;
		const report = await env.DB.selectFrom("Reports")
			.select("communityId")
			.where("id", "=", id)
			.executeTakeFirst();
		if (!report) return error(404, "Report not found.");
		if (report.communityId !== req.communityId)
			return error(403, "You can't delete this report.");
		const revokedAt = new Date();
		await env.DB.updateTable("Reports")
			.where("id", "=", id)
			.set({
				revokedAt: revokedAt,
				updatedAt: revokedAt,
			})
			.execute();
		return "ok";
	},
);

export default ReportsRouter;
