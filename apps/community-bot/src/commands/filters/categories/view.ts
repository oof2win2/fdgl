import type { ChatInputCommandHandler, CommandConfig } from "$utils/commands";
import { getFilterObject } from "$utils/getFilterObject";
import { datePlus } from "itty-time";
import { fdgl } from "$utils/fdgl";
import { db } from "$utils/db";
import {
	type APIEmbed,
	type APIEmbedField,
	ComponentType,
	ButtonStyle,
	SlashCommandSubcommandBuilder,
} from "discord.js";

const handler: ChatInputCommandHandler = async (interaction) => {
	if (!interaction.inGuild()) {
		await interaction.reply({
			content: "This command must be ran in a guild",
		});
		return;
	}

	const filterObject = await getFilterObject(interaction.guildId);
	if (filterObject.categoryFilters.length === 0) {
		await interaction.reply("You don't have any category filters set");
		return;
	}
	const categories = await fdgl.categories.getAll();

	const embed: APIEmbed = {};
	embed.title = "FDGL Filtered Categories";
	embed.description = "List of all categories in this guild's filters";
	const fields: APIEmbedField[] = filterObject.categoryFilters.map((id) => {
		// biome-ignore lint/style/noNonNullAssertion: The category must exist in the filter object
		const category = categories.find((c) => c.id === id)!;
		return {
			name: category.name,
			value: category.description,
		};
	});
	embed.fields = fields.slice(0, 10);

	await db
		.insertInto("PagedData")
		.values({
			id: interaction.id,
			currentPage: 0,
			data: fields,
			expiresAt: datePlus("5 minutes"),
		})
		.execute();

	await interaction.reply({
		embeds: [embed],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						custom_id: "paging_prev",
						style: ButtonStyle.Primary,
						emoji: { name: "⬅️" },
					},
					{
						type: ComponentType.Button,
						custom_id: "paging_next",
						style: ButtonStyle.Primary,
						emoji: { name: "➡️" },
					},
				],
			},
		],
	});
	return;
};

const name = "view";
const command = new SlashCommandSubcommandBuilder()
	.setName(name)
	.setDescription("View categories present in your filters");

const Config: CommandConfig = {
	name,
	command,
	type: "Command",
	ChatInputHandler: handler,
};

export default Config;
