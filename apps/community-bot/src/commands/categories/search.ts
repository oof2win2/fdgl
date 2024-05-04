import {
	ApplicationCommandOptionType,
	InteractionResponseType,
	MessageFlags,
	type APIEmbed,
} from "discord-api-types/v10";
import type {
	CommandConfig,
	AutocompleteHandler,
	ChatInputCommandHandler,
} from "../../utils/commands/types";
import {
	getFocusedInteractionOption,
	getStringOption,
} from "../../utils/discord/getCommandOption";
import { stringSimilarity } from "string-similarity-js";

const CATEGORY_OPTION_NAME = "category" as const;

const handler: ChatInputCommandHandler = async (interaction, env) => {
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
				flags: MessageFlags.Ephemeral,
			},
		};

	const embed: APIEmbed = {};
	embed.title = "FDGL Category Info";
	embed.fields = [
		{
			name: "Category Name",
			value: category.name,
		},
		{
			name: "Category Description",
			value: category.description,
		},
	];

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [embed],
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
	name: "search",
	description: "Search through categories present in FDGL",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: CATEGORY_OPTION_NAME,
			description: "Name of the category",
			autocomplete: true,
			required: true,
		},
	],
	type: "Command",
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
