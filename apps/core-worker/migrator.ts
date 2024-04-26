import { readdirSync, appendFileSync } from "node:fs";
import { $ } from "bun";

const dbBinding = "fdgl-maindb"; // change this, make it reflect the binding you have in your wrangler.toml

const sqlSchema =
	await $`bun prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script`.text();

if (sqlSchema.trim() === "-- This is an empty migration.") {
	console.log("No changes have been made in the Prisma schema");
	process.exit(0);
}

async function getStdin(prompt: string): Promise<string> {
	process.stdout.write(`${prompt}: `);
	for await (const line of console) {
		return line.trim();
	}
	throw new Error("No input was provided");
}

const migrationName = await getStdin("Please enter the name of the migration");
if (migrationName === "") {
	console.log("A migration name must be provided");
	process.exit(0);
}

await $`bun wrangler d1 migrations create ${dbBinding} ${migrationName}`;

// migrations are numbered in order of creation (1, 2, 3 in order)
// so we want to sort and get the last one
const latestMigration = readdirSync("./migrations").sort().at(-1);
console.log(latestMigration);
console.log(`Migration file ${latestMigration} created`);

appendFileSync(`./migrations/${latestMigration}`, sqlSchema);

console.log("Migration written to the file");

const shouldApply = await getStdin("Should the migration be applied? Y/n ");
if (shouldApply === "" || shouldApply.toLowerCase() === "y") {
	await $`bun wrangler d1 migrations apply fdgl-maindb`;
} else {
	console.log("Migration not applied.");
	console.log("Apply the migration yourself by running bun db:migrate");
}
