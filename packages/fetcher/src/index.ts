import ky from "ky";
import Categories from "./endpoints/categories";
import Communities from "./endpoints/communities";
import Filters from "./endpoints/filters";
import Misc from "./endpoints/misc";
import { AuthManager } from "./auth";
import Reports from "./endpoints/reports";

export default class FDGL {
	categories: Categories;
	communities: Communities;
	filters: Filters;
	misc: Misc;
	reports: Reports;

	private auth: AuthManager;

	constructor(apiurl: string) {
		const fetcher = ky.create({
			prefixUrl: apiurl,
		});

		this.auth = new AuthManager();

		this.categories = new Categories(fetcher);
		this.communities = new Communities(fetcher);
		this.filters = new Filters(fetcher, this.auth);
		this.misc = new Misc(fetcher);
		this.reports = new Reports(fetcher, this.auth);
	}

	setApikey(key: string) {
		this.auth.setKey(key);
	}
}
