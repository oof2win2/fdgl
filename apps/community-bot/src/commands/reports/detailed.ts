import {
	ApplicationCommandOptionType,
	InteractionResponseType,
	type APIEmbed,
} from "discord-api-types/v10";
import { getStringOption } from "@/utils/discord/getCommandOption";
import type {
	CommandConfig,
	ChatInputCommandHandler,
} from "$utils/commands/types";
import { respondWithText } from "@/utils/discord/respond";

const REPORTID_OPTION_NAME = "reportid";

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const id = getStringOption(
		interaction.data.options,
		REPORTID_OPTION_NAME,
		true,
	);

	const report = await env.FDGL.reports.getReport(id);
	if (!report) {
		return respondWithText(interaction, "A report with this ID doesn't exist");
	}

	const categories = await env.FDGL.categories.getAllCategories();
	const community = await env.FDGL.communities.getCommunity(report.communityId);

	const categoryNames = report.categories.map((id) => {
		const category = categories.find((c) => c.id === id);
		return category?.name ?? "Not found";
	});

	const embed: APIEmbed = {};
	embed.title = "FDGL Report Detailed Information";
	embed.fields = [
		{
			name: "Report ID",
			value: report.id,
			inline: true,
		},
		{
			name: "Playername",
			value: report.playername,
			inline: true,
		},
		{
			name: "Created at",
			value: `<t:${Math.floor(report.createdAt.valueOf() / 1000)}>`,
			inline: true,
		},
		{
			name: "Created in community",
			value: community!.name,
			inline: true,
		},
		{
			name: "Categories",
			value: categoryNames.join(", "),
		},
		{
			name: "Proof links",
			value: report.proof.join(", ") ?? "None",
		},
	];

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [embed],
		},
	};
};

const Config: CommandConfig = {
	name: "detailed",
	type: "Command",
	description: "View detailed information about a report",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: REPORTID_OPTION_NAME,
			description: "The ID of the report",
			required: true,
		},
	],
	ChatInputHandler: handler,
};

export default Config;
