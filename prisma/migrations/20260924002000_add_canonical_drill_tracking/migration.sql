-- Preserve the canonical Master Drill Library identity through session plans and progress history.
ALTER TABLE "PracticePlanItem" ADD COLUMN "canonicalDrillName" TEXT;
ALTER TABLE "ProgressEvent" ADD COLUMN "canonicalDrillName" TEXT;

CREATE INDEX "PracticePlanItem_canonicalDrillName_idx" ON "PracticePlanItem"("canonicalDrillName");
CREATE INDEX "ProgressEvent_playerId_canonicalDrillName_occurredAt_idx" ON "ProgressEvent"("playerId", "canonicalDrillName", "occurredAt");
