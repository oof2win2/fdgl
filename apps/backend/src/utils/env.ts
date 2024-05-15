import * as z from "zod";

const schema = z.object({
	MASTER_API_KEY: z.string({ description: "Master API key for the API" }),
	DATABASE_URL: z.string({ description: "URL of the SQLite database" }),
	S3_BUCKET_URL: z.string().url(),
	S3_ACCESS_KEY_ID: z.string(),
	S3_SECRET_ACCESS_KEY: z.string(),
});

export const ENV = schema.parse(Bun.env);
