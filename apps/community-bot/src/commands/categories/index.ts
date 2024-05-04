import { type CommandConfig } from "@/utils/commands/baseCommand";
import List from "./list";
import Search from "./search";
import { createRegister } from "@/utils/commands/register";
import { createHandler } from "@/utils/commands/handler";

const Config: CommandConfig = {
	name: "categories",
	description: "Interact with FDGL categories",
};

export const Register = createRegister({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [List, Search],
});

const Handler = createHandler({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [List, Search],
});

export default Handler;
