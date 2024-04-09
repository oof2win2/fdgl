import { Kysely, ParseJSONResultsPlugin } from "kysely";
import router from "./router";
import type { DB } from "./db-types";
import { D1Dialect } from "kysely-d1";
import type { CustomEnv } from "./types";
import { error, json } from "itty-router";

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const customEnv: CustomEnv = {
			...env,
			kysely: new Kysely<DB>({
				dialect: new D1Dialect({ database: env.DB }),
				plugins: [new ParseJSONResultsPlugin()],
			}),
		};
		return router
			.handle(request, customEnv, ctx)
			.then(json)
			.catch((err) => {
				console.error(err);
				return error(500, "An error occured");
			});
	},
};
