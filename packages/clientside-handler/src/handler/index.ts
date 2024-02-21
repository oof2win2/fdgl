import type { Report } from "@fdgl/types";
import type { DatabaseAdapter } from "../database-adapter";
import { onReportCreated } from "./reportCreated";
import type { ServerAdapter } from "../server-handler";

export class Handler {
	private db: DatabaseAdapter;
	private servers: ServerAdapter;
	constructor(db: DatabaseAdapter, servers: ServerAdapter) {
		this.db = db;
		this.servers = servers;
	}

	async onReportCreated(report: Report) {
		onReportCreated(report, this.db, this.servers);
	}
}
