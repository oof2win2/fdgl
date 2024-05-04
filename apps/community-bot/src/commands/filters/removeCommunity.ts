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

const COMMUNITY_OPTION_NAME = "community" as const;

export const RemoveCommunityFiltersConfig: CommandConfig = {
	name: "remove",
	group: "communities",
	description: "Remove a community from your filters",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: COMMUNITY_OPTION_NAME,
			description: "Name of the community",
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
		COMMUNITY_OPTION_NAME,
		true,
	);
	if (!filterObject.filteredCommunities.includes(id)) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This community is not in your filters",
			},
		};
	}
	const community = await env.FDGL.communities.getCommunity(id);

	if (!community)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "The community could not be found",
			},
		};
	const newFilters = filterObject.filteredCommunities.filter(
		(id) => id !== community.id,
	);

	await env.FDGL.communities.updateFilterObject(
		filterObject.id,
		newFilters,
		filterObject.filteredCategories,
	);

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `The community "${community.name}" was removed from your filters`,
		},
	};
};

const autocomplete: AutocompleteHandler = async (interaction, env) => {
	const communities = await env.FDGL.communities.getAllCommunities();
	const focused = getFocusedInteractionOption(
		interaction.data.options,
		ApplicationCommandOptionType.String,
	);
	const sortedBySimilarity = communities
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

export const RemoveCommunityFiltersExecutionData: CommandExecutionData = {
	config: RemoveCommunityFiltersConfig,
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default RemoveCommunityFiltersConfig;
