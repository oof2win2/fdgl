/**
 * This file is quite a mess and a bunch of spaghetti. It is done right and works.
 * However, it could definitely use some cleanup.
 */

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
		ChatInputHandler: async (interaction) => {
			const groupName = interaction.options.getSubcommandGroup();
			if (groupName) {
				const subcommandName = interaction.options.getSubcommand(true);

				const group = commands.find(
					(c) => c.name === groupName && c.type === "SubcommandGroup",
				);
				if (!group) throw new Error(`Command group ${group} not found`);
				if (group.type !== "SubcommandGroup")
					throw new Error("not the right one");
				const cmd = group.subcommands.find((c) => c.name === subcommandName);
				if (!cmd) throw new Error(`Subcommand ${subcommandName} not found`);

				return cmd.ChatInputHandler(interaction);
			}

			const cmdName = interaction.options.getSubcommand(true);
			const cmd = commands.find((c) => c.name === cmdName);
			if (!cmd) throw new Error("Subcommand not found");
			if (cmd.type === "SubcommandGroup") throw new Error("oops");

			return cmd.ChatInputHandler(interaction);
		},
		AutocompleteHandler: async (interaction) => {
			const groupName = interaction.options.getSubcommandGroup();
			if (groupName) {
				const subcommandName = interaction.options.getSubcommand(true);

				const group = commands.find(
					(c) => c.name === groupName && c.type === "SubcommandGroup",
				);
				if (!group) throw new Error(`Command group ${group} not found`);
				if (group.type !== "SubcommandGroup")
					throw new Error("not the right one");
				const cmd = group.subcommands.find((c) => c.name === subcommandName);
				if (!cmd) throw new Error(`Subcommand ${subcommandName} not found`);

				if (!cmd.AutocompleteHandler)
					throw new Error(
						`Subcommand ${subcommandName} has no autocomplete handler`,
					);

				return cmd.AutocompleteHandler(interaction);
			}

			const cmdName = interaction.options.getSubcommand(true);
			const cmd = commands.find((c) => c.name === cmdName);
			if (!cmd) throw new Error("Subcommand not found");
			if (cmd.type === "SubcommandGroup") throw new Error("oops");
			if (!cmd.AutocompleteHandler)
				throw new Error(`Command ${cmdName} has no autocomplete handler`);

			return cmd.AutocompleteHandler(interaction);
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
