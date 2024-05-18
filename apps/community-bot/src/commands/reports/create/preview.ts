import { InteractionResponseType, type APIEmbed } from "discord-api-types/v10";
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

	const report = await env.DB.selectFrom("ReportCreation")
		.selectAll()
		.where("id", "=", reportCreationId)
		.executeTakeFirst();

	if (!report) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "You are currently not creating a report",
			},
		};
	}

	const categories = await env.FDGL.categories.getAllCategories();

	const embed: APIEmbed = {};

	embed.title = `Report against ${report.playername}`;
	embed.description = "FDGL Report Creation Preview";
	embed.fields = [];

	embed.fields.push(
		{
			name: "Playername",
			value: report.playername,
		},
		{
			name: "Description",
			value: report.description ?? "No description set",
		},
	);

	const reportCategories = report.categories?.map((id) => {
		const category = categories.find((c) => c.id === id);
		return category?.name ?? "Not Found";
	});
	embed.fields.push({
		name: "Categories",
		value: reportCategories?.join(", ") ?? "None",
	});

	embed.fields.push({
		name: "Uploaded proof",
		value: report.proofLinks?.join(", ") ?? "None",
	});

	console.log(report);

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [embed],
		},
	};
};

const Config: CommandConfig = {
	name: "preview",
	type: "Command",
	description: "Preview the report to be created",
	ChatInputHandler: handler,
};

export default Config;
