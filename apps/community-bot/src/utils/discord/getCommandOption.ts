import {
	ApplicationCommandOptionType,
	type APIApplicationCommandInteractionDataAttachmentOption,
	type APIApplicationCommandInteractionDataOption,
} from "discord-api-types/v10";

function getTypedOption<T extends ApplicationCommandOptionType>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	type: T,
): (APIApplicationCommandInteractionDataOption & { type: T }) | null {
	if (!options) return null;
	const option = options.find((o) => o.name === name && o.type === type);
	if (!option) return null;
	if (option.type === type)
		return option as APIApplicationCommandInteractionDataOption & { type: T };
	throw new Error("invalid option type");
}

export function getStringOption(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	required: true,
): string;
export function getStringOption(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	required?: boolean,
): string | null;
export function getStringOption(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	required = false,
) {
	const option = getTypedOption(
		options,
		name,
		ApplicationCommandOptionType.String,
	);
	if (!option) {
		if (required) throw new Error("Option is required but missing");
		return null;
	}

	return option.value;
}

export function getAttachmentOption(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	required: true,
): string;
export function getAttachmentOption(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	required?: boolean,
): string | null;
export function getAttachmentOption(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	required = false,
) {
	const option = getTypedOption(
		options,
		name,
		ApplicationCommandOptionType.Attachment,
	);
	if (!option) {
		if (required) throw new Error("Option is required but missing");
		return null;
	}

	return option.value;
}

export function getFocusedInteractionOption<
	T extends ApplicationCommandOptionType,
>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	type: T,
): (APIApplicationCommandInteractionDataOption & { type: T }) | null {
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

		if (option.type === type && option.focused)
			return option as APIApplicationCommandInteractionDataOption & { type: T };
	}
	return null;
}
