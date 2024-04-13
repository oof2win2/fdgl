import { AutoRouter } from "itty-router";
import categoriesRouter from "./routes/categories";
import masterCategoriesRouter from "./routes/categories-master";
import masterCommunitiesRouter from "./routes/communities-master";
import ReportsRouter from "./routes/reports";
import { type CF, type CustomEnv, type RequestType } from "./types";
import { MasterAuthenticate } from "./utils/auth";
import communitiesRouter from "./routes/communities";
import { Kysely } from "kysely";
import { SerializePlugin } from "kysely-plugin-serialize";
import { D1Dialect } from "kysely-d1";
import type { DB } from "./db-types";

// the cloudflare Env has DB set to a D1Database, which isn't kysely
// we override that here so that it is better to work with
const withKyselyAsDb = (req: RequestType, env: CustomEnv) => {
	env.DB = new Kysely<DB>({
		dialect: new D1Dialect({ database: (env as unknown as Env).DB }),
		plugins: [new SerializePlugin()],
	});
};

const router = AutoRouter<RequestType, CF>({
	before: [withKyselyAsDb],
});

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
	);

export default router;
