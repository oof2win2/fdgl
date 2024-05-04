import type {
	APIApplicationCommandAutocompleteInteraction,
	APIApplicationCommandAutocompleteResponse,
	APIApplicationCommandBasicOption,
	APIChatInputApplicationCommandInteraction,
	APIInteractionResponse,
} from "discord-api-types/v10";
import type { CustomEnv } from "../../types";

export type CommandConfig = {
	name: string;
	description: string;
	type: "Command";

	options?: APIApplicationCommandBasicOption[];

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
	interaction: APIChatInputApplicationCommandInteraction,
	env: CustomEnv,
) => Promise<APIInteractionResponse>;

export type AutocompleteHandler = (
	interaction: APIApplicationCommandAutocompleteInteraction,
	env: CustomEnv,
) => Promise<APIApplicationCommandAutocompleteResponse>;

export type CommandExecutionData = {
	ChatInputHandler: ChatInputCommandHandler;
	AutocompleteHandler?: AutocompleteHandler;
	name: string;
};
