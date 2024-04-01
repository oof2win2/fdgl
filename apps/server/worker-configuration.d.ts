// worker-configuration.d.ts
interface Env {
	DB: D1Database;
	R2: R2Bucket;
	MASTER_API_KEY: string;
	JWT_SECRET: string;
	R2_SIGNING_SECRET: string
}
