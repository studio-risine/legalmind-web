CREATE TYPE "public"."alert_mode" AS ENUM('NORMAL', 'REDUCED');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('ACTIVE', 'TRIGGERED');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'COMPLETE', 'UPLOAD', 'ARCHIVE');--> statement-breakpoint
CREATE TYPE "public"."audit_entity" AS ENUM('PROCESS', 'DEADLINE', 'DOCUMENT', 'EVENT');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('PETITION', 'CONTRACT', 'EVIDENCE', 'DECISION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."event_origin" AS ENUM('EXTERNAL', 'INTERNAL');--> statement-breakpoint
CREATE TABLE "core"."alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deadline_id" uuid NOT NULL,
	"space_id" text NOT NULL,
	"anticipation_days" integer NOT NULL,
	"mode" "alert_mode" DEFAULT 'NORMAL' NOT NULL,
	"status" "alert_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"entity_id" uuid NOT NULL,
	"space_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"entity" "audit_entity" NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"mime_type" text NOT NULL,
	"phase_ref" text,
	"storage_path" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"space_id" text NOT NULL,
	"process_id" uuid NOT NULL,
	"category" "document_category" NOT NULL,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core"."process_events" (
	"description" text NOT NULL,
	"event_at" timestamp with time zone NOT NULL,
	"external_ref" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin" "event_origin" NOT NULL,
	"process_id" uuid NOT NULL,
	"space_id" text NOT NULL,
	"viewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD COLUMN "anticipation_days" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD COLUMN "responsible_id" uuid;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD COLUMN "court" text;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD COLUMN "court_class" text;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD COLUMN "parties_summary" text;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD COLUMN "phase" text;--> statement-breakpoint
ALTER TABLE "core"."alerts" ADD CONSTRAINT "alerts_deadline_id_deadlines_id_fk" FOREIGN KEY ("deadline_id") REFERENCES "core"."deadlines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."alerts" ADD CONSTRAINT "alerts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."audit_logs" ADD CONSTRAINT "audit_logs_actor_id_accounts_id_fk" FOREIGN KEY ("actor_id") REFERENCES "core"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."audit_logs" ADD CONSTRAINT "audit_logs_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."documents" ADD CONSTRAINT "documents_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "core"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."documents" ADD CONSTRAINT "documents_process_id_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "core"."processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."documents" ADD CONSTRAINT "documents_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."process_events" ADD CONSTRAINT "process_events_process_id_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "core"."processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."process_events" ADD CONSTRAINT "process_events_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD CONSTRAINT "deadlines_responsible_id_accounts_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "core"."accounts"("id") ON DELETE set null ON UPDATE no action;
