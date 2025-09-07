-- CreateEnum
CREATE TYPE "public"."UserRoleType" AS ENUM ('ADMIN', 'LAWYER', 'CLIENT');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "public"."UserRoleType" DEFAULT 'ADMIN';
