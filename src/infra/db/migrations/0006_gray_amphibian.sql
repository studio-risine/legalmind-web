CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"user_id" text,
	"deadline_id" uuid,
	"channel" varchar(16) NOT NULL,
	"payload" jsonb,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"status" varchar(16) DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" RENAME COLUMN "document" TO "tax_id";--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "tax_id" TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "type" varchar(16) DEFAULT 'INDIVIDUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "status" varchar(16) DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "account_id" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "account_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "process_id" uuid;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "title" varchar(160) NOT NULL;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "due_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "type" varchar(24) DEFAULT 'OTHER' NOT NULL;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "status" varchar(24) DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "priority" varchar(16) DEFAULT 'MEDIUM' NOT NULL;--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "google_event_id" varchar(128);--> statement-breakpoint
ALTER TABLE "deadlines" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "account_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "cnj" varchar(32);--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "court" varchar(120);--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "title" varchar(160);--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "status" varchar(32) DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "tags" jsonb;--> statement-breakpoint
ALTER TABLE "processes" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_deadline_id_deadlines_id_fk" FOREIGN KEY ("deadline_id") REFERENCES "public"."deadlines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_process_id_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."processes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processes" ADD CONSTRAINT "processes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deadlines" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "processes" DROP COLUMN "name";