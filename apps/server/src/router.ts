import { Router, error } from "itty-router";
import { type CF, type RequestType } from "./types";
import categoriesRouter from "./routes/categories";
import masterCategoriesRouter from "./routes/categories-master";
import masterCommunitiesRouter from "./routes/communities-master";
import ReportsRouter from "./routes/reports";
import { MasterAuthenticate } from "./utils/auth";
import communitiesRouter from "./routes/communities";

const router = Router<RequestType, CF>();

router
	.all("/categories/*", categoriesRouter.handle)
	.all("/communities/*", communitiesRouter.handle)
	.all("/reports/*", ReportsRouter.handle)
	.all(
		"/master/categories/*",
		MasterAuthenticate,
		masterCategoriesRouter.handle,
	)
	.all(
		"/master/communities/*",
		MasterAuthenticate,
		masterCommunitiesRouter.handle,
	)
	.all("*", () => error(404));

export default router;
