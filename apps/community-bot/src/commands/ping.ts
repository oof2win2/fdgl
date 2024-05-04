import {
	type CommandConfig,
	type ChatInputCommandHandler,
} from "../baseCommand";
import { createRegister } from "../utils/commands/register";
import { createHandler } from "../utils/commands/handler";
import { InteractionResponseType, MessageFlags } from "discord-api-types/v10";

const Config: CommandConfig = {
	name: "ping",
	description: "Ping the bot",
};

const handler: ChatInputCommandHandler = async () => {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: "Pong!",
			flags: MessageFlags.Ephemeral,
		},
	};
};

export const Register = createRegister({
	name: Config.name,
	description: Config.description,
	type: "Command",
	ChatInputHandler: handler,
});

const Handler = createHandler({
	name: Config.name,
	description: Config.description,
	type: "Command",
	ChatInputHandler: handler,
});

export default Handler;
