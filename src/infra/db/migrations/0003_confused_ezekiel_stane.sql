CREATE TABLE "spaces_to_accounts" (
	"space_id" uuid NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "spaces_to_accounts_space_id_account_id_pk" PRIMARY KEY("space_id","account_id")
);
--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spaces_to_accounts" ADD CONSTRAINT "spaces_to_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;