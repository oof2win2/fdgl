-- Migration number: 0002 	 2024-05-04T07:22:46.219Z
-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filterObjectId" TEXT
);

