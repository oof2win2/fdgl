import type {
	CommandConfig,
	AutocompleteHandler,
	ChatInputCommandHandler,
} from "$utils/commands";
import { stringSimilarity } from "string-similarity-js";
import { fdgl } from "$utils/fdgl";
import { SlashCommandSubcommandBuilder, type APIEmbed } from "discord.js";

const COMMUNITY_OPTION_NAME = "community" as const;

const handler: ChatInputCommandHandler = async (interaction) => {
	const id = interaction.options.getString(COMMUNITY_OPTION_NAME, true);
	const community = await fdgl.communities.getById(id);

	if (!community) {
		await interaction.reply({
			content: "The community could not be found",
			ephemeral: true,
		});
		return;
	}

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

	interaction.reply({
		embeds: [embed],
	});
};

const autocomplete: AutocompleteHandler = async (interaction) => {
	const communities = await fdgl.communities.getAll();
	const focused = interaction.options.getFocused(true);
	const sortedBySimilarity = communities
		.map((c) => ({
			name: c.name,
			value: c.id,
			sim: focused ? stringSimilarity(c.name, focused.value) : 0,
		}))
		.sort((a, b) => b.sim - a.sim);

	interaction.respond(
		sortedBySimilarity.slice(0, 10), // max of 25 autocomplete options
	);
};

const name = "search";
const command = new SlashCommandSubcommandBuilder()
	.setName(name)
	.setDescription("Search through communities present in FDGL")
	.addStringOption((o) =>
		o
			.setName(COMMUNITY_OPTION_NAME)
			.setDescription("Name of the community")
			.setRequired(true)
			.setAutocomplete(true),
	);

const Config: CommandConfig = {
	name,
	type: "Command",
	command,
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
