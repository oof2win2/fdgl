import {
	ApplicationCommandOptionType,
	InteractionResponseType,
	MessageFlags,
	type APIEmbed,
	type InteractionType,
} from "discord-api-types/v10";
import type {
	AutocompleteHandler,
	ChatInputCommandHandler,
	CommandConfig,
	CommandExecutionData,
} from "../../baseCommand";
import {
	getFocusedInteractionOption,
	getStringOption,
} from "../../utils/discord/getCommandOption";
import { stringSimilarity } from "string-similarity-js";

export const SearchCategoriesConfig: CommandConfig = {
	name: "search",
	description: "Search through categories present in FDGL",
};

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const id = getStringOption(interaction.data.options, "category", true);
	const category = await env.FDGL.categories.getCategory(id);

	if (!category)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: `The category with ID ${id} does not exist`,
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
	console.log(sortedBySimilarity);
	return {
		type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		data: {
			choices: sortedBySimilarity.slice(0, 10), // max of 25 autocomplete options
		},
	};
};

export const SearchCategoriesExecutionData: CommandExecutionData = {
	config: SearchCategoriesConfig,
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default SearchCategoriesConfig;
