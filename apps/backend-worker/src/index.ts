import { WorkerEntrypoint } from "cloudflare:workers";
import { Reports } from "./endpoints/reports";
import type { CustomEnv } from "./types";
import { Kysely } from "kysely";
import type { DB } from "./db-types";
import { SerializePlugin } from "kysely-plugin-serialize";
import { D1Dialect } from "./kysely-d1";
import { Categories } from "./endpoints/categories";
import { Communities } from "./endpoints/communities";

export class FDGLBackend extends WorkerEntrypoint<Env> {
	reports: Reports;
	categories: Categories;
	communities: Communities;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		const customEnv: CustomEnv = {
			...env,
			d1_db: env.DB,
			DB: new Kysely<DB>({
				dialect: new D1Dialect({ database: env.DB }),
				plugins: [new SerializePlugin()],
			}),
		};

		this.reports = new Reports(customEnv);
		this.categories = new Categories(customEnv);
		this.communities = new Communities(customEnv);
	}
}

export default class extends WorkerEntrypoint {
	async fetch() {
		return new Response("OK");
	}
}
