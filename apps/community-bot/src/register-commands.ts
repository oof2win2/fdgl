import type { RESTPostAPIApplicationGuildCommandsJSONBody } from "discord-api-types/v10";
import { commands } from "@/utils/commands/baseCommand";

const config = Bun.TOML.parse(await Bun.file(".dev.vars").text());

const url = `https://discord.com/api/v10/applications/${config.DISCORD_APPLICATION_ID}/guilds/${config.DISCORD_TESTING_GUILDID}/commands`;

for (const command of commands) {
	const data = await import(`./commands/${command}`);
	const registerData =
		data.Register as RESTPostAPIApplicationGuildCommandsJSONBody;
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify(registerData),
		headers: {
			Authorization: `Bot ${config.DISCORD_BOT_TOKEN}`,
			"content-type": "application/json",
		},
	});
	if (res.ok) {
		console.log(`Command ${registerData.name} imported successfully`);
	} else {
		console.log(JSON.stringify(registerData, null, 2));
		console.log(JSON.stringify(await res.json(), null, 2));
	}
}
