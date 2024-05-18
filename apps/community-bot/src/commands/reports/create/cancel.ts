import { InteractionResponseType } from "discord-api-types/v10";
import type { ChatInputCommandHandler } from "$utils/commands";
import type { CommandConfig } from "$utils/commands/types";

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

	const reportCreationId = `${guildId}.${member.user.id}`;

	await env.DB.deleteFrom("ReportCreation")
		.where("id", "=", reportCreationId)
		.execute();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: "The report creation process has been cancelled",
		},
	};
};

const Config: CommandConfig = {
	name: "cancel",
	type: "Command",
	description: "Cancel the report creation process",
	ChatInputHandler: handler,
};

export default Config;
