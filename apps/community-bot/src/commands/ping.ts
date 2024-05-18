import {
	createRegister,
	createHandler,
	type ChatInputCommandHandler,
} from "$utils/commands";
import { InteractionResponseType, MessageFlags } from "discord-api-types/v10";
import { SlashCommandBuilder } from "discord.js";

const Config = {
	name: "ping",
	description: "Ping the bot",
};

const handler: ChatInputCommandHandler = async (interaction) => {
	await interaction.reply({
		content: "Pong!",
		ephemeral: true,
	});
};

const command = new SlashCommandBuilder()
	.setName(Config.name)
	.setDescription(Config.description);

const Handler = createHandler({
	name: Config.name,
	type: "Command",
	command,
	ChatInputHandler: handler,
});

export default Handler;
