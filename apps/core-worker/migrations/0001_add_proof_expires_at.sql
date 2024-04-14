-- AlterTable
ALTER TABLE "ReportProof" ADD COLUMN "uploadExpiresAt" TEXT;

-- CreateIndex
CREATE INDEX "ReportProof_uploadExpiresAt" ON "ReportProof"("uploadExpiresAt");

