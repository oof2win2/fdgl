import { BaseEndpoint } from "./base";
import { generateId } from "../utils/generateId";

type CreateCategoryParams = {
	name: string;
	description: string;
};

type UpdateCategoryParams = {
	id: string;
	name: string;
	description: string;
};

export class Categories extends BaseEndpoint {
	/**
	 * Get a single category by its ID
	 * @param id ID of the category
	 */
	async getCategory(id: string) {
		const category = await this.env.DB.selectFrom("Categories")
			.selectAll()
			.where("id", "=", id)
			.executeTakeFirst();
		return category ?? null;
	}

	/**
	 * Get all categories
	 */
	async getAllCategories() {
		const categories = await this.env.DB.selectFrom("Categories")
			.selectAll()
			.execute();
		return categories;
	}

	/**
	 * Create a category. Master API method
	 */
	async createCategory(data: CreateCategoryParams) {
		const id = generateId();

		await this.env.DB.insertInto("Categories")
			.values({
				id,
				name: data.name,
				description: data.description,
			})
			.execute();

		return id;
	}

	/**
	 * Update a category by changing its name and description. Master API method
	 */
	async updateCategory(data: UpdateCategoryParams) {
		const exists = await this.env.DB.selectFrom("Categories")
			.select("id")
			.where("id", "=", data.id)
			.executeTakeFirst();
		if (!exists) return "notFound";

		await this.env.DB.updateTable("Categories")
			.set({
				name: data.name,
				description: data.description,
			})
			.where("id", "=", data.id)
			.limit(1)
			.execute();

		return "ok";
	}

	/**
	 * Merge two categories. Master API method
	 */
	async mergeCategories(source: string, destination: string) {
		const sourceCategory = await this.env.DB.selectFrom("Categories")
			.select("id")
			.where("id", "=", source)
			.executeTakeFirst();
		if (!sourceCategory) return "sourceNotFound";

		const destCategory = await this.env.DB.selectFrom("Categories")
			.select("id")
			.where("id", "=", destination)
			.executeTakeFirst();
		if (!destCategory) return "destNotFound";

		// first we get any records of existing report categories for the source category
		const previousReports = await this.env.DB.selectFrom("ReportCategory")
			.select("reportId")
			.where("categoryId", "=", source)
			.execute();

		// now we insert them all into the database with the new category
		await this.env.DB.insertInto("ReportCategory")
			.values(
				previousReports.map((id) => ({
					categoryId: destination,
					reportId: id.reportId,
				})),
			)
			.execute();

		// and finally we delete the source category
		await this.env.DB.deleteFrom("Categories")
			.where("id", "=", source)
			.execute();
	}
}
