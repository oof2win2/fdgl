import type {
	APIApplicationCommandAutocompleteInteraction,
	APIChatInputApplicationCommandInteraction,
} from "discord-api-types/v10";
import { ExecutionData as Ping } from "./ping";
import { ExecutionData as Categories } from "./categories";
import { ExecutionData as Communities } from "./communities";
import { ExecutionData as Filters } from "./filters";
import type { CustomEnv } from "../types";

export async function handleChatInputInteraction(
	interaction: APIChatInputApplicationCommandInteraction,
	env: CustomEnv,
) {
	switch (interaction.data.name) {
		case Ping.config.name:
			return await Ping.ChatInputHandler(interaction, env);
		case Categories.config.name:
			return await Categories.ChatInputHandler(interaction, env);
		case Communities.config.name:
			return await Communities.ChatInputHandler(interaction, env);
		case Filters.config.name:
			return await Filters.ChatInputHandler(interaction, env);
		default:
			throw new Error(`Unhandled command: ${interaction.data.name}`);
	}
}

export async function handleAutocompleteInteraction(
	interaction: APIApplicationCommandAutocompleteInteraction,
	env: CustomEnv,
) {
	switch (interaction.data.name) {
		case Categories.config.name:
			if (!Categories.AutocompleteHandler)
				throw new Error("Categories don't have an autocomplete handler");
			return await Categories.AutocompleteHandler(interaction, env);
		case Communities.config.name:
			if (!Communities.AutocompleteHandler)
				throw new Error("Communities don't have an autocomplete handler");
			return await Communities.AutocompleteHandler(interaction, env);
		case Filters.config.name:
			if (!Filters.AutocompleteHandler)
				throw new Error("Filters don't have an autocomplete handler");
			return await Filters.AutocompleteHandler(interaction, env);
		default:
			throw new Error(
				`Unhandled autocomplete interaction: ${interaction.data.name}`,
			);
	}
}
