type MessageFlag =
	| "SUPPRESS_EMBEDS"
	| "URGENT"
	| "EPHEMERAL"
	| "LOADING"
	| "SUPPRESS_NOTIFICATIONS";

export function getMessageFlags(...flags: MessageFlag[]): number {
	let base = 0;

	for (const flag of flags) {
		switch (flag) {
			case "SUPPRESS_EMBEDS":
				base |= 1 << 2;
				break;
			case "EPHEMERAL":
				base |= 1 << 6;
		}
	}

	return base;
}
