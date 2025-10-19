import { relations, sql } from "drizzle-orm";
import {
	index,
	pgTableCreator,
	primaryKey,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * 複数プロジェクトでスキーマを共有するためのテーブル作成ヘルパー
 */
export const createTable = pgTableCreator(
	(name) => `react_storage_service_${name}`,
);

export const users = createTable("user", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: d.varchar({ length: 255 }),
}));

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const mediaAssets = createTable(
	"media_asset",
	(d) => ({
		id: d.uuid().defaultRandom().primaryKey(),
		ownerId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		title: d.varchar({ length: 200 }).notNull(),
		description: d.text(),
		mimeType: d.varchar({ length: 255 }).notNull(),
		sizeBytes: d.bigint({ mode: "number" }).notNull(),
		isPublic: d.boolean().default(false).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("media_owner_idx").on(t.ownerId)],
);

export const mediaTags = createTable(
	"media_tag",
	(d) => ({
		id: d.uuid().defaultRandom().primaryKey(),
		name: d.varchar({ length: 64 }).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [uniqueIndex("media_tag_name_idx").on(t.name)],
);

export const mediaAssetTags = createTable(
	"media_asset_tag",
	(d) => ({
		assetId: d
			.uuid()
			.notNull()
			.references(() => mediaAssets.id, { onDelete: "cascade" }),
		tagId: d
			.uuid()
			.notNull()
			.references(() => mediaTags.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	}),
	(t) => [primaryKey({ columns: [t.assetId, t.tagId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	mediaAssets: many(mediaAssets),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ many, one }) => ({
	tagLinks: many(mediaAssetTags),
	owner: one(users, {
		fields: [mediaAssets.ownerId],
		references: [users.id],
	}),
}));

export const mediaTagsRelations = relations(mediaTags, ({ many }) => ({
	assetLinks: many(mediaAssetTags),
}));

export const mediaAssetTagsRelations = relations(mediaAssetTags, ({ one }) => ({
	asset: one(mediaAssets, {
		fields: [mediaAssetTags.assetId],
		references: [mediaAssets.id],
	}),
	tag: one(mediaTags, {
		fields: [mediaAssetTags.tagId],
		references: [mediaTags.id],
	}),
}));
