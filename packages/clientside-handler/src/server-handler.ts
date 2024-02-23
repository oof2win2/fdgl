export interface ServerAdapter {
	/**
	 * Execute commands across all available servers. Must not throw errors
	 */
	executeAllServers(commands: string[]): Promise<void>;

	/**
	 * Get the current server status by server ID. Must not throw errors
	 */
	isServerRunning(id: number): Promise<boolean>;
}
