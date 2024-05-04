import type { SubcommandGroupConfig } from "../../../utils/commands/types";
import StartReportCreation from "./start";

export const Config: SubcommandGroupConfig = {
	name: "createreport",
	description: "Create a FDGL report",
	type: "SubcommandGroup",
	subcommands: [StartReportCreation],
};

export default Config;
