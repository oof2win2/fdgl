import {
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	TextInputStyle,
} from "discord-api-types/v10";
import type { BaseCommand } from "../baseCommand";

export const Ping: BaseCommand = {
	name: "ping",
	handler: async () => {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "Pong!",
				flags: MessageFlags.Ephemeral,
			},
		};
	},
};
