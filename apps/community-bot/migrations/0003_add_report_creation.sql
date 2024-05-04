-- Migration number: 0003 	 2024-05-04T13:13:09.376Z
-- CreateTable
CREATE TABLE "ReportCreation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playername" TEXT NOT NULL,
    "categories" BLOB,
    "proofLinks" BLOB,
    "expiresAt" DATETIME NOT NULL
);

