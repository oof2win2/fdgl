import { AutoRouter } from "itty-router";
import type { CF, RequestType } from "../types";

const miscRouter = AutoRouter<RequestType, CF>({ base: "/misc" });

// GET /system-updates
// get all system updates after a date
miscRouter.get("/system-updates", async (req, env) => {
	const dateString = new URL(req.url).searchParams.get("after");
	let dateAfter: Date | undefined = new Date(dateString || "");
	if (Number.isNaN(dateAfter)) dateAfter = undefined;
	const updates = await env.FDGL.misc.getSystemEvents(dateAfter);

	return updates;
});

export default miscRouter;
