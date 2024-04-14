import type { CustomEnv } from "../types";

export class BaseEndpoint {
	constructor(protected env: CustomEnv) {}
}
