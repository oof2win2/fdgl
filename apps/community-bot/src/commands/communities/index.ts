import {
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import {
	CommandWithSubcommandsHandler,
	type CommandConfig,
} from "../../baseCommand";
import { ListCommunitiesExecutionData } from "./list";
import { SearchCommunitiesExecutionData } from "./search";

const Config: CommandConfig = {
	name: "communities",
	description: "", // we have subcommands so this is empty
};

export const ExecutionData = CommandWithSubcommandsHandler(
	[ListCommunitiesExecutionData, SearchCommunitiesExecutionData],
	Config,
);

export const Register: RESTPostAPIApplicationGuildCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: Config.name,
	description: Config.description,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: ListCommunitiesExecutionData.config.name,
			description: ListCommunitiesExecutionData.config.description,
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: SearchCommunitiesExecutionData.config.name,
			description: SearchCommunitiesExecutionData.config.description,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "community",
					description: "Name of the community",
					autocomplete: true,
					required: true,
				},
			],
		},
	],
};

export default Config;
