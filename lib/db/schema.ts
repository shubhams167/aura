import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(), // NextAuth user ID (Google sub)
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"), // Avatar URL
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Broker credentials table - stores ENCRYPTED API keys
export const brokerCredentials = pgTable("broker_credentials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  broker: text("broker").notNull().default("groww"), // For future multi-broker support
  encryptedApiKey: text("encrypted_api_key").notNull(), // AES-256 encrypted
  encryptedApiSecret: text("encrypted_api_secret").notNull(), // AES-256 encrypted
  iv: text("iv").notNull(), // Initialization vector for API key
  ivSecret: text("iv_secret").notNull(), // Initialization vector for API secret
  // OAuth-based brokers (Zerodha) - access token storage
  encryptedAccessToken: text("encrypted_access_token"), // For OAuth-based brokers
  accessTokenIv: text("access_token_iv"),
  accessTokenExpiry: timestamp("access_token_expiry", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Type inference for select and insert operations
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type BrokerCredential = typeof brokerCredentials.$inferSelect;
export type NewBrokerCredential = typeof brokerCredentials.$inferInsert;

// Watchlists table - allows users to create multiple named watchlists
export const watchlists = pgTable("watchlists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Watchlist items table - stocks within a specific watchlist
export const watchlistItems = pgTable("watchlist_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  watchlistId: text("watchlist_id")
    .notNull()
    .references(() => watchlists.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  sortOrder: text("sort_order").notNull(), // Uses lexicographical sorting for drag & drop
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

import { relations } from "drizzle-orm";

export const watchlistsRelations = relations(watchlists, ({ many }) => ({
  items: many(watchlistItems),
}));

export const watchlistItemsRelations = relations(watchlistItems, ({ one }) => ({
  watchlist: one(watchlists, {
    fields: [watchlistItems.watchlistId],
    references: [watchlists.id],
  }),
}));

export type Watchlist = typeof watchlists.$inferSelect;
export type NewWatchlist = typeof watchlists.$inferInsert;

export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type NewWatchlistItem = typeof watchlistItems.$inferInsert;
