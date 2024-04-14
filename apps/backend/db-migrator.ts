// prisma/migrator.ts

import { $ } from "bun";
import { readdir } from "node:fs/promises";
import { statSync } from "node:fs";

const sqlSchema =
	await $`bun prisma migrate diff --from-schema-datamodel ./prisma/previous-schema.prisma --to-schema-datamodel ./prisma/schema.prisma --script`.text();

if (sqlSchema.trim().length === 0) {
	console.log("No changes have been made in the Prisma schema");
	process.exit(0);
}

const message = prompt("Please enter the message for the migration:");
await $`bun wrangler d1 migrations create fdgl-maindb ${message}`;

await Bun.write(
	"prisma/previous-schema.prisma",
	Bun.file("prisma/schema.prisma"),
);

const latestFile = (await readdir("migrations"))
	.sort((a, b) => {
		const aCreatedAt = statSync(`migrations/${a}`).ctimeMs;
		const bCreatedAt = statSync(`migrations/${b}`).ctimeMs;
		return aCreatedAt - bCreatedAt;
	})
	.pop();
console.log(latestFile);

await Bun.write(`migrations/${latestFile}`, sqlSchema);

await $`bun wrangler d1 migrations apply fdgl-maindb --local`;
await $`bun prisma generate`;
