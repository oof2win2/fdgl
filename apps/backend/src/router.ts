import { AutoRouter } from "itty-router";
import categories from "./routes/categories";
import masterCategories from "./routes/categories-master";
import masterCommunities from "./routes/communities-master";
import reports from "./routes/reports";
import type { CF, RequestType } from "./types";
import { MasterAuthenticate } from "./utils/auth";
import communities from "./routes/communities";
import misc from "./routes/misc";

const router = AutoRouter<RequestType, CF>();

router
	.all("/categories/*", categories.fetch)
	.all("/communities/*", communities.fetch)
	.all("/reports/*", reports.fetch)
	.all("/master/categories/*", MasterAuthenticate, masterCategories.fetch)
	.all("/master/communities/*", MasterAuthenticate, masterCommunities.fetch)
	.all("/misc/*", misc.fetch);

export default router;
