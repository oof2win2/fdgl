import type {
	CommandConfig,
	AutocompleteHandler,
	ChatInputCommandHandler,
} from "$utils/commands";
import { stringSimilarity } from "string-similarity-js";
import { fdgl } from "$utils/fdgl";
import {
	ApplicationCommandOptionType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";

const CATEGORY_OPTION_NAME = "category" as const;

const handler: ChatInputCommandHandler = async (interaction) => {
	const id = interaction.options.getString(CATEGORY_OPTION_NAME, true);
	const category = await fdgl.categories.getById(id);

	if (!category) {
		await interaction.reply({
			content: "The category could not be found",
			ephemeral: true,
		});
		return;
	}

	const embed = new EmbedBuilder();
	embed.setTitle("FDGL Category Info");
	embed.setFields(
		{
			name: "Category Name",
			value: category.name,
		},
		{
			name: "Category Description",
			value: category.description,
		},
	);

	await interaction.reply({
		embeds: [embed],
	});
	return;
};

const autocomplete: AutocompleteHandler = async (interaction) => {
	const categories = await fdgl.categories.getAll();
	const focused = interaction.options.getFocused(true);
	if (focused.type !== ApplicationCommandOptionType.String) {
		throw new Error("wtf");
	}
	const sortedBySimilarity = categories
		.map((c) => ({
			name: c.name,
			value: c.id,
			sim: focused ? stringSimilarity(c.name, focused.value) : 0,
		}))
		.sort((a, b) => b.sim - a.sim);

	await interaction.respond(sortedBySimilarity);
};

const name = "search";

const cmd = new SlashCommandSubcommandBuilder()
	.setName(name)
	.setDescription("Search through categories present in FDGL")
	.addStringOption((o) =>
		o.setName(CATEGORY_OPTION_NAME).setDescription("Name of the category"),
	);

const Config: CommandConfig = {
	name,
	type: "Command",
	command: cmd,
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
