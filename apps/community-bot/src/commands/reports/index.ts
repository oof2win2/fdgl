import { createHandler, createRegister } from "@/utils/commands";
import CreateReport from "./create";
import ListReports from "./list";

const Config = {
	name: "reports",
	description: "Interact with FDGL reports",
};

export const Register = createRegister({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [CreateReport, ListReports],
});

const Handler = createHandler({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [CreateReport, ListReports],
});

export default Handler;
