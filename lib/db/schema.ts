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

// Wallet system for gamified trading
export const wallets = pgTable("wallets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  currency: text("currency").notNull().default("USD"),
  // Using numeric/decimal to avoid floating point issues, storing as string in JS, or we can use double for simplicity of prototyping.
  // We'll use double precision for floating point mapping to JS number
  balance: text("balance").notNull().default("100000"), // Stored as text to maintain precision, parsed to float in TS
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  walletId: text("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // 'BUY' | 'SELL'
  quantity: text("quantity").notNull(),
  price: text("price").notNull(), // execution price
  currency: text("currency").notNull().default("USD"),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const walletHoldings = pgTable("wallet_holdings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  walletId: text("wallet_id")
    .notNull()
    .references(() => wallets.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  quantity: text("quantity").notNull(),
  averageCost: text("average_cost").notNull(),
  currency: text("currency").notNull().default("USD"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [wallets.userId],
    references: [userProfiles.id],
  }),
  transactions: many(walletTransactions),
  holdings: many(walletHoldings),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
}));

export const walletHoldingsRelations = relations(walletHoldings, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletHoldings.walletId],
    references: [wallets.id],
  }),
}));

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;

export type WalletHolding = typeof walletHoldings.$inferSelect;
export type NewWalletHolding = typeof walletHoldings.$inferInsert;
