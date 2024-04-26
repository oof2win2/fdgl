import {
	ComponentType,
	InteractionResponseType,
	type APIEmbedField,
	type APIInteractionResponse,
	type APIMessageComponentInteraction,
} from "discord-api-types/v10";
import type { CustomEnv } from "../../types";

export async function pagedMessageHandler(
	interaction: APIMessageComponentInteraction,
	env: CustomEnv,
): Promise<APIInteractionResponse> {
	const startingInteractionId = interaction.message.interaction?.id;
	if (!startingInteractionId)
		throw new Error(
			"handling paged message handler without previous interaction id",
		);
	const embed = interaction.message.embeds[0];
	if (!embed) throw new Error("no embed on paging wtf");

	const data = await env.DB.selectFrom("PagedData")
		.selectAll()
		.where("id", "=", startingInteractionId)
		.executeTakeFirst();
	// if we don't find the record then we remove the components from the bottom
	// so that it can't be re-executed
	if (!data)
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				embeds: interaction.message.embeds,
				components: [],
			},
		};

	const fields = data.data;

	let newPage = data.currentPage;
	if (interaction.data.custom_id === "paging_prev") {
		newPage--;
		if (newPage === -1) newPage = 0;
	} else {
		newPage++;
		const maxPageCount = Math.ceil(fields.length / 10) - 1;
		if (newPage > maxPageCount) newPage = maxPageCount;
	}

	await env.DB.updateTable("PagedData")
		.where("id", "=", startingInteractionId)
		.set({
			currentPage: newPage,
		})
		.execute();

	embed.fields = fields.slice(newPage * 10, newPage * 10 + 10);
	return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			embeds: [embed],
		},
	};
}
