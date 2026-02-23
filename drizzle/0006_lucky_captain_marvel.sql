ALTER TABLE "wallet_holdings" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;