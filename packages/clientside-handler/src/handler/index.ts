import type { DatabaseAdapter } from "../database-adapter";
import type { ServerAdapter } from "../server-handler";

export class Handler {
	private db: DatabaseAdapter;
	private servers: ServerAdapter;
	constructor(db: DatabaseAdapter, servers: ServerAdapter) {
		this.db = db;
		this.servers = servers;
	}
}
