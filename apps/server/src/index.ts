import { Kysely } from "kysely";
import router from "./router";
import type { DB } from "./db-types";
import { D1Dialect } from "kysely-d1";
import type { CustomEnv } from "./types";
import { error, json } from "itty-router";
import { SerializePlugin } from "kysely-plugin-serialize";

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const customEnv: CustomEnv = {
			...env,
			DB: new Kysely<DB>({
				dialect: new D1Dialect({ database: env.DB }),
				plugins: [new SerializePlugin()],
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
