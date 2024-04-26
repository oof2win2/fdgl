-- Migration number: 0001 	 2024-04-26T21:11:22.952Z
-- CreateTable
CREATE TABLE "Authorization" (
    "apikey" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Communities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playername" TEXT NOT NULL,
    "description" TEXT,
    "communityId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReportCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ReportProof" (
    "proofId" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "filetype" TEXT NOT NULL
);

