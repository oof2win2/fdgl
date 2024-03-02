// worker-configuration.d.ts
interface Env {
	DB: D1Database;
	R2: R2Bucket;
	MASTER_API_KEY: string;
	JWT_SECRET: string;
	R2_accessKeyId: string;
	R2_secretAccessKey: string;
	R2_bucket_name: string;
	CF_account_id: string;
}
