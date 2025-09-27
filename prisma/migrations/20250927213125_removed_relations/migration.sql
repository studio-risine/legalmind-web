/*
  Warnings:

  - The values [CLIENT] on the enum `UserRoleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `space_id` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `space_id` on the `processes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profile_id]` on the table `profile_spaces` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRoleType_new" AS ENUM ('ADMIN', 'LAWYER');
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRoleType_new" USING ("role"::text::"public"."UserRoleType_new");
ALTER TYPE "public"."UserRoleType" RENAME TO "UserRoleType_old";
ALTER TYPE "public"."UserRoleType_new" RENAME TO "UserRoleType";
DROP TYPE "public"."UserRoleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."processes" DROP CONSTRAINT "processes_space_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_spaces" DROP CONSTRAINT "profile_spaces_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_spaces" DROP CONSTRAINT "profile_spaces_space_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."spaces" DROP CONSTRAINT "spaces_organization_id_fkey";

-- DropIndex
DROP INDEX "public"."profile_spaces_profile_id_space_id_key";

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "space_id";

-- AlterTable
ALTER TABLE "public"."processes" DROP COLUMN "space_id";

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DEFAULT 'LAWYER';

-- CreateIndex
CREATE UNIQUE INDEX "profile_spaces_profile_id_key" ON "public"."profile_spaces"("profile_id");
