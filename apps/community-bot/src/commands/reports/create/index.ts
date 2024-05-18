import type { SubcommandGroupConfig } from "$utils/commands/types";
import StartReportCreation from "./start";
import AddCategory from "./addCategory";
import RemoveCategory from "./removeCategory";
import AddProof from "./addProof";
import Cancel from "./cancel";
import Preview from "./preview";
import Submit from "./submit";

export const Config: SubcommandGroupConfig = {
	name: "create",
	description: "Create a FDGL report",
	type: "SubcommandGroup",
	subcommands: [
		StartReportCreation,
		AddCategory,
		RemoveCategory,
		AddProof,
		Cancel,
		Preview,
		Submit,
	],
};

export default Config;
