import { Router, error } from "itty-router";
import categoriesRouter from "./routes/categories";
import masterCategoriesRouter from "./routes/categories-master";
import masterCommunitiesRouter from "./routes/communities-master";
import ReportsRouter from "./routes/reports";
import { type CF, type RequestType } from "./types";
import { MasterAuthenticate } from "./utils/auth";

const router = Router<RequestType, CF>();

router
	.get("/", () => "Hello from /")
	.all("/categories/*", categoriesRouter.handle)
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
