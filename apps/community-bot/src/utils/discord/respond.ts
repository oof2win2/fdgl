import {
	InteractionResponseType,
	type APIInteraction,
	type APIInteractionResponse,
	type RESTPostAPIWebhookWithTokenJSONBody,
} from "discord-api-types/v10";
import type { CustomEnv } from "types";

export function respond(
	interaction: APIInteraction,
	response: APIInteractionResponse,
	throughAPI: boolean,
): APIInteractionResponse;
export function respond(
	interaction: APIInteraction,
	response: APIInteractionResponse,
	throughAPI: true,
): Promise<Response>;
export function respond(
	interaction: APIInteraction,
	response: APIInteractionResponse,
	throughAPI = false,
): APIInteractionResponse | Promise<Response> {
	if (!throughAPI) return response;

	return fetch(
		`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`,
		{
			method: "POST",
			body: JSON.stringify(response),
			headers: { "content-type": "application/json" },
		},
	);
}

export function respondWithText(
	interaction: APIInteraction,
	response: string,
): APIInteractionResponse;
export function respondWithText(
	interaction: APIInteraction,
	response: string,
	throughAPI: true,
): Promise<Response>;
export function respondWithText(
	interaction: APIInteraction,
	response: string,
	throughAPI = false,
): APIInteractionResponse | Promise<Response> {
	return respond(
		interaction,
		{
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: response,
			},
		},
		throughAPI,
	);
}

export function deferMessage(interaction: APIInteraction): Promise<Response> {
	return respond(
		interaction,
		{
			type: InteractionResponseType.DeferredChannelMessageWithSource,
		},
		true,
	);
}

export function followupInteraction(
	interaction: APIInteraction,
	env: CustomEnv,
	response: RESTPostAPIWebhookWithTokenJSONBody,
): Promise<Response> {
	return fetch(
		`https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}`,
		{
			method: "POST",
			body: JSON.stringify(response),
			headers: { "content-type": "application/json" },
		},
	);
}

export function followupInteractionText(
	interaction: APIInteraction,
	env: CustomEnv,
	response: string,
): Promise<Response> {
	return followupInteraction(interaction, env, {
		content: response,
	});
}
