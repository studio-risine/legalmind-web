CREATE SCHEMA "core";
--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('LEAD', 'PROSPECT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."client_type" AS ENUM('INDIVIDUAL', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."process_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."space_type" AS ENUM('INDIVIDUAL', 'FIRM', 'DEPARTMENT');--> statement-breakpoint
CREATE TABLE "core"."accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"full_name" text NOT NULL,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text,
	"profile_picture_url" text,
	"oab_number" text NOT NULL,
	"oab_state" char(2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "accounts_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "core"."clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone_number" text,
	"type" "client_type" NOT NULL,
	"document_number" text NOT NULL,
	"status" "client_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."processes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"space_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"process_number" text NOT NULL,
	"status" "process_status" DEFAULT 'ACTIVE' NOT NULL,
	"assigned_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "space_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."spaces_to_accounts" (
	"space_id" text NOT NULL,
	"account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spaces_to_accounts_space_id_account_id_pk" PRIMARY KEY("space_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "core"."clients" ADD CONSTRAINT "clients_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "core"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."notes" ADD CONSTRAINT "notes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "core"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."notes" ADD CONSTRAINT "notes_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD CONSTRAINT "processes_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD CONSTRAINT "processes_assigned_id_accounts_id_fk" FOREIGN KEY ("assigned_id") REFERENCES "core"."accounts"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD CONSTRAINT "processes_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."spaces" ADD CONSTRAINT "spaces_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "core"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "core"."view_accounts" AS (select "user_id", "email", "phone_number", "full_name", "display_name", "profile_picture_url", "oab_number", "oab_state", "created_at" as "account_created_at", "updated_at" from "core"."accounts");--> statement-breakpoint
CREATE VIEW "core"."view_accounts_public" AS (select "user_id", "display_name", "profile_picture_url" from "core"."accounts");