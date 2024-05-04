import {
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import {
	CommandWithSubcommandsHandler,
	type CommandConfig,
} from "../../baseCommand";
import { ListCategoriesExecutionData } from "./list";
import { SearchCategoriesExecutionData } from "./search";

const Config: CommandConfig = {
	name: "categories",
	description: "Interact with FDGL categories",
};

export const ExecutionData = CommandWithSubcommandsHandler(
	[ListCategoriesExecutionData, SearchCategoriesExecutionData],
	Config,
);

export const Register: RESTPostAPIApplicationGuildCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: Config.name,
	description: Config.description,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: ListCategoriesExecutionData.config.name,
			description: ListCategoriesExecutionData.config.description,
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: SearchCategoriesExecutionData.config.name,
			description: SearchCategoriesExecutionData.config.description,
			options: SearchCategoriesExecutionData.config.options,
		},
	],
};

export default Config;
