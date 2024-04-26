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
import { ListCategoriesExecutionData } from "./list";
import { SearchCategoriesExecutionData } from "./search";

const Config: CommandConfig = {
	name: "categories",
	description: "Interact with FDGL Categories",
};

export const Handler = CommandWithSubcommandsHandler([
	ListCategoriesExecutionData,
	SearchCategoriesExecutionData,
]);

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
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "category",
					description: "Name of the category",
					autocomplete: true,
					required: true,
				},
			],
		},
	],
};

export const ExecutionData: CommandExecutionData = {
	handler: Handler,
	config: Config,
};

export default Config;
