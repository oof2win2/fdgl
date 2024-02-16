import { error, Router } from "itty-router";
import categoriesRouter from "./routes/categories";
import { type RequestType, type CF } from "./types";
import { MasterAuthenticate } from "./utils/auth";
import masterCategoriesRouter from "./routes/categories-master";

const router = Router<RequestType, CF>();

router
	.get("/", () => "Hello from /")
	.all("/categories/*", categoriesRouter.handle)
	.all(
		"/master/categories/*",
		MasterAuthenticate,
		masterCategoriesRouter.handle
	)
	.all("*", () => error(404));

export default router;
