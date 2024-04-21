import {
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
} from "discord-api-types/v10";
import type {
	BaseCommandHandler,
	CommandExecutionData,
} from "../../baseCommand";
import { EmbedBuilder } from "@discordjs/builders";
import { nanoid } from "nanoid";

export const ListCategoriesConfig = {
	name: "list",
	description: "List all categories present in FDGL",
};

const handler: BaseCommandHandler = async (interaction, env) => {
	const categories = await env.FDGL.categories.getAllCategories();

	const embed = new EmbedBuilder()
		.setTitle("FDGL Categories")
		.setDescription("All Categories within the FDGL system")
		.setTimestamp();

	const fields = categories.map((category) => {
		return {
			name: `${category.name} (\`${category.id}\`)`,
			value: category.description,
		};
	});

	embed.addFields(fields.slice(0, 10));

	await env.DB.insertInto("PagedData")
		.values({
			id: interaction.id,
			currentPage: 0,
			data: JSON.stringify(fields),
			expiresAt: new Date(),
		})
		.execute();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			embeds: [embed.toJSON()],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							custom_id: "paging_prev",
							style: ButtonStyle.Primary,
							emoji: { name: "⏮️" },
						},
						{
							type: ComponentType.Button,
							custom_id: "paging_next",
							style: ButtonStyle.Primary,
							emoji: { name: "⏭️" },
						},
					],
				},
			],
		},
	};
};

export const ListCategoriesExecutionData: CommandExecutionData = {
	config: ListCategoriesConfig,
	handler,
};
