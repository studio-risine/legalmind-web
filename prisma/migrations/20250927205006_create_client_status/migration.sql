-- CreateEnum
CREATE TYPE "public"."ProcessArea" AS ENUM ('CIVIL', 'LABOR', 'CRIMINAL', 'FAMILY', 'TAX', 'ADMINISTRATIVE', 'CONSTITUTIONAL', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "public"."ProcessPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ProcessStatus" AS ENUM ('ONGOING', 'SUSPENDED', 'ARCHIVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."ProfileType" AS ENUM ('ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."SpaceRole" AS ENUM ('ADMIN', 'LAWYER', 'ASSISTANT', 'CLIENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."SpaceType" AS ENUM ('INDIVIDUAL');

-- CreateEnum
CREATE TYPE "public"."UserRoleType" AS ENUM ('ADMIN', 'LAWYER', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."ClientStatus" AS ENUM ('LEAD', 'PROSPECT', 'ACTIVE', 'DORMANT', 'CHURNED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" "public"."UserRoleType",
    "supabase_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "oab_number" TEXT,
    "specialties" TEXT[],
    "type" "public"."ProfileType" NOT NULL DEFAULT 'LAWYER',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."SpaceType" NOT NULL DEFAULT 'INDIVIDUAL',
    "settings" JSONB,
    "organization_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_spaces" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "role" "public"."SpaceRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSONB,
    "settings" JSONB,
    "invitedAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "notes" TEXT,
    "metadata" JSONB,
    "space_id" TEXT NOT NULL,
    "status" "public"."ClientStatus" NOT NULL DEFAULT 'LEAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."processes" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "area" "public"."ProcessArea" NOT NULL,
    "status" "public"."ProcessStatus" NOT NULL DEFAULT 'ONGOING',
    "priority" "public"."ProcessPriority" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[],
    "metadata" JSONB,
    "client_id" TEXT,
    "assigned_lawyer_id" TEXT,
    "space_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "public"."users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_slug_key" ON "public"."spaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "profile_spaces_profile_id_space_id_key" ON "public"."profile_spaces"("profile_id", "space_id");

-- CreateIndex
CREATE UNIQUE INDEX "processes_public_id_key" ON "public"."processes"("public_id");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spaces" ADD CONSTRAINT "spaces_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_spaces" ADD CONSTRAINT "profile_spaces_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_spaces" ADD CONSTRAINT "profile_spaces_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."processes" ADD CONSTRAINT "processes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."processes" ADD CONSTRAINT "processes_assigned_lawyer_id_fkey" FOREIGN KEY ("assigned_lawyer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."processes" ADD CONSTRAINT "processes_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
