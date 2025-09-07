/*
  Warnings:

  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `supabase_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "supabase_id" SET NOT NULL;
