ALTER TABLE "core"."accounts" ALTER COLUMN "full_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "core"."accounts" ALTER COLUMN "oab_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "core"."accounts" ALTER COLUMN "oab_state" DROP NOT NULL;