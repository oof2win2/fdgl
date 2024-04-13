const config = Bun.TOML.parse(await Bun.file(".dev.vars").text());

const url = `https://discord.com/api/v10/applications/${config.DISCORD_APPLICATION_ID}/guilds/${config.DISCORD_TESTING_GUILDID}/commands`;

const res = await fetch(url, {
	method: "POST",
	body: JSON.stringify({
		name: "ping",
		type: 1,
		description: "Ping the bot",
	}),
	headers: {
		Authorization: `Bot ${config.DISCORD_BOT_TOKEN}`,
		"content-type": "application/json",
	},
});
const body = await res.json();
console.log(JSON.stringify(body, null, 2));
// console.log();
