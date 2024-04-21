import { InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import type {
	BaseCommandHandler,
	CommandExecutionData,
} from "../../baseCommand";

export const ListCategoriesConfig = {
	name: "list",
	description: "List all categories present in FDGL",
};

const handler: BaseCommandHandler = async (_, env) => {
	const categories = await env.FDGL.categories.getAllCategories();
	const msg =
		categories
			.map((category) => {
				return `${category.id}: ${category.name}\n${category.description}\n`;
			})
			.join("\n") || "There are currently no categories in the system";
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: msg.slice(0, 2000),
			flags: MessageFlags.Ephemeral,
		},
	};
};

export const ListCategoriesExecutionData: CommandExecutionData = {
	config: ListCategoriesConfig,
	handler,
};
