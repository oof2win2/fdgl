import { type CommandConfig } from "../../baseCommand";
import { createHandler } from "../../utils/commands/handler";
import { createRegister } from "../../utils/commands/register";
import CreateReport from "./create";
import ListReports from "./list";

const Config: CommandConfig = {
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
