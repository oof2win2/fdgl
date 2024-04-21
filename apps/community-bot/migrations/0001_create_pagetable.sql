-- CreateTable
CREATE TABLE "PagedData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
	"currentPage" INTEGER NOT NULL,
    "expiresAt" TEXT NOT NULL
);
