import type { APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";
import { ExecutionData as Ping } from "./ping";
import { ExecutionData as Categories } from "./categories";
import type { CustomEnv } from "../types";

export async function handleCommandInteraction(
	interaction: APIChatInputApplicationCommandInteraction,
	env: CustomEnv,
) {
	switch (interaction.data.name) {
		case Ping.config.name:
			return await Ping.handler(interaction, env);
		case Categories.config.name:
			return await Categories.handler(interaction, env);
		default:
			throw new Error(`Unhandled command: ${interaction.data.name}`);
	}
}
