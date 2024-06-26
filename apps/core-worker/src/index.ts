import { WorkerEntrypoint } from "cloudflare:workers";
import { Kysely } from "kysely";
import type { DB, ReportProof, CustomEnv, R2EventNotification } from "./types";
import { SerializePlugin } from "kysely-plugin-serialize";
import { D1Dialect } from "./kysely-d1";
import { Reports } from "./endpoints/reports";
import { Categories } from "./endpoints/categories";
import { Communities } from "./endpoints/communities";
import type { MessageBatch } from "@cloudflare/workers-types";
import { getFiletypeForExtension, isValidFileEnding } from "./utils/filetypes";
import { Misc } from "./endpoints/misc";

type PickMatching<T, V> = {
	[K in keyof T as T[K] extends V ? K : never]: T[K];
};
// biome-ignore lint/complexity/noBannedTypes: it's okay here as it is only a picker
type ExtractMethods<T> = PickMatching<T, Function>;

export class FDGLService extends WorkerEntrypoint<Env> {
	#categories: Categories;
	#communities: Communities;
	#reports: Reports;
	#misc: Misc;

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
		this.#misc = new Misc(customEnv);
	}

	get categories() {
		// biome-ignore format: its nicer in one line
		return {
			getCategory: this.#categories.getCategory.bind(this.#categories),
			getAllCategories: this.#categories.getAllCategories.bind(this.#categories),
			createCategory: this.#categories.createCategory.bind(this.#categories),
			mergeCategories: this.#categories.mergeCategories.bind(this.#categories),
			updateCategory: this.#categories.updateCategory.bind(this.#categories),
		} satisfies ExtractMethods<Categories>;
	}

	get communities() {
		// biome-ignore format: its nicer in one line
		return {
			getCommunity: this.#communities.getCommunity.bind(this.#communities),
			getAllCommunities: this.#communities.getAllCommunities.bind(this.#communities),
			createCommunity: this.#communities.createCommunity.bind(this.#communities),
			mergeCommunities: this.#communities.mergeCommunities.bind(this.#communities),
			getFilterObject: this.#communities.getFilterObject.bind(this.#communities),
			createFilterObject: this.#communities.createFilterObject.bind(this.#communities),
			updateFilterObject: this.#communities.updateFilterObject.bind(this.#communities)
		} satisfies ExtractMethods<Communities>;
	}

	get reports() {
		// biome-ignore format: its nicer in one line
		return {
			getReport: this.#reports.getReport.bind(this.#reports),
			getReports: this.#reports.getReports.bind(this.#reports),
			createReport: this.#reports.createReport.bind(this.#reports),
			revokeReport: this.#reports.revokeReport.bind(this.#reports)
		} satisfies ExtractMethods<Reports>
	}

	get misc() {
		return {
			getSystemEvents: this.#misc.getSystemEvents.bind(this.#misc),
		} satisfies ExtractMethods<Misc>;
	}
}

// this export must be present, it errors without a default fetch import
export default {
	async fetch() {
		return new Response("FDGLService is healthy");
	},

	// queue handler for R2 bucket event notifications
	async queue(
		batch: MessageBatch<R2EventNotification>,
		env: Env,
	): Promise<void> {
		const db = new Kysely<DB>({
			dialect: new D1Dialect({ database: env.DB }),
			plugins: [new SerializePlugin()],
		});

		const messages: ReportProof[] = [];

		for (const msg of batch.messages) {
			if (msg.body.action !== "PutObject") continue;
			if (msg.body.bucket !== env.R2_BUCKET_NAME) continue;
			const filename = msg.body.object.key;
			const [reportId, proofId, fileend] = filename.split(".");
			if (isValidFileEnding(fileend)) {
				messages.push({
					proofId,
					reportId,
					filetype: getFiletypeForExtension(fileend),
				});
				// ack the message if it is valid
				msg.ack();
			}
		}

		await db
			.insertInto("ReportProof")
			.values(messages)
			.onConflict((cb) => cb.doNothing())
			.execute();

		batch.ackAll();
	},
};
