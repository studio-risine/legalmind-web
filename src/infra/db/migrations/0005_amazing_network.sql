ALTER TABLE "clients" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "document" varchar(18);