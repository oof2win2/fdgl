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
	if (filterObject.communityFilters.length === 0) {
		await interaction.reply("You don't have any community filters set");
		return;
	}
	const communities = await fdgl.communities.getAll();

	const embed: APIEmbed = {};
	embed.title = "FDGL Filtered Communities";
	embed.description = "List of all communities in this guild's filters";
	const fields: APIEmbedField[] = filterObject.communityFilters.map((id) => {
		// biome-ignore lint/style/noNonNullAssertion: The community must exist in the filter object
		const community = communities.find((c) => c.id === id)!;
		return {
			name: community.name,
			value: `Contact: <@${community.contact}>`,
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
	.setDescription("View communities present in your filters");

const Config: CommandConfig = {
	name,
	command,
	type: "Command",
	ChatInputHandler: handler,
};

export default Config;
