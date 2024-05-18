import * as z from "zod";

const schema = z.object({
	MASTER_API_KEY: z.string({ description: "Master API key to access the API" }),
	DATABASE_URL: z.string({ description: "URL of the SQLite database" }),
	DISCORD_APPLICATION_ID: z.string({
		description: "Your Discord application ID",
	}),
	DISCORD_TOKEN: z.string({ description: "Your Discord bot token" }),
	DISCORD_DEV_GUILDID: z.string({
		description: "Your development Discord Guild ID",
	}),
	FDGL_API_URL: z.string().url(),
});

export const ENV = schema.parse(Bun.env);
