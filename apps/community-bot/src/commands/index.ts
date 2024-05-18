import Ping from "./ping";
import Categories from "./categories";
// import Communities from "./communities";
// import Filters from "./filters";
// import Reports from "./reports";
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from "discord.js";

const commands = [Ping, Categories];

export async function handleChatInputInteraction(
	interaction: ChatInputCommandInteraction,
) {
	for (const command of commands) {
		if (interaction.commandName === command.name)
			return await command.ChatInputHandler(interaction);
	}
	throw new Error(`Unhandled command: ${interaction.commandName}`);
}

export async function handleAutocompleteInteraction(
	interaction: AutocompleteInteraction,
) {
	for (const command of commands) {
		console.log(interaction.commandName);
		if (interaction.commandName === command.name) {
			if (!command.AutocompleteHandler)
				throw new Error(
					`Command ${command.name} doesn't have an autocomplete handler`,
				);
			return await command.AutocompleteHandler(interaction);
		}
	}
	throw new Error(`Unhandled command: ${interaction.commandName}`);
}
