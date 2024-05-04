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

export async function handleChatInputInteraction(
	interaction: APIChatInputApplicationCommandInteraction,
	env: CustomEnv,
) {
	switch (interaction.data.name) {
		case Ping.name:
			return await Ping.ChatInputHandler(interaction, env);
		case Categories.name:
			return await Categories.ChatInputHandler(interaction, env);
		case Communities.name:
			return await Communities.ChatInputHandler(interaction, env);
		case Filters.name:
			return await Filters.ChatInputHandler(interaction, env);
		case Reports.name:
			return await Reports.ChatInputHandler(interaction, env);
		default:
			throw new Error(`Unhandled command: ${interaction.data.name}`);
	}
}

export async function handleAutocompleteInteraction(
	interaction: APIApplicationCommandAutocompleteInteraction,
	env: CustomEnv,
) {
	switch (interaction.data.name) {
		case Categories.name:
			if (!Categories.AutocompleteHandler)
				throw new Error("Categories don't have an autocomplete handler");
			return await Categories.AutocompleteHandler(interaction, env);
		case Communities.name:
			if (!Communities.AutocompleteHandler)
				throw new Error("Communities don't have an autocomplete handler");
			return await Communities.AutocompleteHandler(interaction, env);
		case Filters.name:
			if (!Filters.AutocompleteHandler)
				throw new Error("Filters don't have an autocomplete handler");
			return await Filters.AutocompleteHandler(interaction, env);
		default:
			throw new Error(
				`Unhandled autocomplete interaction: ${interaction.data.name}`,
			);
	}
}
