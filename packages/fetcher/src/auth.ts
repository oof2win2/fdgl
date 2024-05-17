class NoApikeyError extends Error {
	name = "NoApikeyError";
	message =
		"This message requires an API key but the client was not provided one";
}

export class AuthManager {
	private apikey: string | null = null;

	getAuth(): string {
		const key = this.apikey;
		if (key) this.apikey;
		throw NoApikeyError;
	}

	setKey(key: string) {
		this.apikey = key;
	}
}
