import {
	AutoRouter,
	error,
	withContent,
	type RequestHandler,
} from "itty-router";
import { type CF, type CustomEnv, type RequestType } from "./types";
import { Kysely } from "kysely";
import { SerializePlugin } from "kysely-plugin-serialize";
import { D1Dialect } from "./kysely-d1";
import type { DB } from "./db-types";
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from "discord-interactions";
import { getJSONBody } from "./utils/json-body";
import { Ping } from "./commands/ping";

// the cloudflare Env has DB set to a D1Database, which isn't kysely
// we override that here so that it is better to work with
const withKyselyAsDb = (req: RequestType, env: CustomEnv) => {
	env.DB = new Kysely<DB>({
		dialect: new D1Dialect({ database: (env as unknown as Env).DB }),
		plugins: [new SerializePlugin()],
	});
};

const router = AutoRouter<RequestType, CF>({
	before: [withKyselyAsDb],
});

const verifyKeyMiddleware: RequestHandler = async (
	req: RequestType,
	env: CustomEnv,
) => {
	const signature = req.headers.get("X-Signature-Ed25519");
	const timestamp = req.headers.get("X-Signature-Timestamp");
	if (!signature || !timestamp)
		return error(401, { message: "Bad request signature" });
	const isValidRequest = verifyKey(
		JSON.stringify(req.content),
		signature,
		timestamp,
		env.DISCORD_PUBKEY,
	);
	console.log(isValidRequest);
	if (!isValidRequest) return error(401, { message: "Bad request signature" });
};

router.post(
	"/interactions",
	withContent,
	verifyKeyMiddleware,
	async (req, res) => {
		const interaction = req.content;
		if (interaction.type === InteractionType.PING) {
			return {
				type: InteractionResponseType.PONG,
			};
		}
		if (interaction.type === InteractionType.APPLICATION_COMMAND) {
			return Ping.handler(interaction);
		}
		return { status: "ok" };
	},
);
router.all("*", () => ({ message: "wrong url?" }));

export default router;
