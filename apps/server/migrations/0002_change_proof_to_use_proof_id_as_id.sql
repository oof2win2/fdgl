-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReportProof" (
    "proofId" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "uploadExpiresAt" TEXT,
    CONSTRAINT "ReportProof_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReportProof" ("proofId", "reportId", "uploadExpiresAt") SELECT "proofId", "reportId", "uploadExpiresAt" FROM "ReportProof";
DROP TABLE "ReportProof";
ALTER TABLE "new_ReportProof" RENAME TO "ReportProof";
CREATE INDEX "ReportProof_reportId" ON "ReportProof"("reportId");
CREATE INDEX "ReportProof_uploadExpiresAt" ON "ReportProof"("uploadExpiresAt");
CREATE UNIQUE INDEX "ReportProof_reportId_proofId_key" ON "ReportProof"("reportId", "proofId");
PRAGMA foreign_keys=ON;

