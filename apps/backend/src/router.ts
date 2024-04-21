import { AutoRouter } from "itty-router";
import categoriesRouter from "./routes/categories";
import masterCategoriesRouter from "./routes/categories-master";
import masterCommunitiesRouter from "./routes/communities-master";
import ReportsRouter from "./routes/reports";
import { type CF, type CustomEnv, type RequestType } from "./types";
import { MasterAuthenticate } from "./utils/auth";
import communitiesRouter from "./routes/communities";

const router = AutoRouter<RequestType, CF>();

router
	.all("/categories/*", categoriesRouter.fetch)
	.all("/communities/*", communitiesRouter.fetch)
	.all("/reports/*", ReportsRouter.fetch)
	.all("/master/categories/*", MasterAuthenticate, masterCategoriesRouter.fetch)
	.all(
		"/master/communities/*",
		MasterAuthenticate,
		masterCommunitiesRouter.fetch,
	);

export default router;
