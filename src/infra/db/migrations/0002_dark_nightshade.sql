-- Step 1: Drop all foreign key constraints that reference accounts.id
ALTER TABLE "clients" DROP CONSTRAINT "clients_account_id_accounts_id_fk";--> statement-breakpoint
ALTER TABLE "deadlines" DROP CONSTRAINT "deadlines_account_id_accounts_id_fk";--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_account_id_accounts_id_fk";--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" DROP CONSTRAINT "spaces_to_accounts_account_id_accounts_id_fk";--> statement-breakpoint
ALTER TABLE "processes" DROP CONSTRAINT "processes_responsible_id_accounts_id_fk";--> statement-breakpoint
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_created_by_accounts_id_fk";--> statement-breakpoint

-- Step 2: Convert accounts.id to uuid first
ALTER TABLE "accounts" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;--> statement-breakpoint

-- Step 3: Convert all foreign key columns to uuid
ALTER TABLE "clients" ALTER COLUMN "account_id" SET DATA TYPE uuid USING account_id::uuid;--> statement-breakpoint
ALTER TABLE "deadlines" ALTER COLUMN "account_id" SET DATA TYPE uuid USING account_id::uuid;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "account_id" SET DATA TYPE uuid USING account_id::uuid;--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ALTER COLUMN "account_id" SET DATA TYPE uuid USING account_id::uuid;--> statement-breakpoint
ALTER TABLE "processes" ALTER COLUMN "responsible_id" SET DATA TYPE uuid USING responsible_id::uuid;--> statement-breakpoint
ALTER TABLE "spaces" ALTER COLUMN "created_by" SET DATA TYPE uuid USING created_by::uuid;--> statement-breakpoint

-- Step 4: Recreate foreign key constraints
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_responsible_id_accounts_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Step 5: Apply other schema changes
ALTER TABLE "accounts" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "profile_picture_url" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "oab_number" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "oab_state" varchar(2);--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "name";
