import {
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	type APIEmbed,
} from "discord-api-types/v10";
import type { ChatInputCommandHandler, CommandConfig } from "@/utils/commands";
import { datePlus } from "itty-time";

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const categories = await env.FDGL.categories.getAllCategories();

	if (!categories.length)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "There are currently no categories in the FDGL system",
				flags: MessageFlags.Ephemeral,
			},
		};

	const embed: APIEmbed = {};
	embed.title = "FDGL Categories";
	embed.description = "All Categories within the FDGL system";

	const fields = categories.map((category) => {
		return {
			name: `${category.name} (\`${category.id}\`)`,
			value: category.description,
		};
	});

	embed.fields = fields.slice(0, 10);

	await env.DB.insertInto("PagedData")
		.values({
			id: interaction.id,
			currentPage: 0,
			data: fields,
			expiresAt: datePlus("5 minutes"),
		})
		.execute();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
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
		},
	};
};

const Config: CommandConfig = {
	name: "list",
	description: "List all categories present in FDGL",
	type: "Command",
	ChatInputHandler: handler,
};

export default Config;
