-- Migration number: 0005 	 2024-05-07T21:08:27.996Z
-- RedefineTables
CREATE TABLE "new_ReportCategory" (
    "reportId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    PRIMARY KEY ("reportId", "categoryId")
);
INSERT INTO "new_ReportCategory" ("categoryId", "reportId") SELECT "categoryId", "reportId" FROM "ReportCategory";
DROP TABLE "ReportCategory";
ALTER TABLE "new_ReportCategory" RENAME TO "ReportCategory";
CREATE INDEX "ReportCategory_reportId_idx" ON "ReportCategory"("reportId");
CREATE INDEX "ReportCategory_categoryId_idx" ON "ReportCategory"("categoryId");
CREATE TABLE "new_ReportProof" (
    "proofId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,

    PRIMARY KEY ("proofId", "reportId")
);
INSERT INTO "new_ReportProof" ("filetype", "proofId", "reportId") SELECT "filetype", "proofId", "reportId" FROM "ReportProof";
DROP TABLE "ReportProof";
ALTER TABLE "new_ReportProof" RENAME TO "ReportProof";
CREATE INDEX "ReportProof_reportId_idx" ON "ReportProof"("reportId");