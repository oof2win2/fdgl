import type { Report, Revocation } from "@fdgl/types";
import type { Action } from "../types";

export function getExecuteCommand(action: Action, report: Report) {
	return action.runCommand
		.replaceAll("{REPORTID}", report.id)
		.replaceAll("{PLAYERNAME}", report.playername)
		.replaceAll(
			"{DESCRIPTION}",
			report.description ?? "No description provided",
		)
		.replaceAll("{CREATEDBY}", report.createdBy)
		.replaceAll("{COMMUNITYID}", report.communityId)
		.replaceAll("{CATEGORYIDS}", report.categoryIds.join(","))
		.replaceAll("{PROOFLINKS}", report.proofLinks.join(","))
		.replaceAll("{CREATEDAT}", report.createdAt);
}
export function getUndoCommand(action: Action, revocation: Revocation) {
	return action.undoCommand
		.replaceAll("{REPORTID}", revocation.id)
		.replaceAll("{PLAYERNAME}", revocation.playername)
		.replaceAll(
			"{DESCRIPTION}",
			revocation.description ?? "No description provided",
		)
		.replaceAll("{CREATEDBY}", revocation.createdBy)
		.replaceAll("{COMMUNITYID}", revocation.communityId)
		.replaceAll("{CATEGORYIDS}", revocation.categoryIds.join(","))
		.replaceAll("{PROOFLINKS}", revocation.proofLinks.join(","))
		.replaceAll("{CREATEDAT}", revocation.createdAt)
		.replaceAll("{REVOKEDAT}", revocation.revokedAt);
}
