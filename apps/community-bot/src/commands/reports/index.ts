import { createHandler, createRegister } from "@/utils/commands";
import CreateReport from "./create";
import ListReports from "./list";
import Detailed from "./detailed";

const Config = {
	name: "reports",
	description: "Interact with FDGL reports",
};

export const Register = createRegister({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [CreateReport, ListReports, Detailed],
});

const Handler = createHandler({
	name: Config.name,
	description: Config.description,
	type: "CommandWithSubcommands",
	subcommands: [CreateReport, ListReports, Detailed],
});

export default Handler;
