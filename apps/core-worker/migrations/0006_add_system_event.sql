-- Migration number: 0006 	 2024-05-07T21:11:05.673Z
-- CreateTable
CREATE TABLE "SystemEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL
);

