import { db } from "$utils/db";
import { AutoRouter } from "itty-router";

const miscRouter = AutoRouter({ base: "/misc" });

// GET /system-updates
// get all system updates after a date
miscRouter.get("/system-updates", async (req) => {
	const dateString = new URL(req.url).searchParams.get("after");
	let dateAfter: Date | undefined = dateString
		? new Date(dateString || "")
		: undefined;
	if (Number.isNaN(dateAfter)) dateAfter = undefined;

	let query = db.selectFrom("SystemEvent").selectAll();
	if (dateAfter) query = query.where("createdAt", ">", dateAfter);

	const updates = await query.execute();
	return updates;
});

export default miscRouter;
