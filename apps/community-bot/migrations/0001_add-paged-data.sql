-- Migration number: 0001 	 2024-04-26T21:55:45.222Z
-- CreateTable
CREATE TABLE "PagedData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

