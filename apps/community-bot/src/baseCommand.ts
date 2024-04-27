import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	InteractionType,
	type APIApplicationCommandAutocompleteInteraction,
	type APIApplicationCommandAutocompleteResponse,
	type APIApplicationCommandInteraction,
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	type APIInteractionResponse,
} from "discord-api-types/v10";
import type { CustomEnv } from "./types";

export type ChatInputCommandHandler = (
	interaction: APIChatInputApplicationCommandInteraction,
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
	ChatInputHandler: ChatInputCommandHandler;
	AutocompleteHandler?: AutocompleteHandler;
	config: CommandConfig;
};

export const commands = ["ping", "categories", "communities"];

// TODO: fix the typings

export const CommandWithSubcommandsHandler = (
	subcommands: CommandExecutionData[],
	config: CommandConfig,
): CommandExecutionData => {
	return {
		ChatInputHandler: (interaction, env) => {
			const options = interaction.data.options ?? [];
			const subcommand = options.find(
				(o) =>
					o.type === ApplicationCommandOptionType.Subcommand ||
					o.type === ApplicationCommandOptionType.SubcommandGroup,
			);
			if (!subcommand) throw new Error("subcommand not found");
			if (
				subcommand.type !== ApplicationCommandOptionType.Subcommand &&
				subcommand.type !== ApplicationCommandOptionType.SubcommandGroup
			)
				throw new Error("subcommand not found");

			const sub = subcommands.find((s) => s.config.name === subcommand.name);
			// we propagate the options
			interaction.data.options = subcommand.options;
			if (!sub) throw new Error("subcommand not found");
			return sub.ChatInputHandler(interaction, env);
		},
		AutocompleteHandler: (interaction, env) => {
			const options = interaction.data.options ?? [];
			const subcommand = options.find(
				(o) =>
					o.type === ApplicationCommandOptionType.Subcommand ||
					o.type === ApplicationCommandOptionType.SubcommandGroup,
			);
			if (!subcommand) throw new Error("subcommand not found");
			if (
				subcommand.type !== ApplicationCommandOptionType.Subcommand &&
				subcommand.type !== ApplicationCommandOptionType.SubcommandGroup
			)
				throw new Error("subcommand not found");
			if (!subcommand.options) throw new Error("no options");

			const sub = subcommands.find((s) => s.config.name === subcommand.name);
			// we propagate the options
			interaction.data.options = subcommand.options;
			if (!sub) throw new Error("subcommand not found");
			if (!sub.AutocompleteHandler)
				throw new Error("subcommand doesn't support autocomplete");
			return sub.AutocompleteHandler(interaction, env);
		},
		config,
	};
};
