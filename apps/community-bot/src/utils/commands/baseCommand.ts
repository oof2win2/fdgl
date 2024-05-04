import {
	ApplicationCommandOptionType,
	type APIApplicationCommandAutocompleteInteraction,
	type APIApplicationCommandAutocompleteResponse,
	type APIApplicationCommandBasicOption,
	type APIChatInputApplicationCommandInteraction,
	type APIInteractionResponse,
} from "discord-api-types/v10";
import type { CustomEnv } from "../../types";

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
	group?: string;
	description: string;
	options?: APIApplicationCommandBasicOption[];
};

export type CommandExecutionData = {
	ChatInputHandler: ChatInputCommandHandler;
	AutocompleteHandler?: AutocompleteHandler;
	config: CommandConfig;
};

// export const commands = ["ping", "categories", "communities", "filters"];
export const commands = ["reports"];

export const CommandWithSubcommandsHandler = (
	subcommands: CommandExecutionData[],
	config: CommandConfig,
): CommandExecutionData => {
	return {
		ChatInputHandler: (interaction, env) => {
			const options = interaction.data.options ?? [];
			const option = options[0];
			if (option.type === ApplicationCommandOptionType.Subcommand) {
				const cmd = subcommands.find((c) => c.config.name === option.name);
				if (!cmd) throw new Error("Subcommand not found");
				// biome-ignore lint/style/noNonNullAssertion: the options will be there as it is a subcommand
				interaction.data.options = option.options!;
				return cmd.ChatInputHandler(interaction, env);
			}
			if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
				const commandName = option.options[0].name;
				const cmd = subcommands.find(
					(c) =>
						c.config.group === option.name && c.config.name === commandName,
				);
				if (!cmd) throw new Error("Subcommand not found");
				// biome-ignore lint/style/noNonNullAssertion: the options will be there as it is a subcommand group
				interaction.data.options = option.options[0].options!;
				return cmd.ChatInputHandler(interaction, env);
			}
			throw new Error("Command not handled");
		},
		AutocompleteHandler: (interaction, env) => {
			const options = interaction.data.options ?? [];
			const option = options[0];
			if (option.type === ApplicationCommandOptionType.Subcommand) {
				const cmd = subcommands.find((c) => c.config.name === option.name);
				if (!cmd) throw new Error("Subcommand not found");
				if (!cmd.AutocompleteHandler)
					throw new Error("Subcommand doesn't have an autocomplete handler");
				// biome-ignore lint/style/noNonNullAssertion: the options will be there as it is a subcommand
				interaction.data.options = option.options!;
				return cmd.AutocompleteHandler(interaction, env);
			}
			if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
				const commandName = option.options[0].name;
				const cmd = subcommands.find(
					(c) =>
						c.config.group === option.name && c.config.name === commandName,
				);
				if (!cmd) throw new Error("Subcommand not found");
				if (!cmd.AutocompleteHandler)
					throw new Error("Subcommand doesn't have an autocomplete handler");
				// biome-ignore lint/style/noNonNullAssertion: the options will be there as it is a subcommand group
				interaction.data.options = option.options[0].options!;
				return cmd.AutocompleteHandler(interaction, env);
			}
			throw new Error("Command not handled");
		},
		config,
	};
};
