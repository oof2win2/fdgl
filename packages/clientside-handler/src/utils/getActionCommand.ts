import type { Report, Revocation } from "@fdgl/types";
import type { Action } from "../types";

export function getExecuteCommand(action: Action, report: Report) {
	return action.runCommand
		.replaceAll("{PLAYERNAME}", report.playername)
		.replaceAll("{REPORTID}", report.id)
		.replaceAll("{COMMUNITYID}", report.communityId)
		.replaceAll("{CREATEDAT}", report.createdAt);
}
export function getUndoCommand(action: Action, revocation: Revocation) {
	return action.undoCommand
		.replaceAll("{PLAYERNAME}", revocation.playername)
		.replaceAll("{REPORTID}", revocation.id)
		.replaceAll("{COMMUNITYID}", revocation.communityId)
		.replaceAll("{CREATEDAT}", revocation.createdAt);
}
