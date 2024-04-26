-- Migration number: 0003 	 2024-04-26T21:35:03.386Z
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Report";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playername" TEXT NOT NULL,
    "description" TEXT,
    "communityId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Reports_updatedAt_idx" ON "Reports"("updatedAt");

-- CreateIndex
CREATE INDEX "Reports_playername_idx" ON "Reports"("playername");

-- CreateIndex
CREATE INDEX "Reports_communityId_idx" ON "Reports"("communityId");

