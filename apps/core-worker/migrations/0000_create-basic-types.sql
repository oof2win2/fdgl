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
CREATE TABLE "Reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playername" TEXT NOT NULL,
    "description" TEXT,
    "communityId" TEXT NOT NULL,
	"createdBy" TEXT NOT NULL,
    "revokedAt" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    CONSTRAINT "Reports_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Communities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "ReportCategory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportProof" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportId" TEXT NOT NULL,
    "proofId" TEXT NOT NULL,
    CONSTRAINT "ReportProof_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Authorization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Reports_communityId" ON "Reports"("communityId");

-- CreateIndex
CREATE INDEX "Reports_updatedAt" ON "Reports"("updatedAt");

-- CreateIndex
CREATE INDEX "ReportCategory_reportId" ON "ReportCategory"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCategory_reportId_categoryId_key" ON "ReportCategory"("reportId", "categoryId");

-- CreateIndex
CREATE INDEX "ReportProof_reportId" ON "ReportProof"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportProof_reportId_proofId_key" ON "ReportProof"("reportId", "proofId");

-- CreateIndex
CREATE INDEX "Authorization_communityId" ON "Authorization"("communityId");
