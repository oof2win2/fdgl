export interface LogAdapter {
	info: (message: string) => void | Promise<void>;
	debug: (message: string) => void | Promise<void>;
	error: (message: string) => void | Promise<void>;
	warn: (message: string) => void | Promise<void>;
}
