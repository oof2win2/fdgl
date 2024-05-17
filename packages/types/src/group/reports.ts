import { z } from "zod";

export const Report = z.object({
	id: z.string(),
	playername: z.string(),
	description: z.string(),
	createdBy: z.string(),
	communityId: z.string(),

	categoryIds: z.string().array(),
	proofLinks: z.string().array(),

	createdAt: z.coerce.date(),
	isRevoked: z.literal(false),
});
export type Report = z.infer<typeof Report>;

export const CreateReport = z.object({
	playername: z.string(),
	description: z.string(),
	createdBy: z.string(),

	categoryIds: z.string().array().min(1).max(100),
	proofRequests: z
		.array(
			z.object({
				// filesize must be between 1 byte and 4MB
				// we then transform it to a string for ease of use later
				filesize: z.number().min(1).max(4_000_000),
				filetype: z.enum(["image/jpeg", "image/png"], {
					invalid_type_error:
						"Image content type must be image/jpeg or image/png",
				}),
			}),
		)
		.max(10),
});
export type CreateReport = z.infer<typeof CreateReport>;

export const Revocation = Report.extend({
	revoked: z.literal(true),
	revokedAt: z.coerce.date(),
});
