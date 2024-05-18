import { ENV } from "$utils/env";
import { Client, Events, GatewayIntentBits } from "discord.js";
import {
	handleAutocompleteInteraction,
	handleChatInputInteraction,
} from "./commands";

const client = new Client({ intents: [] });

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Client ready. Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, (interaction) => {
	if (interaction.isAutocomplete()) {
		return handleAutocompleteInteraction(interaction);
	}
	if (interaction.isChatInputCommand()) {
		return handleChatInputInteraction(interaction);
	}
});

client.login(ENV.DISCORD_TOKEN);
