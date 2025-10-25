DROP VIEW "core"."view_accounts";--> statement-breakpoint
DROP VIEW "core"."view_accounts_public";--> statement-breakpoint
DROP TABLE "auth"."users" CASCADE;--> statement-breakpoint
DROP TABLE "core"."accounts" CASCADE;--> statement-breakpoint
DROP TABLE "core"."clients" CASCADE;--> statement-breakpoint
DROP TABLE "core"."notes" CASCADE;--> statement-breakpoint
DROP TABLE "core"."processes" CASCADE;--> statement-breakpoint
DROP TABLE "core"."spaces" CASCADE;--> statement-breakpoint
DROP TABLE "core"."spaces_to_accounts" CASCADE;--> statement-breakpoint
DROP TYPE "public"."client_status";--> statement-breakpoint
DROP TYPE "public"."client_type";--> statement-breakpoint
DROP TYPE "public"."process_status";--> statement-breakpoint
DROP TYPE "public"."space_type";--> statement-breakpoint
DROP SCHEMA "auth";
--> statement-breakpoint
DROP SCHEMA "core";
