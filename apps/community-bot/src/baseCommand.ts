import type {
	APIApplicationCommandInteraction,
	APIInteractionResponse,
} from "discord-api-types/v10";

export interface BaseCommand {
	name: string;
	handler: (
		interaction: APIApplicationCommandInteraction,
	) => Promise<APIInteractionResponse>;
}
