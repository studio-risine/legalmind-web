ALTER TABLE "core"."deadlines" RENAME COLUMN "responsible_id" TO "assigned_id";--> statement-breakpoint
ALTER TABLE "core"."deadlines" DROP CONSTRAINT "deadlines_responsible_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "core"."deadlines" ADD CONSTRAINT "deadlines_assigned_id_accounts_id_fk" FOREIGN KEY ("assigned_id") REFERENCES "core"."accounts"("id") ON DELETE set null ON UPDATE no action;