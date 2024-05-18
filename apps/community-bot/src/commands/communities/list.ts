import type {
	CommandConfig,
	ChatInputCommandHandler,
} from "$utils/commands/types";
import { datePlus } from "itty-time";
import { fdgl } from "$utils/fdgl";
import { db } from "$utils/db";
import {
	ButtonStyle,
	ComponentType,
	SlashCommandSubcommandBuilder,
	type APIEmbed,
} from "discord.js";

const handler: ChatInputCommandHandler = async (interaction) => {
	const communities = await fdgl.communities.getAll();

	if (!communities.length) {
		await interaction.reply({
			content: "There are currently no communities in the FDGL system",
			ephemeral: true,
		});
		return;
	}

	const embed: APIEmbed = {};
	embed.title = "FDGL Communities";
	embed.description = "All Communities within the FDGL system";

	const fields = communities.map((category) => {
		return {
			name: `${category.name} (\`${category.id}\`)`,
			value: `Contact: ${category.contact}`,
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
};

const name = "list";
const command = new SlashCommandSubcommandBuilder()
	.setName(name)
	.setDescription("List all communities present in FDGL");

const Config: CommandConfig = {
	name,
	command,
	type: "Command",
	ChatInputHandler: handler,
};

export default Config;
