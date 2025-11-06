-- Add spaceId to clients table
ALTER TABLE "core"."clients" DROP CONSTRAINT IF EXISTS "clients_account_id_accounts_id_fk";
ALTER TABLE "core"."clients" ADD COLUMN IF NOT EXISTS "space_id" text NOT NULL DEFAULT '';
ALTER TABLE "core"."clients" ADD CONSTRAINT "clients_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "core"."clients" DROP COLUMN IF EXISTS "account_id";

-- Add clientId to processes table
ALTER TABLE "core"."processes" ADD COLUMN IF NOT EXISTS "client_id" uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "core"."processes" ADD CONSTRAINT "processes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "core"."clients"("id") ON DELETE cascade ON UPDATE no action;

-- Add spaceId to deadlines table
ALTER TABLE "core"."deadlines" DROP CONSTRAINT IF EXISTS "deadlines_account_id_accounts_id_fk";
ALTER TABLE "core"."deadlines" ADD COLUMN IF NOT EXISTS "space_id" text NOT NULL DEFAULT '';
ALTER TABLE "core"."deadlines" ADD CONSTRAINT "deadlines_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "core"."spaces"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "core"."deadlines" DROP COLUMN IF EXISTS "account_id";
