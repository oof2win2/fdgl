import {
	ApplicationCommandOptionType,
	InteractionResponseType,
} from "discord-api-types/v10";
import type {
	ChatInputCommandHandler,
	CommandExecutionData,
} from "../../../baseCommand";
import { getFilterObject } from "../../../utils/getFilterObject";
import { getStringOption } from "../../../utils/discord/getCommandOption";
import { datePlus } from "itty-time";
import type { CommandConfig } from "../../../utils/commands/types";

const PLAYERNAME_OPTION_NAME = "playername";

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const guildId = interaction.guild_id;
	if (!guildId)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This command must be ran in a guild",
			},
		};

	const member = interaction.member;
	if (!member) throw new Error("invalid");

	const playername = getStringOption(
		interaction.data.options,
		PLAYERNAME_OPTION_NAME,
		true,
	);

	const reportCreationId = `${guildId}.${member.user.id}`;

	await env.DB.insertInto("ReportCreation")
		.values({
			id: reportCreationId,
			playername,
			expiresAt: datePlus("30 minutes"),
		})
		.execute();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `Report creation process has begun for the player ${playername}`,
		},
	};
};

const Config: CommandConfig = {
	name: "start",
	type: "Command",
	description: "Begin the report creation process",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: PLAYERNAME_OPTION_NAME,
			description: "Name of the player to start creating the report for",
			required: true,
		},
	],
	ChatInputHandler: handler,
};

export default Config;
