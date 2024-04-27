import {
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	type APIEmbed,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v10";
import type {
	ChatInputCommandHandler,
	CommandExecutionData,
} from "../../baseCommand";

export const ListCommunitiesConfig: RESTPostAPIApplicationGuildCommandsJSONBody =
	{
		name: "list",
		description: "List all communities present in FDGL",
	};

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const communities = await env.FDGL.communities.getAllCommunities();

	if (!communities.length)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "There are currently no communities in the FDGL system",
				flags: MessageFlags.Ephemeral,
			},
		};

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

	await env.DB.insertInto("PagedData")
		.values({
			id: interaction.id,
			currentPage: 0,
			data: fields,
			expiresAt: new Date(),
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

export const ListCommunitiesExecutionData: CommandExecutionData = {
	config: ListCommunitiesConfig,
	ChatInputHandler: handler,
};

export default ListCommunitiesConfig;
