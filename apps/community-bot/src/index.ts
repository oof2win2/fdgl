import {
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	type APIInteractionResponse,
} from "discord-api-types/v10";
import { hexStringToUint8Array, verifyDiscordInteraction } from "./utils";
import { handleCommandInteraction } from "./commands";
import type { CustomEnv } from "./types";

const encoder = new TextEncoder();

export default {
	fetch: async (req: Request, env: CustomEnv, ctx: ExecutionContext) => {
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
				if (interaction.data.type === ApplicationCommandType.ChatInput) {
					response = await handleCommandInteraction(
						interaction as APIChatInputApplicationCommandInteraction,
						env,
					);
				} else
					[
						console.error(
							`Unhandled ApplicationCommand type ${interaction.data.type}`,
						),
					];
				break;
			default:
				console.error("Unhandled Interaction Type", interaction.type);
				response = null;
		}

		// @ts-expect-error
		if (env.RESPONSE_TYPE === "direct") {
			return new Response(JSON.stringify(response), {
				headers: { "content-type": "application/json" },
			});
		}

		// in dev mode, we want to have better logging
		const res = await fetch(
			`${env.DISCORD_API_BASEURL}/interactions/${interaction.id}/${interaction.token}/callback`,
			{
				method: "POST",
				body: JSON.stringify(response),
				headers: { "content-type": "application/json" },
			},
		);
		if (res.status === 204) {
			// success
		} else {
			const b = await res.json();
			console.log(JSON.stringify(b, null, 2));
		}

		return new Response(null, { status: 204 });
	},
};
