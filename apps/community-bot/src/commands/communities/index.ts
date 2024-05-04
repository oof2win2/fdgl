import { type CommandConfig } from "../../baseCommand";
import List from "./list";
import Search from "./search";
import { createRegister } from "../../utils/commands/register";
import { createHandler } from "../../utils/commands/handler";

const Config: CommandConfig = {
	name: "communities",
	description: "Interact with FDGL communities",
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
