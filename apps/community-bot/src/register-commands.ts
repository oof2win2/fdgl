import { commands } from "./baseCommand";

const config = Bun.TOML.parse(await Bun.file(".dev.vars").text());

const url = `https://discord.com/api/v10/applications/${config.DISCORD_APPLICATION_ID}/guilds/${config.DISCORD_TESTING_GUILDID}/commands`;

for (const command of commands) {
	const data = await import(`./commands/${command}`);
	const registerData = data.Register;
	console.log(registerData);
	const res = await fetch(url, {
		method: "POST",
		body: JSON.stringify(registerData),
		headers: {
			Authorization: `Bot ${config.DISCORD_BOT_TOKEN}`,
			"content-type": "application/json",
		},
	});
	console.log(await res.json());
}
