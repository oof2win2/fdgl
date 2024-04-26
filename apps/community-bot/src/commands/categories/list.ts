import {
	ButtonStyle,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	type APIEmbed,
	type ApplicationCommandOptionType,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v10";
import type {
	AutocompleteHandler,
	BaseCommandHandler,
	CommandExecutionData,
} from "../../baseCommand";
import { getFocusedInteractionOption } from "../../utils/discord/getCommandOption";
import stringSimilarity from "string-similarity-js";

export const ListCategoriesConfig: RESTPostAPIApplicationGuildCommandsJSONBody =
	{
		name: "list",
		description: "List all categories present in FDGL",
	};

const handler: BaseCommandHandler = async (interaction, env) => {
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

const autocomplete: AutocompleteHandler = async (interaction, env) => {
	const categories = await env.FDGL.categories.getAllCategories();
	const focused = getFocusedInteractionOption(interaction.data.options);
	const sortedBySimilarity = categories
		.map((c) => ({
			name: c.name,
			value: c.id,
			sim: focused ? stringSimilarity(c.name, focused.name) : 0,
		}))
		.sort((a, b) => a.sim - b.sim);
	return {
		type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		data: {
			choices: sortedBySimilarity.slice(0, 25),
		},
	};
};

export const ListCategoriesExecutionData: CommandExecutionData = {
	config: ListCategoriesConfig,
	handler,
	autocomplete,
};

export default ListCategoriesConfig;
