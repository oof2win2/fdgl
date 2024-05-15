import { error } from "itty-router";
import { ENV } from "./env";
import type { RequestType } from "$types/request";
import { db } from "./db";
import type {
	AuthorizedResource,
	JSONBAuthorizedResources,
} from "$types/db-base";

export async function MasterAuthenticate(req: RequestType) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);
	if (authValue !== ENV.MASTER_API_KEY) return error(401);
}

export type GenericAuthorizedRequest<T extends RequestType = RequestType> =
	T & {
		authKeyId: string;
		resources: JSONBAuthorizedResources;
	};
export async function genericAuthorize(req: GenericAuthorizedRequest) {
	const authValue = req.headers.get("x-fdgl-auth");
	if (!authValue) return error(401);

	const auth = await db
		.selectFrom("AuthKey")
		.selectAll()
		.where("apikey", "=", authValue)
		.executeTakeFirst();

	if (!auth) return error(401);

	req.authKeyId = auth.id;
	req.resources = auth.resources;
}

export type CommunityAuthorizedRequest<T extends RequestType = RequestType> =
	GenericAuthorizedRequest<T> & { communityId: string };
export async function communityAuthorize(req: CommunityAuthorizedRequest) {
	const response = await genericAuthorize(req);
	// it returned a valid response and therefore we should pass it down
	if (response) return response;

	const communityId = getCommunityIdResource(req.resources);
	if (!communityId) return error(401);

	req.communityId = communityId;
}

export type FilterAuthorizedRequest<T extends RequestType = RequestType> =
	GenericAuthorizedRequest<T> & { filterId: string };

export async function filterAuthorize(req: FilterAuthorizedRequest) {
	const response = await genericAuthorize(req);
	// it returned a valid response and therefore we should pass it down
	if (response) return response;

	const filterId = getFilterIdResource(req.resources);
	if (!filterId) return error(401);

	req.filterId = filterId;
}

export function getCommunityIdResource(
	resources: JSONBAuthorizedResources,
): string | null {
	for (const resource of resources) {
		if (resource.type === "community") return resource.id;
	}
	return null;
}

export function getFilterIdResource(
	resources: JSONBAuthorizedResources,
): string | null {
	for (const resource of resources) {
		if (resource.type === "filter") return resource.id;
	}
	return null;
}

/**
 * Add an authorized resource to an API key and save it to the database
 */
export async function addResource(
	req: GenericAuthorizedRequest,
	resource: AuthorizedResource,
) {
	const newAuth = req.resources.concat(resource);
	await db
		.updateTable("AuthKey")
		.set({
			resources: newAuth,
		})
		.where("id", "=", req.authKeyId)
		.limit(1)
		.execute();
}
