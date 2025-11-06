CREATE TYPE "public"."deadline_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."deadline_status" AS ENUM('OPEN', 'DONE', 'CANCELED');--> statement-breakpoint
CREATE TABLE "core"."deadlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"process_id" uuid NOT NULL,
	"due_date" date NOT NULL,
	"status" "deadline_status" DEFAULT 'OPEN' NOT NULL,
	"priority" "deadline_priority" DEFAULT 'MEDIUM' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."clients" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD CONSTRAINT "deadlines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "core"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD CONSTRAINT "deadlines_process_id_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "core"."processes"("id") ON DELETE cascade ON UPDATE no action;