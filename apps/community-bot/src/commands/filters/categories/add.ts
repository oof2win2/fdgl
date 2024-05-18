import type {
	AutocompleteHandler,
	ChatInputCommandHandler,
	CommandConfig,
} from "$utils/commands";
import { fdgl } from "$utils/fdgl";
import { getFilterObject } from "$utils/getFilterObject";
import {
	ApplicationCommandOptionType,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { stringSimilarity } from "string-similarity-js";

const CATEGORY_OPTION_NAME = "category" as const;

const handler: ChatInputCommandHandler = async (interaction) => {
	if (!interaction.inGuild()) {
		await interaction.reply({
			content: "This command must be ran in a guild",
		});
		return;
	}

	const filterObject = await getFilterObject(interaction.guildId);

	const id = interaction.options.getString(CATEGORY_OPTION_NAME, true);
	if (filterObject.categoryFilters.includes(id)) {
		await interaction.reply("This category is already present in your filters");
		return;
	}
	const category = await fdgl.categories.getById(id);

	if (!category) {
		await interaction.reply("The category could not be found");
		return;
	}

	await fdgl.filters.upsert({
		categoryFilters: [...filterObject.categoryFilters, category.id],
		communityFilters: filterObject.communityFilters,
	});

	await interaction.reply(
		`The category "${category.name}" was added to your filters`,
	);
	return;
};

const autocomplete: AutocompleteHandler = async (interaction) => {
	const categories = await fdgl.categories.getAll();
	const focused = interaction.options.getFocused(true);
	if (focused.type !== ApplicationCommandOptionType.String) throw new Error();
	const sortedBySimilarity = categories
		.map((c) => ({
			name: c.name,
			value: c.id,
			sim: focused ? stringSimilarity(c.name, focused.value) : 0,
		}))
		.sort((a, b) => b.sim - a.sim);

	await interaction.respond(sortedBySimilarity.slice(0, 10));
	return;
};

const name = "add";
const command = new SlashCommandSubcommandBuilder()
	.setName(name)
	.setDescription("Add a category to your filters")
	.addStringOption((o) =>
		o
			.setName(CATEGORY_OPTION_NAME)
			.setDescription("Name of the category to add")
			.setRequired(true)
			.setAutocomplete(true),
	);

const Config: CommandConfig = {
	name: "add",
	type: "Command",
	command,
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
