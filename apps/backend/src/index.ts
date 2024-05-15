import { AutoRouter } from "itty-router";
import categories from "./routes/categories";
import masterCategories from "./routes/categories-master";
import masterCommunities from "./routes/communities-master";
import reports from "./routes/reports";
import { MasterAuthenticate } from "./utils/auth";
import communities from "./routes/communities";
import misc from "./routes/misc";

const router = AutoRouter();

router.all("/categories/*", categories.fetch);
router.all("/communities/*", communities.fetch);
router.all("/reports/*", reports.fetch);
router.all("/master/categories/*", MasterAuthenticate, masterCategories.fetch);
router.all(
	"/master/communities/*",
	MasterAuthenticate,
	masterCommunities.fetch,
);
router.all("/misc/*", misc.fetch);

export default router;
