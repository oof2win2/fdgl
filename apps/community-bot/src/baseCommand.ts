import {
	ApplicationCommandOptionType,
	type APIChatInputApplicationCommandInteraction,
	type APIInteractionResponse,
} from "discord-api-types/v10";
import type { CustomEnv } from "./types";

export type BaseCommandHandler = (
	interaction: APIChatInputApplicationCommandInteraction,
	env: CustomEnv,
) => Promise<APIInteractionResponse>;

export type CommandConfig = {
	name: string;
	description: string;
};

export type CommandExecutionData = {
	handler: BaseCommandHandler;
	config: CommandConfig;
};

export const commands = ["ping", "categories"];

export const CommandWithSubcommandsHandler = (
	subcommands: CommandExecutionData[],
): BaseCommandHandler => {
	return (interaction, env) => {
		const options = interaction.data.options ?? [];
		const subcommand = options.find(
			(o) =>
				o.type === ApplicationCommandOptionType.Subcommand ||
				o.type === ApplicationCommandOptionType.SubcommandGroup,
		);
		if (!subcommand) throw new Error("subcommand not found");

		const sub = subcommands.find((s) => s.config.name === subcommand.name);
		if (!sub) throw new Error("subcommand not found");
		return sub.handler(interaction, env);
	};
};
