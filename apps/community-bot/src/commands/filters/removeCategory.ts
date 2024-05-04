import {
	ApplicationCommandOptionType,
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	type APIEmbed,
	type APIEmbedField,
} from "discord-api-types/v10";
import type {
	AutocompleteHandler,
	ChatInputCommandHandler,
	CommandConfig,
	CommandExecutionData,
} from "../../baseCommand";
import { getFilterObject } from "../../utils/getFilterObject";
import {
	getFocusedInteractionOption,
	getStringOption,
} from "../../utils/discord/getCommandOption";
import { stringSimilarity } from "string-similarity-js";

const CATEGORY_OPTION_NAME = "category" as const;

export const RemoveCategoryFiltersConfig: CommandConfig = {
	name: "remove",
	group: "categories",
	description: "Remove a category from your filters",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: CATEGORY_OPTION_NAME,
			description: "Name of the category",
			autocomplete: true,
			required: true,
		},
	],
};

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const guildId = interaction.guild_id;
	if (!guildId)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This command must be ran in a guild",
			},
		};

	const filterObject = await getFilterObject(guildId, env);

	const id = getStringOption(
		interaction.data.options,
		CATEGORY_OPTION_NAME,
		true,
	);
	if (!filterObject.filteredCategories.includes(id)) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This category is not in your filters",
			},
		};
	}
	const category = await env.FDGL.categories.getCategory(id);

	if (!category)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "The category could not be found",
			},
		};
	const newFilters = filterObject.filteredCategories.filter(
		(id) => id !== category.id,
	);

	await env.FDGL.communities.updateFilterObject(
		filterObject.id,
		filterObject.filteredCommunities,
		newFilters,
	);

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `The category "${category.name}" was removed from your filters`,
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

export const RemoveCategoryFiltersExecutionData: CommandExecutionData = {
	config: RemoveCategoryFiltersConfig,
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default RemoveCategoryFiltersConfig;
