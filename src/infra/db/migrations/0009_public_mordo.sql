ALTER TYPE "public"."deadline_priority" ADD VALUE 'URGENT' BEFORE 'LOW';--> statement-breakpoint
ALTER TYPE "public"."deadline_status" ADD VALUE 'OVERDUE';--> statement-breakpoint
ALTER TABLE "core"."deadlines" ALTER COLUMN "priority" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "core"."deadlines" ALTER COLUMN "priority" DROP NOT NULL;