import {
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import {
	CommandWithSubcommandsHandler,
	type CommandConfig,
	type CommandExecutionData,
} from "../../baseCommand";
import { ListCategoriesConfig, ListCategoriesExecutionData } from "./list";

const Config: CommandConfig = {
	name: "categories",
	description: "Interact with FDGL Categories",
};

export const Handler = CommandWithSubcommandsHandler([
	ListCategoriesExecutionData,
]);

export const Register: RESTPostAPIApplicationGuildCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: Config.name,
	description: Config.description,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: ListCategoriesConfig.name,
			description: ListCategoriesConfig.description,
		},
	],
};

export const ExecutionData: CommandExecutionData = {
	handler: Handler,
	config: Config,
};
