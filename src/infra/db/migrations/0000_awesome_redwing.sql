CREATE TYPE "public"."client_status" AS ENUM('LEAD', 'PROSPECT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."client_type" AS ENUM('INDIVIDUAL', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."deadline_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."deadline_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."deadline_type" AS ENUM('HEARING', 'APPEAL', 'RESPONSE', 'PETITION', 'DOCUMENT', 'PAYMENT', 'MEETING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('EMAIL', 'SYSTEM', 'PUSH', 'SMS', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."process_area" AS ENUM('CIVIL', 'CRIMINAL', 'TRABALHISTA', 'TRIBUTARIO', 'ADMINISTRATIVO', 'COMERCIAL', 'FAMILIA', 'SUCESSOES', 'CONSUMIDOR', 'AMBIENTAL');--> statement-breakpoint
CREATE TYPE "public"."process_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."process_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."profile_type" AS ENUM('ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT', 'PARALEGAL');--> statement-breakpoint
CREATE TYPE "public"."space_role" AS ENUM('OWNER', 'ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT', 'VIEWER');--> statement-breakpoint
CREATE TYPE "public"."space_type" AS ENUM('INDIVIDUAL', 'TEAM', 'FIRM', 'DEPARTMENT');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"name" text,
	"email" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"type" "client_type" DEFAULT 'INDIVIDUAL' NOT NULL,
	"status" "client_status" DEFAULT 'ACTIVE' NOT NULL,
	"name" text NOT NULL,
	"email" varchar(256),
	"phone" varchar(256),
	"tax_id" varchar(32),
	"notes" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "deadlines" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"process_id" text,
	"client_id" text,
	"title" varchar(160) NOT NULL,
	"description" text,
	"due_at" timestamp NOT NULL,
	"type" "deadline_type" DEFAULT 'OTHER' NOT NULL,
	"status" "deadline_status" DEFAULT 'PENDING' NOT NULL,
	"priority" "deadline_priority" DEFAULT 'MEDIUM' NOT NULL,
	"google_event_id" varchar(128),
	"completed_at" timestamp,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"user_id" text,
	"deadline_id" text,
	"channel" "notification_channel" NOT NULL,
	"payload" jsonb,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"status" "notification_status" DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processes" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"client_id" text,
	"cnj" varchar(32),
	"court" varchar(120),
	"title" varchar(160),
	"status" "process_status" DEFAULT 'ACTIVE' NOT NULL,
	"tags" jsonb,
	"archived_at" timestamp,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"email" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "spaces_to_accounts" (
	"space_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	CONSTRAINT "spaces_to_accounts_space_id_account_id_pk" PRIMARY KEY("space_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_process_id_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_deadline_id_deadlines_id_fk" FOREIGN KEY ("deadline_id") REFERENCES "public"."deadlines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;