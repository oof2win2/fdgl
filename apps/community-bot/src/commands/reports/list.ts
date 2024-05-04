import {
	ApplicationCommandOptionType,
	InteractionResponseType,
} from "discord-api-types/v10";
import { getStringOption } from "../../utils/discord/getCommandOption";
import type {
	CommandConfig,
	ChatInputCommandHandler,
} from "../../utils/commands/types";

const PLAYERNAME_OPTION_NAME = "playername";

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const playername = getStringOption(
		interaction.data.options,
		PLAYERNAME_OPTION_NAME,
		true,
	);

	// TODO: implement this

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `Report fetching for player ${playername} is not implemented`,
		},
	};
};

const Config: CommandConfig = {
	name: "list",
	type: "Command",
	description: "List all reports of a player",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: PLAYERNAME_OPTION_NAME,
			description: "Name of the player to list reports of",
			required: true,
		},
	],
	ChatInputHandler: handler,
};

export default Config;
