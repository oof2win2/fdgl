import {
	ApplicationCommandOptionType,
	InteractionResponseType,
} from "discord-api-types/v10";
import type { ChatInputCommandHandler } from "@/utils/commands";
import { getStringOption } from "@/utils/discord/getCommandOption";
import { datePlus } from "itty-time";
import type { CommandConfig } from "@/utils/commands/types";
import { respondWithText } from "@/utils/discord/respond";

const PLAYERNAME_OPTION_NAME = "playername";
const DESCRIPTION_OPTION_NAME = "description";

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

	const guildConfig = await env.DB.selectFrom("GuildConfig")
		.selectAll()
		.where("id", "=", guildId)
		.executeTakeFirst();
	if (!guildConfig || !guildConfig.communityId) {
		return respondWithText(
			interaction,
			"Your guild is not linked to a community",
		);
	}

	const playername = getStringOption(
		interaction.data.options,
		PLAYERNAME_OPTION_NAME,
		true,
	);
	const description = getStringOption(
		interaction.data.options,
		DESCRIPTION_OPTION_NAME,
		true,
	);

	const reportCreationId = `${guildId}.${member.user.id}`;

	await env.DB.insertInto("ReportCreation")
		.values({
			id: reportCreationId,
			playername,
			description,
			expiresAt: datePlus("30 minutes"),
		})
		.onConflict((cb) =>
			cb.doUpdateSet({
				playername,
				description,
				expiresAt: datePlus("30 minutes"),
			}),
		)
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
		{
			type: ApplicationCommandOptionType.String,
			name: DESCRIPTION_OPTION_NAME,
			description: "The description of the report",
			required: true,
		},
	],
	ChatInputHandler: handler,
};

export default Config;
