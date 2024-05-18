import type { ChatInputCommandHandler, CommandConfig } from "$utils/commands";
import { datePlus } from "itty-time";
import { fdgl } from "$utils/fdgl";
import {
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { db } from "$utils/db";

const handler: ChatInputCommandHandler = async (interaction) => {
	const categories = await fdgl.categories.getAll();

	if (!categories.length) {
		await interaction.reply({
			content: "There are currently no categories in the FDGL system",
			ephemeral: true,
		});
		return;
	}

	const embed = new EmbedBuilder();
	embed.setTitle("FDGL Categories");
	embed.setDescription("All Categories within the FDGL system");

	const fields = categories.map((category) => {
		return {
			name: `${category.name} (\`${category.id}\`)`,
			value: category.description,
		};
	});

	embed.setFields(fields.slice(0, 10));

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
};

const name = "list";

const cmd = new SlashCommandSubcommandBuilder()
	.setName(name)
	.setDescription("List all categories present in FDGL");

const Config: CommandConfig = {
	name: "list",
	type: "Command",
	command: cmd,
	ChatInputHandler: handler,
};

export default Config;
