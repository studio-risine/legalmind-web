ALTER TABLE "core"."processes" DROP CONSTRAINT "processes_client_id_clients_id_fk";
--> statement-breakpoint
ALTER TABLE "core"."processes" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD CONSTRAINT "processes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "core"."clients"("id") ON DELETE set default ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core"."processes" ADD CONSTRAINT "processes_process_number_unique" UNIQUE("process_number");