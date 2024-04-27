import {
	ApplicationCommandType,
	InteractionResponseType,
	MessageFlags,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
} from "discord-api-types/v10";
import type {
	ChatInputCommandHandler,
	CommandExecutionData,
	CommandConfig,
} from "../baseCommand";

const Config: CommandConfig = {
	name: "ping",
	description: "Ping the bot",
};

const Handler: ChatInputCommandHandler = async () => {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: "Pong!",
			flags: MessageFlags.Ephemeral,
		},
	};
};

export const Register: RESTPostAPIApplicationGuildCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: Config.name,
	description: Config.description,
};

export const ExecutionData: CommandExecutionData = {
	ChatInputHandler: Handler,
	config: Config,
};

export default Config;
