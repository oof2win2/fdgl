import { AutoRouter, error } from "itty-router";
import * as v from "valibot";
import type { CF, RequestType } from "../types";
import { type AuthorizedRequest, communityAuthorize } from "../utils/auth";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import { AwsV4Signer } from "aws4fetch";

const ReportsRouter = AutoRouter<RequestType, CF>({ base: "/reports" });

const getExtensionForFiletype = (type: "image/jpeg" | "image/png"): string => {
	if (type === "image/jpeg") return ".jpeg";
	if (type === "image/png") return ".png";
	throw new Error("unsupported filetype");
};

// GET /:id
// get a report by ID
ReportsRouter.get("/:id", async (req, env) => {
	const id = req.params.id;
	if (!id) return error(400, "No ID provided.");

	const report = await env.FDGL.reports.getReport(id);

	return report;
});

const DateSchema = v.transform(
	v.string([v.isoDateTime("The date is badly formatted.")]),
	(str) => new Date(str),
	[v.custom<Date>((date) => !Number.isNaN(date), "The date is invalid.")],
);

// GET /
// get reports by category, community, and time filters
const getReportsFiltered = v.object({
	categoryIds: v.optional(v.array(v.string())),
	communityIds: v.optional(v.array(v.string())),
	playername: v.optional(v.string()),
	createdSince: v.optional(DateSchema),
	revokedSince: v.optional(DateSchema),
	updatedSince: v.optional(DateSchema),
});
ReportsRouter.get("/", async (req, env) => {
	const searchParams = new URL(req.url).searchParams;
	const params = v.parse(getReportsFiltered, {
		categoryIds: searchParams.getAll("categoryIds"),
		communityIds: searchParams.getAll("communityIds"),
		playername: searchParams.get("playername"),
		createdSince: searchParams.get("createdSince"),
		revokedSince: searchParams.get("revokedSince"),
		updatedSince: searchParams.get("updatedSince"),
	});

	const reports = await env.FDGL.reports.getReports(params);

	return reports;
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
		const body = req.jsonParsedBody;
		const res = await env.FDGL.reports.createReport(
			{
				playername: body.playername,
				categoryIds: body.categoryIds,
				createdBy: body.createdBy,
				description: body.description,
				proofRequestCount: body.proofRequests.length,
			},
			req.communityId,
		);
		if (res === "invalidCategories")
			return error(400, "Some or all categories provided are invalid");

		// first we create proof upload URLs
		const reportProofUrls = [];

		// create the aws signer
		const baseR2Url = new URL(
			`https://${env.R2_BUCKET_NAME}.${env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
		);
		// expire the URL in 1 hour
		baseR2Url.searchParams.set("X-Amz-Expires", "3600");

		for (let i = 0; i < body.proofRequests.length; i++) {
			// for every request for proof, we ensure that the image is within our spec
			// we already know that the image filetypes are image/jpeg or image/png
			// and the size of each image is under 8MB
			// for every new proof, we create a URL
			const proofReq = body.proofRequests[i];
			const proofId = res.proofIds[i];

			// the proof pathname is the id of the report, the id of the proof, and the filetype
			baseR2Url.pathname = `/${res.id}.${proofId}.${getExtensionForFiletype(
				proofReq.filetype,
			)}`;
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

		return {
			id: res.id,
			proofURLs: reportProofUrls,
		};
	},
);

// revoke a report
ReportsRouter.delete<AuthorizedRequest<RequestType>, CF>(
	"/:id",
	communityAuthorize,
	async (req, env) => {
		const id = req.params.id;

		const status = await env.FDGL.reports.revokeReport(id, req.communityId);

		switch (status) {
			case "noAccess":
				return error(403, {
					message: "This report doesn't belong to your community",
				});
			case "notFound":
				return error(404, {
					message: "This report was not found",
				});
			case "ok":
				return { status: "ok" };
		}
	},
);

export default ReportsRouter;
