import { WorkerEntrypoint } from "cloudflare:workers";
import type { CustomEnv } from "./types";
import { Kysely } from "kysely";
import type { DB } from "./db-types";
import { SerializePlugin } from "kysely-plugin-serialize";
import { D1Dialect } from "./kysely-d1";
import { Reports } from "./endpoints/reports";
import { Categories } from "./endpoints/categories";
import { Communities } from "./endpoints/communities";

export class FDGLService extends WorkerEntrypoint<Env> {
	#categories: Categories;
	#communities: Communities;
	#reports: Reports;
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
		this.#categories = new Categories(customEnv);
		this.#communities = new Communities(customEnv);
		this.#reports = new Reports(customEnv);
	}

	get categories() {
		return {
			getCategory: this.#categories.getCategory.bind(this.#categories),
			getAllCategories: this.#categories.getAllCategories.bind(
				this.#categories,
			),
			health: this.#categories.health.bind(this.#categories),
		};
	}
}

// this export must be present, it errors without a default fetch import
export default {
	async fetch() {
		return new Response("FDGLService is healthy");
	},
};
