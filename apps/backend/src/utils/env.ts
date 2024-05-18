import * as z from "zod";

const schema = z.object({
	MASTER_API_KEY: z.string({ description: "Master API key for the API" }),
	DATABASE_URL: z.string({ description: "URL of the SQLite database" }),
	// S3_BUCKET_URL: z.string().url(),
	// S3_ACCESS_KEY_ID: z.string(),
	// S3_SECRET_ACCESS_KEY: z.string(),
});

let env: z.infer<typeof schema>;

const parsed = schema.safeParse(Bun.env);

if (parsed.success) env = parsed.data;
else {
	const err = parsed.error;
	console.log("❌ Invalid environment variables:", err.flatten().fieldErrors);
	throw new Error("Invalid environment variables");
}

export const ENV = env;
