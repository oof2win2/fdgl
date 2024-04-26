-- Migration number: 0002 	 2024-04-26T21:25:53.254Z
-- CreateIndex
CREATE INDEX "Report_updatedAt_idx" ON "Report"("updatedAt");

-- CreateIndex
CREATE INDEX "Report_playername_idx" ON "Report"("playername");

-- CreateIndex
CREATE INDEX "Report_communityId_idx" ON "Report"("communityId");

-- CreateIndex
CREATE INDEX "ReportCategory_reportId_idx" ON "ReportCategory"("reportId");

-- CreateIndex
CREATE INDEX "ReportCategory_categoryId_idx" ON "ReportCategory"("categoryId");

-- CreateIndex
CREATE INDEX "ReportProof_reportId_idx" ON "ReportProof"("reportId");

