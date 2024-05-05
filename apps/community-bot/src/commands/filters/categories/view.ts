import {
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	type APIEmbed,
	type APIEmbedField,
} from "discord-api-types/v10";
import type { ChatInputCommandHandler, CommandConfig } from "@/utils/commands";
import { getFilterObject } from "@/utils/getFilterObject";
import { datePlus } from "itty-time";

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const guildId = interaction.guild_id;
	if (!guildId)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This command must be ran in a guild",
			},
		};

	const filterObject = await getFilterObject(guildId, env);
	if (filterObject.filteredCategories.length === 0) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "You don't have any category filters set",
			},
		};
	}
	const categories = await env.FDGL.categories.getAllCategories();

	const embed: APIEmbed = {};
	embed.title = "FDGL Filtered Categories";
	embed.description = "List of all categories in this guild's filters";
	const fields: APIEmbedField[] = filterObject.filteredCategories.map((id) => {
		// biome-ignore lint/style/noNonNullAssertion: The category must exist in the filter object
		const category = categories.find((c) => c.id === id)!;
		return {
			name: category.name,
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
	name: "view",
	description: "View categories present in your filters",
	type: "Command",
	ChatInputHandler: handler,
};

export default Config;
