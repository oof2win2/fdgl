import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";

export type CommandConfig = {
	name: string;
	type: "Command";

	command: SlashCommandSubcommandBuilder | SlashCommandBuilder;

	ChatInputHandler: ChatInputCommandHandler;
	AutocompleteHandler?: AutocompleteHandler;
};

export type SubcommandGroupConfig = {
	name: string;
	description: string;
	type: "SubcommandGroup";

	subcommands: CommandConfig[];
};

export type CommandWithSubcommands = {
	name: string;
	description: string;
	type: "CommandWithSubcommands";

	subcommands: (CommandConfig | SubcommandGroupConfig)[];
};

export type Command =
	| CommandConfig
	| SubcommandGroupConfig
	| CommandWithSubcommands;

export type ChatInputCommandHandler = (
	interaction: ChatInputCommandInteraction,
) => Promise<void>;

export type AutocompleteHandler = (
	interaction: AutocompleteInteraction,
) => Promise<void>;

export type CommandExecutionData = {
	ChatInputHandler: ChatInputCommandHandler;
	AutocompleteHandler?: AutocompleteHandler;
	name: string;
};
