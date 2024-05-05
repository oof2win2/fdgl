-- Migration number: 0004 	 2024-05-04T19:25:36.636Z
-- AlterTable
ALTER TABLE "GuildConfig" ADD COLUMN "communityId" TEXT;

ALTER TABLE "ReportCreation" ADD COLUMN "description" TEXT NOT NULL;
