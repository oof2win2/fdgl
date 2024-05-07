import type { ChatInputCommandHandler } from "@/utils/commands";
import type { CommandConfig } from "@/utils/commands/types";
import {
	deferMessage,
	followupInteractionText,
	respond,
	respondWithText,
} from "@/utils/discord/respond";
import { InteractionResponseType } from "discord-api-types/v10";

const handler: ChatInputCommandHandler = async (interaction, env) => {
	const guildId = interaction.guild_id;
	if (!guildId)
		return respondWithText(interaction, "This command must be ran in a guild");

	const member = interaction.member;
	if (!member) throw new Error("invalid");

	const reportCreationId = `${guildId}.${member.user.id}`;

	const reportToCreate = await env.DB.selectFrom("ReportCreation")
		.selectAll()
		.where("id", "=", reportCreationId)
		.executeTakeFirst();

	if (!reportToCreate) {
		return respondWithText(
			interaction,
			"You are currently not creating a report",
		);
	}

	if (!reportToCreate.categories || !reportToCreate.categories.length) {
		return respondWithText(interaction, "No categories were provided");
	}

	const guildConfig = await env.DB.selectFrom("GuildConfig")
		.select("communityId")
		.where("id", "=", guildId)
		.executeTakeFirst();

	if (!guildConfig || !guildConfig.communityId) {
		return respondWithText(
			interaction,
			"This guild is not assigned to a FDGL community",
		);
	}

	const report = await env.FDGL.reports.createReport(
		{
			playername: reportToCreate.playername,
			description: reportToCreate.description,
			categoryIds: reportToCreate.categories,
			proofRequestCount: reportToCreate.proofLinks?.length ?? 0,
			createdBy: member.user.id,
		},
		guildConfig.communityId,
	);

	if (report === "invalidCategories") {
		return respondWithText(
			interaction,
			"Invalid FDGL categories are present in this report",
		);
	}

	// TODO: send a message that a report was created here but with the thinking

	await respondWithText(
		interaction,
		`The report has been created under ID \`${report.id}\``,
		true,
	);

	for (const id of report.proofIds) {
		const proof = reportToCreate.proofLinks?.pop();
		if (!proof) throw new Error("Report proof count was incorrect");

		const fileurl = new URL(proof);

		const ending = fileurl.pathname.split("/").at(-1)?.split(".").at(-1);
		if (!ending) throw new Error("File was uploaded without an ending");

		const file = await fetch(proof);
		// the proof pathname is the id of the report, the id of the proof, and the filetype
		await env.R2.put(`${report.id}.${id}.${ending}`, file.body);
	}

	await env.DB.deleteFrom("ReportCreation")
		.where("id", "=", reportCreationId)
		.execute();

	// return with all proof uploaded here

	await followupInteractionText(
		interaction,
		env,
		"All proof for the report has been uploaded",
	);

	// TODO: not sure what to respond with here.
	return {
		type: InteractionResponseType.Pong,
	};
};

const Config: CommandConfig = {
	name: "submit",
	type: "Command",
	description: "Submit the report to FDGL",
	ChatInputHandler: handler,
};

export default Config;
