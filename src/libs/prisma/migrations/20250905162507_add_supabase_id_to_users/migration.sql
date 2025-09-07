/*
  Warnings:

  - A unique constraint covering the columns `[supabase_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "supabase_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "public"."users"("supabase_id");
