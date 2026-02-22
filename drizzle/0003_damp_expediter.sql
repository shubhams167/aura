ALTER TABLE "broker_credentials" DROP CONSTRAINT "broker_credentials_user_id_unique";--> statement-breakpoint
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_user_id_unique";--> statement-breakpoint
ALTER TABLE "broker_credentials" DROP CONSTRAINT "broker_credentials_user_id_user_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "broker_credentials" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "broker_credentials" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "broker_credentials" ADD COLUMN "encrypted_access_token" text;--> statement-breakpoint
ALTER TABLE "broker_credentials" ADD COLUMN "access_token_iv" text;--> statement-breakpoint
ALTER TABLE "broker_credentials" ADD COLUMN "access_token_expiry" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "broker_credentials" ADD CONSTRAINT "broker_credentials_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" DROP COLUMN "user_id";