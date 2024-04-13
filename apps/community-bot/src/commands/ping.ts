import { InteractionResponseType } from "discord-interactions";
import type { BaseCommand } from "../baseCommand";
import { getMessageFlags } from "../utils/getMessageFlags";

export const Ping: BaseCommand = {
	name: "ping",
	handler: async (interaction) => {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "Pong!",
				flags: getMessageFlags("EPHEMERAL"),
			},
		};
	},
};
