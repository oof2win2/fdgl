export interface BaseCommand {
	name: string;
	handler: (interaction: unknown) => Promise<any>;
}
