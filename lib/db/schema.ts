import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
