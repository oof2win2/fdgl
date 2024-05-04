import type { SubcommandGroupConfig } from "@/utils/commands/types";
import Add from "./add";
import Remove from "./remove";
import View from "./view";

export const Config: SubcommandGroupConfig = {
	name: "communities",
	description: "Manage FDGL community filters",
	type: "SubcommandGroup",
	subcommands: [Add, Remove, View],
};

export default Config;
