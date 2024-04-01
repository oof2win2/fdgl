import router from "./router";
import { error, json } from "itty-router";

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return router
			.handle(request, env, ctx)
			.then(json)
			.catch((err) => {
				console.error(err);
				return error(500, "An error occured");
			});
	},
};
