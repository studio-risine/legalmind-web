CREATE TABLE "processes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
