import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./schema.ts",
	driver: "d1",
	dbCredentials: {
		wranglerConfigPath: "./wrangler.toml",
		dbName: "fdgl-maindb",
	},
	verbose: true,
	strict: true,
	out: "./migrations",
});
