import { Router, error } from "itty-router";
import { object, string } from "valibot";
import type { CF, RequestType } from "../types";
import { type JSONParsedBody, getJSONBody } from "../utils/json-body";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { datePlus } from "itty-time";
import { generateId } from "../utils/nanoid";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { Authorization, Communities, Reports } from "../schema";
import { eq } from "drizzle-orm";

const masterCommunitiesRouter = Router({ base: "/master/communities" });

// PUT /communities
// create community
const createCommunitySchema = object({
	contact: string(),
	name: string(),
});
masterCommunitiesRouter.put<JSONParsedBody<typeof createCommunitySchema>, CF>(
	"/",
	getJSONBody(createCommunitySchema),
	async (req, env) => {
		const communityId = generateId();
		// TODO: validation that contact is a discord user

		const db = drizzle(env.DB);

		db.insert(Communities).values({
			id: communityId,
			contact: req.jsonParsedBody.contact,
			name: req.jsonParsedBody.name,
		});

		const expiry = datePlus("365 days");
		const apikeyId = generateId();
		const apikey = await jwt.sign(
			{
				jti: apikeyId,
				exp: Math.floor(Date.now() / 1000) + 86400,
				sub: communityId,
			},
			env.JWT_SECRET,
		);

		db.insert(Authorization).values({
			id: apikeyId,
			communityId,
			expiresAt: expiry.toISOString(),
		});

		return { id: communityId, apikey };
	},
);

// DELETE /communities/:id
// delete community
masterCommunitiesRouter.delete<RequestType, CF>("/:id", async (req, env) => {
	const id = req.params.id;

	const db = drizzle(env.DB, { schema });

	const community = await db.query.Communities.findFirst({
		where: eq(Communities.id, id),
	});

	if (!community) return error(404, { message: "Community not found" });

	await db.delete(Communities).where(eq(Communities.id, id));
	await db.delete(Reports).where(eq(Reports.communityId, id));

	// TODO: do something with all reports on delete
	return { status: "ok" };
});

export default masterCommunitiesRouter;
