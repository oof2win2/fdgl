import {
	InteractionResponseType,
	InteractionType,
	type APIApplicationCommandInteraction,
	type APIInteraction,
	type APIInteractionResponse,
} from "discord-api-types/v10";
import { hexStringToUint8Array, verifyDiscordInteraction } from "./utils";
import { Ping } from "./commands/ping";

const encoder = new TextEncoder();

function handleCommandInteraction(
	interaction: APIApplicationCommandInteraction,
) {
	const res = Ping.handler(interaction);
	return res;
}

export default {
	fetch: async (req: Request, env: Env, ctx: ExecutionContext) => {
		if (!req.url.endsWith("/interactions")) {
			return new Response(JSON.stringify({ message: "wrong path" }), {
				status: 404,
			});
		}
		const sig = req.headers.get("X-Signature-Ed25519");
		const timestamp = req.headers.get("X-Signature-Timestamp");
		if (!sig || !timestamp) {
			return new Response(JSON.stringify({ message: "Missing auth headers" }), {
				status: 400,
			});
		}

		const pubkey = hexStringToUint8Array(env.DISCORD_PUBKEY);
		const signature = hexStringToUint8Array(sig);
		const time = encoder.encode(timestamp);

		const interaction = (await req.json()) as APIInteraction;

		const verified = await verifyDiscordInteraction(
			encoder.encode(JSON.stringify(interaction)),
			signature,
			time,
			pubkey,
		);
		if (!verified) {
			return new Response(
				JSON.stringify({ message: "Incorrect auth headers" }),
				{
					status: 400,
				},
			);
		}

		let response: APIInteractionResponse | null = null;

		switch (interaction.type) {
			case InteractionType.Ping:
				response = {
					type: InteractionResponseType.Pong,
				};
				break;
			case InteractionType.ApplicationCommand:
				response = await handleCommandInteraction(interaction);
				break;
			default:
				console.error("Unhandled Interaction Type", interaction.type);
				response = null;
		}

		console.log(response);

		if (response) {
			return new Response(JSON.stringify(response), {
				headers: { "content-type": "application/json" },
			});
		}
		return new Response(JSON.stringify({ message: "Unknown Interaction" }), {
			status: 500,
			headers: { "content-type": "application/json" },
		});
	},
};
