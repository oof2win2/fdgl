import List from "./list";
import Search from "./search";
import { createRegister, createHandler } from "@/utils/commands";

const Config = {
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
