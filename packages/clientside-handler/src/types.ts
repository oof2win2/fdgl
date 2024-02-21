export type IgnorelistEntry = {
	playername: string;
	reason: string | null;
	// ISO 8601 string
	createdAt: string;
	createdBy: string;
};

export type BlacklistEntry = {
	playername: string;
	reason: string | null;
	// ISO 8601 string
	createdAt: string;
	createdBy: string;
};

export type Action = {
	id: string;
	categoryIds: string[];

	runCommand: string;
	undoCommand: string;
};

export type ActionLog = {
	id: number;
	// ISO 8601 string
	executedAt: string;
	command: string;
};

export type FactorioServer = {
	id: number;
	name: string;
	isRunning: boolean;
};
