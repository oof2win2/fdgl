import {
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import {
	CommandWithSubcommandsHandler,
	type CommandConfig,
} from "@/utils/commands/baseCommand";
import { ViewCategoryFiltersExecutionData } from "./viewCategories";
import { AddCategoryFiltersExecutionData } from "./addCategory";
import { RemoveCategoryFiltersExecutionData } from "./removeCategory";
import { ViewCommunityFiltersExecutionData } from "./viewCommunities";
import { AddCommunityFiltersExecutionData } from "./addCommunity";
import { RemoveCommunityFiltersExecutionData } from "./removeCommunity";

const Config: CommandConfig = {
	name: "filters",
	description: "Interact with your FDGL filters",
};

export const ExecutionData = CommandWithSubcommandsHandler(
	[
		ViewCategoryFiltersExecutionData,
		AddCategoryFiltersExecutionData,
		RemoveCategoryFiltersExecutionData,
		ViewCommunityFiltersExecutionData,
	],
	Config,
);

export const Register: RESTPostAPIApplicationGuildCommandsJSONBody = {
	type: ApplicationCommandType.ChatInput,
	name: Config.name,
	description: Config.description,
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: "categories",
			description: "Interact with filtered categories",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: ViewCategoryFiltersExecutionData.config.name,
					description: ViewCategoryFiltersExecutionData.config.description,
					options: ViewCategoryFiltersExecutionData.config.options,
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: AddCategoryFiltersExecutionData.config.name,
					description: AddCategoryFiltersExecutionData.config.description,
					options: AddCategoryFiltersExecutionData.config.options,
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: RemoveCategoryFiltersExecutionData.config.name,
					description: RemoveCategoryFiltersExecutionData.config.description,
					options: RemoveCategoryFiltersExecutionData.config.options,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: "communities",
			description: "Interact with filtered communities",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: ViewCommunityFiltersExecutionData.config.name,
					description: ViewCommunityFiltersExecutionData.config.description,
					options: ViewCommunityFiltersExecutionData.config.options,
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: AddCommunityFiltersExecutionData.config.name,
					description: AddCommunityFiltersExecutionData.config.description,
					options: AddCommunityFiltersExecutionData.config.options,
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: RemoveCommunityFiltersExecutionData.config.name,
					description: RemoveCommunityFiltersExecutionData.config.description,
					options: RemoveCommunityFiltersExecutionData.config.options,
				},
			],
		},
	],
};

export default Config;
