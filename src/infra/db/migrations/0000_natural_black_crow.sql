CREATE TYPE "public"."client_status" AS ENUM('LEAD', 'PROSPECT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."client_type" AS ENUM('INDIVIDUAL', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."deadline_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."deadline_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."deadline_type" AS ENUM('HEARING', 'APPEAL', 'RESPONSE', 'PETITION', 'DOCUMENT', 'PAYMENT', 'MEETING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('EMAIL', 'SYSTEM', 'PUSH', 'SMS', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."process_access_level" AS ENUM('public', 'private', 'participants');--> statement-breakpoint
CREATE TYPE "public"."process_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."process_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."profile_type" AS ENUM('ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT', 'PARALEGAL');--> statement-breakpoint
CREATE TYPE "public"."space_role" AS ENUM('OWNER', 'ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."space_type" AS ENUM('INDIVIDUAL', 'TEAM', 'FIRM', 'DEPARTMENT');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"full_name" text,
	"email" varchar(255),
	"phone_number" varchar(20),
	"profile_picture_url" text,
	"oab_number" varchar(20),
	"oab_state" varchar(2),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(256),
	"phone" varchar(256),
	"account_id" uuid NOT NULL,
	"type" "client_type" DEFAULT 'INDIVIDUAL' NOT NULL,
	"document_number" varchar(32),
	"status" "client_status" DEFAULT 'ACTIVE' NOT NULL,
	"notes" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deadlines" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text,
	"account_id" uuid NOT NULL,
	"process_id" uuid,
	"client_id" uuid,
	"type" "deadline_type" DEFAULT 'OTHER' NOT NULL,
	"status" "deadline_status" DEFAULT 'PENDING' NOT NULL,
	"priority" "deadline_priority" DEFAULT 'MEDIUM' NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "processes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"process_number" varchar(50),
	"space_id" uuid NOT NULL,
	"status" "process_status" DEFAULT 'ACTIVE' NOT NULL,
	"client_id" uuid,
	"assigned_id" uuid NOT NULL,
	"tags" jsonb,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"type" "space_type" DEFAULT 'INDIVIDUAL' NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spaces_to_accounts" (
	"space_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	CONSTRAINT "spaces_to_accounts_space_id_account_id_pk" PRIMARY KEY("space_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_process_id_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_assigned_id_accounts_id_fk" FOREIGN KEY ("assigned_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;