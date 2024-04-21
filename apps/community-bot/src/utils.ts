import type { APIInteractionResponse } from "discord-api-types/v10";

export function hexStringToUint8Array(hex: string) {
	const bytes = [];
	for (let i = 0; i < hex.length; i += 2) {
		const byte = hex.slice(i, i + 2);
		bytes.push(Number.parseInt(byte, 16));
	}
	return new Uint8Array(bytes);
}

function concatUint8Array(buf: Uint8Array, buf2: Uint8Array): Uint8Array {
	const newbuf = new Uint8Array(buf.length + buf2.length);
	newbuf.set(buf);
	newbuf.set(buf2, buf.length);
	return newbuf;
}

export async function verifyDiscordInteraction(
	rawBody: Uint8Array,
	signature: Uint8Array,
	time: Uint8Array,
	clientPublicKey: Uint8Array,
): Promise<boolean> {
	try {
		const dataToVerify = concatUint8Array(time, rawBody);
		const key = await crypto.subtle.importKey(
			"raw",
			clientPublicKey,
			"Ed25519",
			false,
			["verify"],
		);
		const verified = await crypto.subtle.verify(
			"Ed25519",
			key,
			signature,
			dataToVerify,
		);
		return verified;
	} catch (ex) {
		return false;
	}
}
