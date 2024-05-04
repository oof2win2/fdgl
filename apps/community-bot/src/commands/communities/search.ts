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
} from "@/utils/commands/types";
import {
	getFocusedInteractionOption,
	getStringOption,
} from "@/utils/discord/getCommandOption";
import { stringSimilarity } from "string-similarity-js";

const COMMUNITY_OPTION_NAME = "community" as const;

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const id = getStringOption(
		interaction.data.options,
		COMMUNITY_OPTION_NAME,
		true,
	);
	const community = await env.FDGL.communities.getCommunity(id);

	if (!community)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "The community could not be found",
				flags: MessageFlags.Ephemeral,
			},
		};

	const embed: APIEmbed = {};
	embed.title = "FDGL Community Info";
	embed.fields = [
		{
			name: "Community Name",
			value: community.name,
		},
		{
			name: "Community Contact",
			value: community.contact,
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

const Config: CommandConfig = {
	name: "search",
	description: "Search through communities present in FDGL",
	type: "Command",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: COMMUNITY_OPTION_NAME,
			description: "Name of the community",
			autocomplete: true,
			required: true,
		},
	],
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
