import type {
	APIApplicationCommandAutocompleteInteraction,
	APIChatInputApplicationCommandInteraction,
} from "discord-api-types/v10";
import Ping from "./ping";
import Categories from "./categories";
import Communities from "./communities";
import Filters from "./filters";
import Reports from "./reports";
import type { CustomEnv } from "../types";

const commands = [Ping, Categories, Communities, Filters, Reports];

export async function handleChatInputInteraction(
	interaction: APIChatInputApplicationCommandInteraction,
	env: CustomEnv,
) {
	for (const command of commands) {
		if (interaction.data.name === command.name)
			return await command.ChatInputHandler(interaction, env);
	}
	throw new Error(`Unhandled command: ${interaction.data.name}`);
}

export async function handleAutocompleteInteraction(
	interaction: APIApplicationCommandAutocompleteInteraction,
	env: CustomEnv,
) {
	for (const command of commands) {
		if (interaction.data.name === command.name) {
			if (!command.AutocompleteHandler)
				throw new Error(
					`Command ${command.name} doesn't have an autocomplete handler`,
				);
			return await command.AutocompleteHandler(interaction, env);
		}
	}
	throw new Error(`Unhandled command: ${interaction.data.name}`);
}
