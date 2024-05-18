import { createHandler, createRegister } from "$utils/commands";
import Categories from "./categories";
import Communities from "./communities";

const Config = {
	name: "filters",
	description: "Interact with your FDGL filters",
};

export const Register = createRegister({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [Categories, Communities],
});

const Handler = createHandler({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [Categories, Communities],
});

export default Handler;
