/**
 * This file is quite a mess and a bunch of spaghetti. It is done right and works.
 * However, it could definitely use some cleanup.
 */

import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type {
	Command,
	CommandConfig,
	CommandExecutionData,
	SubcommandGroupConfig,
} from "./types";

function commandWithSubcommandGroupsHandler(
	name: string,
	commands: (CommandConfig | SubcommandGroupConfig)[],
): CommandExecutionData {
	return {
		ChatInputHandler: async (interaction, env) => {
			const options = interaction.data.options ?? [];
			const option = options[0];
			if (option.type === ApplicationCommandOptionType.Subcommand) {
				const cmd = commands.find((c) => c.name === option.name);
				if (!cmd) throw new Error("Subcommand not found");
				if (cmd.type === "SubcommandGroup") throw new Error("oops");
				// biome-ignore lint/style/noNonNullAssertion: the options will be there as it is a subcommand
				interaction.data.options = option.options!;
				return cmd.ChatInputHandler(interaction, env);
			}
			if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
				const group = commands.find(
					(c) => c.name === option.name && c.type === "SubcommandGroup",
				);
				if (!group) throw new Error("Command group not found");
				if (group.type === "Command") throw new Error("not the right one");
				const groupOption = option.options[0];
				const cmdName = groupOption.name;
				const cmd = group.subcommands.find((c) => c.name === cmdName);
				if (!cmd) throw new Error("Subcommand not found");

				interaction.data.options = groupOption.options;
				return cmd?.ChatInputHandler(interaction, env);
			}
			throw new Error("Command not handled");
		},
		AutocompleteHandler: async (interaction, env) => {
			const options = interaction.data.options ?? [];
			const option = options[0];
			if (option.type === ApplicationCommandOptionType.Subcommand) {
				const cmd = commands.find((c) => c.name === option.name);
				if (!cmd) throw new Error("Subcommand not found");
				if (cmd.type === "SubcommandGroup") throw new Error("oops");
				// biome-ignore lint/style/noNonNullAssertion: the options will be there as it is a subcommand
				interaction.data.options = option.options!;
				if (!cmd.AutocompleteHandler)
					throw new Error(
						`Command ${cmd.name} does not have an autocomplete handler`,
					);
				return cmd.AutocompleteHandler(interaction, env);
			}
			if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
				const group = commands.find(
					(c) => c.name === option.name && c.type === "SubcommandGroup",
				);
				if (!group) throw new Error("Command group not found");
				if (group.type === "Command") throw new Error("not the right one");
				const groupOption = option.options[0];
				const cmdName = groupOption.name;
				const cmd = group.subcommands.find((c) => c.name === cmdName);
				if (!cmd) throw new Error("Subcommand not found");

				// biome-ignore lint/style/noNonNullAssertion: the options will be there as it is a subcommand
				interaction.data.options = groupOption.options!;
				if (!cmd.AutocompleteHandler)
					throw new Error(
						`Command ${option.name}/${cmd.name} does not have an autocomplete handler`,
					);
				return cmd.AutocompleteHandler(interaction, env);
			}
			throw new Error("Command not handled");
		},
		name: name,
	};
}

export function createHandler(command: Command): CommandExecutionData {
	if (command.type === "Command")
		return {
			ChatInputHandler: command.ChatInputHandler,
			AutocompleteHandler: command.AutocompleteHandler,
			name: command.name,
		};
	return commandWithSubcommandGroupsHandler(command.name, command.subcommands);
}
