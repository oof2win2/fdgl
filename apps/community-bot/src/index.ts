import {
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	type APIInteractionResponse,
} from "discord-api-types/v10";
import { hexStringToUint8Array, verifyDiscordInteraction } from "./utils";
import {
	handleAutocompleteInteraction,
	handleChatInputInteraction,
} from "./commands";
import type { BaseCFEnv, CustomEnv } from "./types";
import { Kysely } from "kysely";
import { D1Dialect } from "./kysely-d1";
import { SerializePlugin } from "kysely-plugin-serialize";
import type { DB } from "./db-types";
import { pagedMessageHandler } from "./utils/discord/pagedMessageHandler";

const encoder = new TextEncoder();

export default {
	fetch: async (req: Request, env: BaseCFEnv, ctx: ExecutionContext) => {
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

		// setup db and env
		const alteredEnv: CustomEnv = {
			...env,
			d1_db: env.DB,
			DB: new Kysely<DB>({
				dialect: new D1Dialect({ database: env.DB }),
				plugins: [new SerializePlugin()],
			}),
		};

		let response: APIInteractionResponse | null = null;

		switch (interaction.type) {
			case InteractionType.Ping:
				response = {
					type: InteractionResponseType.Pong,
				};
				break;
			case InteractionType.ApplicationCommand:
				if (interaction.data.type === ApplicationCommandType.ChatInput) {
					response = await handleChatInputInteraction(
						interaction as APIChatInputApplicationCommandInteraction,
						alteredEnv,
					);
				} else
					console.error(
						`Unhandled ApplicationCommand type ${interaction.data.type}`,
					);
				break;
			case InteractionType.ApplicationCommandAutocomplete:
				response = await handleAutocompleteInteraction(interaction, alteredEnv);
				break;
			case InteractionType.MessageComponent:
				if (interaction.data.custom_id.startsWith("paging")) {
					response = await pagedMessageHandler(interaction, alteredEnv);
				} else {
					console.error("Unhandled MessageComponent");
				}
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
