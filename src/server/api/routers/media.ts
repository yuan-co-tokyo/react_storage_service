import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { mediaAssetTags, mediaAssets, mediaTags } from "~/server/db/schema";
import {
	DEFAULT_USER_STORAGE_QUOTA_BYTES,
	calculateQuotaStatus,
	calculateStorageUsage,
} from "~/server/media/storage";

const mediaMetadataInput = z.object({
	title: z.string().min(1, "タイトルは必須です").max(200),
	description: z.string().max(2000).optional(),
	mimeType: z.string().min(1, "MIMEタイプは必須です").max(255),
	sizeBytes: z.number().int().positive("サイズは1バイト以上で入力してください"),
	isPublic: z.boolean().optional(),
	tags: z.array(z.string().min(1).max(64)).max(10).optional(),
});

export const mediaRouter = createTRPCRouter({
	list: protectedProcedure
		.input(
			z
				.object({ limit: z.number().int().min(1).max(50).default(12) })
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 12;
			const assets = await ctx.db.query.mediaAssets.findMany({
				where: (asset, { eq }) => eq(asset.ownerId, ctx.session.user.id),
				orderBy: (asset, { desc }) => [desc(asset.createdAt)],
				limit,
				with: {
					tagLinks: {
						columns: {},
						with: { tag: true },
					},
				},
			});

			return assets.map((asset) => ({
				id: asset.id,
				title: asset.title,
				description: asset.description,
				mimeType: asset.mimeType,
				sizeBytes: asset.sizeBytes,
				isPublic: asset.isPublic,
				createdAt: asset.createdAt,
				tags: asset.tagLinks.map((link) => link.tag.name),
			}));
		}),

	create: protectedProcedure
		.input(mediaMetadataInput)
		.mutation(async ({ ctx, input }) => {
			const normalizedTags = Array.from(
				new Set(
					(input.tags ?? [])
						.map((tag) => tag.trim().toLowerCase())
						.filter(Boolean),
				),
			);

			const createdAsset = await ctx.db.transaction(async (tx) => {
				const [asset] = await tx
					.insert(mediaAssets)
					.values({
						ownerId: ctx.session.user.id,
						title: input.title,
						description: input.description,
						mimeType: input.mimeType,
						sizeBytes: input.sizeBytes,
						isPublic: input.isPublic ?? false,
					})
					.returning({
						id: mediaAssets.id,
						title: mediaAssets.title,
						description: mediaAssets.description,
						mimeType: mediaAssets.mimeType,
						sizeBytes: mediaAssets.sizeBytes,
						isPublic: mediaAssets.isPublic,
						createdAt: mediaAssets.createdAt,
					});

				if (!asset) {
					throw new Error("メディアの作成に失敗しました");
				}

				if (normalizedTags.length > 0) {
					await tx
						.insert(mediaTags)
						.values(normalizedTags.map((tag) => ({ name: tag })))
						.onConflictDoNothing({ target: mediaTags.name });

					const resolvedTags = await tx.query.mediaTags.findMany({
						where: (tag, { inArray }) => inArray(tag.name, normalizedTags),
					});

					if (resolvedTags.length > 0) {
						await tx
							.insert(mediaAssetTags)
							.values(
								resolvedTags.map((tag) => ({
									assetId: asset.id,
									tagId: tag.id,
								})),
							)
							.onConflictDoNothing();
					}
				}

				return asset;
			});

			return {
				...createdAsset,
				tags: normalizedTags,
			};
		}),

	getStorageSummary: protectedProcedure.query(async ({ ctx }) => {
		const assetSizes = await ctx.db
			.select({ sizeBytes: mediaAssets.sizeBytes })
			.from(mediaAssets)
			.where(eq(mediaAssets.ownerId, ctx.session.user.id));

		const usage = calculateStorageUsage(
			assetSizes.map((record) => ({ sizeBytes: Number(record.sizeBytes) })),
		);

		const quota = calculateQuotaStatus({
			usedBytes: usage.totalBytes,
			quotaBytes: DEFAULT_USER_STORAGE_QUOTA_BYTES,
		});

		return {
			...quota,
			totalItems: usage.totalItems,
		};
	}),
});
