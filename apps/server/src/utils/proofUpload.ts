import { datePlus } from "itty-time";
import type { CustomEnv, RequestType } from "../types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function createUploadUrl(
	reportId: string,
	proofId: string,
	baseRequestUrl: string,
	env: CustomEnv,
): Promise<URL> {
	// create a signing key for verifying the proof URLs
	const secretKeyData = encoder.encode(env.R2_SIGNING_SECRET);
	const key = await crypto.subtle.importKey(
		"raw",
		secretKeyData,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const urlToUpload = new URL(
		`/reports/${reportId}/proof/${proofId}`,
		baseRequestUrl,
	);

	const expiresAt = datePlus("1 hour").toISOString();

	urlToUpload.searchParams.set("expiresAt", expiresAt);

	// sign the report ID, proof ID and expires at onto the request
	const dataToSign = `${reportId}-${proofId}-${expiresAt}`;
	const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(dataToSign));

	const base64mac = decoder.decode(mac);
	urlToUpload.searchParams.set("verify", base64mac);

	return urlToUpload;
}

export async function verifyUploadUrl(
	req: RequestType,
	env: CustomEnv,
): Promise<boolean> {
	const url = new URL(req.url);

	const receivedMac = url.searchParams.get("hmac");
	if (!receivedMac) return false;
	const recv = encoder.encode(receivedMac);

	const reportId = req.params.reportId;
	const proofId = req.params.proofId;
	const expiresAt = url.searchParams.get("expiresAt");

	if (!expiresAt) return false;

	// if the request's expired at date is in the past, then the request is expired and thus mark it as failed
	if (new Date(expiresAt).valueOf() < Date.now()) return false;

	// create a signing key for verifying the proof URLs
	const secretKeyData = encoder.encode(env.R2_SIGNING_SECRET);
	const key = await crypto.subtle.importKey(
		"raw",
		secretKeyData,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const dataToSign = `${reportId}-${proofId}-${expiresAt}`;

	const verified = await crypto.subtle.verify(
		"HMAC",
		key,
		recv,
		encoder.encode(dataToSign),
	);

	return verified;
}
