-- Migration number: 0004 	 2024-05-04T07:02:27.904Z
-- CreateTable
CREATE TABLE "FilterObject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filteredCategories" BLOB NOT NULL,
    "filteredCommunities" BLOB NOT NULL
);

