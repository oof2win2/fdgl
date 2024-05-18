import {
	ApplicationCommandOptionType,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	type APIEmbed,
	type APIEmbedField,
} from "discord-api-types/v10";
import {
	getBooleanOption,
	getStringOption,
} from "@/utils/discord/getCommandOption";
import type {
	CommandConfig,
	ChatInputCommandHandler,
} from "$utils/commands/types";
import { getFilterObject } from "@/utils/getFilterObject";
import { respond, respondWithText } from "@/utils/discord/respond";
import { datePlus } from "itty-time";

const PLAYERNAME_OPTION_NAME = "playername";
const FILTERED_OPTION_NAME = "filtered";

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const playername = getStringOption(
		interaction.data.options,
		PLAYERNAME_OPTION_NAME,
		true,
	);

	const filtered =
		getBooleanOption(interaction.data.options, FILTERED_OPTION_NAME, false) ??
		false;

	// biome-ignore lint/suspicious/noImplicitAnyLet: it is assigned later
	let reports;
	if (filtered) {
		if (!interaction.guild_id) {
			return respondWithText(
				interaction,
				"To view filtered reports, you must execute this command from a guild",
			);
		}
		const config = await getFilterObject(interaction.guild_id, env);
		if (!config.filteredCategories.length)
			return respondWithText(
				interaction,
				"To view filtered reports, you must have category filters set",
			);
		if (!config.filteredCommunities.length)
			return respondWithText(
				interaction,
				"To view filtered reports, you must have community filters set",
			);

		reports = await env.FDGL.reports.getReports({
			playername,
			categoryIds: config.filteredCategories,
			communityIds: config.filteredCommunities,
		});
	} else {
		reports = await env.FDGL.reports.getReports({
			playername,
		});
	}

	if (!reports.length) {
		const text = filtered
			? "The player doesn't have any reports matching your filters"
			: "The player doesn't have any reports";
		return respondWithText(interaction, text);
	}

	const categories = await env.FDGL.categories.getAllCategories();

	const embed: APIEmbed = {};
	embed.title = "FDGL Report Information";
	embed.description = `FDGL Reports of player ${playername}. To view more information about a specific report, please use \`/reports detailed\` with the ID provided`;

	const fields = reports.map((report) => {
		const categoryNames = report.categories.map((category) => {
			const c = categories.find((c) => c.id === category);
			return c ? c.name : "Not found";
		});
		console.log(report.categories);

		return {
			name: `Report \`${report.id}\``,
			value: categoryNames.join(", "),
		} satisfies APIEmbedField;
	});

	embed.fields = fields.slice(0, 10);

	await env.DB.insertInto("PagedData")
		.values({
			id: interaction.id,
			currentPage: 0,
			data: fields,
			expiresAt: datePlus("5 minutes"),
		})
		.execute();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [embed],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							custom_id: "paging_prev",
							style: ButtonStyle.Primary,
							emoji: { name: "⬅️" },
						},
						{
							type: ComponentType.Button,
							custom_id: "paging_next",
							style: ButtonStyle.Primary,
							emoji: { name: "➡️" },
						},
					],
				},
			],
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
		{
			type: ApplicationCommandOptionType.Boolean,
			name: FILTERED_OPTION_NAME,
			description: "Select reports only matching your guild's filters",
			required: false,
		},
	],
	ChatInputHandler: handler,
};

export default Config;
