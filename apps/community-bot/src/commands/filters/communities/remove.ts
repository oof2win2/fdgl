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
} from "$utils/commands";
import { getFilterObject } from "$utils/getFilterObject";
import { stringSimilarity } from "string-similarity-js";
import { fdgl } from "$utils/fdgl";
import { SlashCommandSubcommandBuilder } from "discord.js";

const COMMUNITY_OPTION_NAME = "community" as const;

const handler: ChatInputCommandHandler = async (interaction) => {
	if (!interaction.inGuild()) {
		await interaction.reply({
			content: "This command must be ran in a guild",
		});
		return;
	}

	const filterObject = await getFilterObject(interaction.guildId);

	const id = interaction.options.getString(COMMUNITY_OPTION_NAME, true);
	if (!filterObject.communityFilters.includes(id)) {
		await interaction.reply("This community is not in your filters");
		return;
	}
	const community = await fdgl.communities.getById(id);

	if (!community) {
		await interaction.reply("The community could not be found");
		return;
	}
	const newFilters = filterObject.communityFilters.filter(
		(id) => id !== community.id,
	);

	await fdgl.filters.upsert({
		categoryFilters: filterObject.categoryFilters,
		communityFilters: newFilters,
	});

	await interaction.reply(
		`The community "${community.name}" was removed from your filters`,
	);
	return;
};

const autocomplete: AutocompleteHandler = async (interaction) => {
	const communities = await fdgl.communities.getAll();
	const focused = interaction.options.getFocused(true);
	if (focused.type !== ApplicationCommandOptionType.String) throw new Error();
	const sortedBySimilarity = communities
		.map((c) => ({
			name: c.name,
			value: c.id,
			sim: focused ? stringSimilarity(c.name, focused.value) : 0,
		}))
		.sort((a, b) => b.sim - a.sim);

	await interaction.respond(sortedBySimilarity.slice(0, 10));
	return;
};

const name = "remove";
const command = new SlashCommandSubcommandBuilder()
	.setName(name)
	.setDescription("Remove a community from your filters")
	.addStringOption((o) =>
		o
			.setName(COMMUNITY_OPTION_NAME)
			.setDescription("Name of the community to remove")
			.setRequired(true)
			.setAutocomplete(true),
	);

const Config: CommandConfig = {
	name,
	command,
	type: "Command",
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
