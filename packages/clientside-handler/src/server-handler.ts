export interface ServerAdapter {
	/**
	 * Execute a command across all available servers. Must not throw errors
	 */
	executeAllServers(command: string): Promise<void>;

	/**
	 * Get the current server status by server ID. Must not throw errors
	 */
	isServerRunning(id: number): Promise<boolean>;
}
