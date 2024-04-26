import {
	ApplicationCommandOptionType,
	type APIApplicationCommandInteractionDataOption,
} from "discord-api-types/v10";

export function getCommandStringValue<Required extends boolean>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	required: Required,
): Required extends true ? string : string | undefined {
	if (!options) {
		if (required) throw new Error("Option not found");
		return undefined;
	}
	const option = options.find((o) => o.name === name);
	if (!option) {
		if (required) throw new Error("Option not found");
		return undefined;
	}
	if (option.type !== ApplicationCommandOptionType.String)
		throw new Error("Invalid option type");
	return option.value;
}

export function getFocusedInteractionOption(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
) {
	if (!options) return null;
	for (const option of options) {
		if (option.type === ApplicationCommandOptionType.Subcommand) continue;
		if (option.type === ApplicationCommandOptionType.SubcommandGroup) continue;
		if (option.type === ApplicationCommandOptionType.Attachment) continue;
		if (option.type === ApplicationCommandOptionType.Boolean) continue;
		if (option.type === ApplicationCommandOptionType.Channel) continue;
		if (option.type === ApplicationCommandOptionType.Mentionable) continue;
		if (option.type === ApplicationCommandOptionType.Role) continue;
		if (option.type === ApplicationCommandOptionType.User) continue;

		if (option.focused) return option;
	}
	return null;
}
