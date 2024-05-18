import {
	ApplicationCommandOptionType,
	InteractionResponseType,
} from "discord-api-types/v10";
import type {
	AutocompleteHandler,
	ChatInputCommandHandler,
	CommandConfig,
} from "$utils/commands";
import { getFilterObject } from "@/utils/getFilterObject";
import {
	getAttachmentOption,
	getFocusedInteractionOption,
	getStringOption,
} from "@/utils/discord/getCommandOption";
import { stringSimilarity } from "string-similarity-js";

const PROOF_OPTION_NAME = "proof" as const;

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const guildId = interaction.guild_id;
	if (!guildId)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This command must be ran in a guild",
			},
		};

	const attachmentId = getAttachmentOption(
		interaction.data.options,
		PROOF_OPTION_NAME,
		true,
	);

	if (!interaction.data.resolved?.attachments)
		throw new Error("Attachments were not found");

	const attachment = interaction.data.resolved.attachments[attachmentId];

	const member = interaction.member;
	if (!member) throw new Error("invalid");

	const reportCreationId = `${guildId}.${member.user.id}`;

	const previousReport = await env.DB.selectFrom("ReportCreation")
		.select("proofLinks")
		.where("id", "=", reportCreationId)
		.executeTakeFirst();

	if (!previousReport) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "You are currently not creating a report",
			},
		};
	}

	const newProof = previousReport.proofLinks ?? [];
	newProof.push(attachment.proxy_url);

	await env.DB.updateTable("ReportCreation")
		.set({
			proofLinks: JSON.stringify(newProof),
		})
		.where("id", "=", reportCreationId)
		.execute();

	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: "The attachment has been added as proof to the report",
		},
	};
};

const autocomplete: AutocompleteHandler = async (interaction, env) => {
	const categories = await env.FDGL.categories.getAllCategories();
	const focused = getFocusedInteractionOption(
		interaction.data.options,
		ApplicationCommandOptionType.String,
	);
	const sortedBySimilarity = categories
		.map((c) => ({
			name: c.name,
			value: c.id,
			sim: focused ? stringSimilarity(c.name, focused.value) : 0,
		}))
		.sort((a, b) => b.sim - a.sim);
	return {
		type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		data: {
			choices: sortedBySimilarity.slice(0, 10), // max of 25 autocomplete options
		},
	};
};

const Config: CommandConfig = {
	name: "addproof",
	description: "Add proof to the report being created",
	type: "Command",
	options: [
		{
			type: ApplicationCommandOptionType.Attachment,
			name: PROOF_OPTION_NAME,
			description: "The proof to add",
			required: true,
		},
	],
	ChatInputHandler: handler,
	AutocompleteHandler: autocomplete,
};

export default Config;
