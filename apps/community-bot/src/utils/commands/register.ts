import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v10";
import type { Command, CommandConfig, SubcommandGroupConfig } from "./types";

function createCommandRegister(
	command: CommandConfig,
): APIApplicationCommandSubcommandOption {
	return {
		type: ApplicationCommandOptionType.Subcommand,
		name: command.name,
		description: command.description,
		options: command.options,
	};
}

function createCommandWithSubcommandsRegister(
	command: SubcommandGroupConfig,
): APIApplicationCommandSubcommandGroupOption {
	return {
		name: command.name,
		description: command.description,
		type: ApplicationCommandOptionType.SubcommandGroup,
		options: command.subcommands.map((subcommand) => ({
			type: ApplicationCommandOptionType.Subcommand,
			name: subcommand.name,
			description: subcommand.description,
			options: subcommand.options,
		})),
	};
}

type BaseCommandDescription = {
	name: string;
	description: string;
};

function commandWithSubcommandGroupsRegister(
	desc: BaseCommandDescription,
	commands: (CommandConfig | SubcommandGroupConfig)[],
): RESTPostAPIApplicationGuildCommandsJSONBody {
	return {
		name: desc.name,
		description: desc.description,
		type: ApplicationCommandType.ChatInput,
		options: commands.map((cmd) => {
			if (cmd.type === "Command") return createCommandRegister(cmd);
			return createCommandWithSubcommandsRegister(cmd);
		}),
	};
}

export function createRegister(command: Command): void {
	// throw new Error("unimplemented");
	// if (command.type === "Command")
	// 	return {
	// 		name: command.name,
	// 		description: command.description,
	// 		options: command.options,
	// 		type: ApplicationCommandType.ChatInput,
	// 	};
	// return commandWithSubcommandGroupsRegister(
	// 	{ name: command.name, description: command.description },
	// 	command.subcommands,
	// );
}
