import {
	ApplicationCommandOptionType,
	InteractionResponseType,
} from "discord-api-types/v10";
import type {
	AutocompleteHandler,
	ChatInputCommandHandler,
	CommandConfig,
} from "$utils/commands";
import { getFilterObject } from "@/utils/getFilterObject";
import {
	getFocusedInteractionOption,
	getStringOption,
} from "@/utils/discord/getCommandOption";
import { stringSimilarity } from "string-similarity-js";

const CATEGORY_OPTION_NAME = "category" as const;

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const guildId = interaction.guild_id;
	if (!guildId)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This command must be ran in a guild",
			},
		};

	const id = getStringOption(
		interaction.data.options,
		CATEGORY_OPTION_NAME,
		true,
	);

	const category = await env.FDGL.categories.getCategory(id);

	if (!category)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "The category could not be found",
			},
		};

	const member = interaction.member;
	if (!member) throw new Error("invalid");

	const reportCreationId = `${guildId}.${member.user.id}`;

	const previousReport = await env.DB.selectFrom("ReportCreation")
		.select("categories")
		.where("id", "=", reportCreationId)
		.executeTakeFirst();

	if (!previousReport) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "You are currently not creating a report",
			},
		};
	}

	const previous = previousReport.categories ?? [];
	if (!previous.includes(category.id)) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: `The category "${category.name}" is not present on the report`,
			},
		};
	}
	const newCategories = previous.filter((x) => x !== category.id);

	await env.DB.updateTable("ReportCreation")
		.set({
			categories: JSON.stringify(newCategories),
		})
		.where("id", "=", reportCreationId)
		.execute();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `The category "${category.name}" was added to the report`,
		},
	};
};

const autocomplete: AutocompleteHandler = async (interaction, env) => {
	const categories = await env.FDGL.categories.getAllCategories();
	const focused = getFocusedInteractionOption(
		interaction.data.options,
		ApplicationCommandOptionType.String,
	);
	const sortedBySimilarity = categories
		.map((c) => ({
			name: c.name,
			value: c.id,
			sim: focused ? stringSimilarity(c.name, focused.value) : 0,
		}))
		.sort((a, b) => b.sim - a.sim);
	return {
		type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		data: {
			choices: sortedBySimilarity.slice(0, 10), // max of 25 autocomplete options
		},
	};
};

const Config: CommandConfig = {
	name: "removecategory",
	description: "Remove a category from the report being created",
	type: "Command",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: CATEGORY_OPTION_NAME,
			description: "Name of the category",
			autocomplete: true,
			required: true,
		},
	],
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
