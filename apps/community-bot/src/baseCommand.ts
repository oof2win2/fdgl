import {
	ApplicationCommandOptionType,
	InteractionType,
	type APIApplicationCommandAutocompleteInteraction,
	type APIApplicationCommandAutocompleteResponse,
	type APIApplicationCommandInteraction,
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	type APIInteractionResponse,
} from "discord-api-types/v10";
import type { CustomEnv } from "./types";

export type BaseCommandHandler = (
	interaction: APIApplicationCommandInteraction,
	env: CustomEnv,
) => Promise<APIInteractionResponse>;

export type AutocompleteHandler = (
	interaction: APIApplicationCommandAutocompleteInteraction,
	env: CustomEnv,
) => Promise<APIApplicationCommandAutocompleteResponse>;

export type CommandConfig = {
	name: string;
	description: string;
};

export type CommandExecutionData = {
	handler: BaseCommandHandler;
	autocomplete?: AutocompleteHandler;
	config: CommandConfig;
};

export const commands = ["ping", "categories"];

// TODO: fix the typings

export const CommandWithSubcommandsHandler = (
	subcommands: CommandExecutionData[],
): BaseCommandHandler => {
	return (interaction, env) => {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const options = interaction.data.options ?? [];
			const subcommand = options.find(
				(o) =>
					o.type === ApplicationCommandOptionType.Subcommand ||
					o.type === ApplicationCommandOptionType.SubcommandGroup,
			);
			if (!subcommand) throw new Error("subcommand not found");

			const sub = subcommands.find((s) => s.config.name === subcommand.name);
			if (!sub) throw new Error("subcommand not found");
			return sub.handler(interaction, env);
		}
		// autocomplete
		if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const options = interaction.data.options ?? [];
			const subcommand = options.find(
				(o) =>
					o.type === ApplicationCommandOptionType.Subcommand ||
					o.type === ApplicationCommandOptionType.SubcommandGroup,
			);
			if (!subcommand) throw new Error("subcommand not found");

			const sub = subcommands.find((s) => s.config.name === subcommand.name);
			if (!sub) throw new Error("subcommand not found");
			if (!sub.autocomplete)
				throw new Error("subcommand doesn't support autocomplete");
			return sub.autocomplete(interaction, env);
		}

		throw new Error(`Interaction of type ${interaction.type} is unhandled`);
	};
};
