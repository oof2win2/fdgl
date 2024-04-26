import {
	ApplicationCommandOptionType,
	InteractionResponseType,
	MessageFlags,
	type RESTPatchAPIApplicationCommandJSONBody,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	type RESTPutAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v10";
import type {
	BaseCommandHandler,
	CommandConfig,
	CommandExecutionData,
} from "../../baseCommand";
import { getCommandStringValue } from "../../utils/discord/getCommandOption";

export const SearchCategoriesConfig: CommandConfig = {
	name: "search",
	description: "Search through categories present in FDGL",
};

const handler: BaseCommandHandler = async (interaction, env) => {
	const id = getCommandStringValue(interaction.data.options, "category", true);
	const category = await env.FDGL.categories.getCategory(id);

	if (!category)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: `The category with ID ${id} does not exist`,
				flags: MessageFlags.Ephemeral,
			},
		};

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: "hi!",
		},
	};
};

export const SearchCategoriesExecutionData: CommandExecutionData = {
	config: SearchCategoriesConfig,
	handler,
};

export default SearchCategoriesConfig;
