CREATE TYPE "PracticePlanItemType" AS ENUM ('SECTION', 'DRILL');

ALTER TYPE "ProgressEventType" ADD VALUE IF NOT EXISTS 'BODY_READINESS';

ALTER TABLE "TrainingSession"
  ADD COLUMN "sorenessLevel" TEXT,
  ADD COLUMN "bodyArea" TEXT,
  ADD COLUMN "discomfortLevel" INTEGER,
  ADD COLUMN "planAdjustmentReason" TEXT,
  ADD COLUMN "needsMoreWork" TEXT;

ALTER TABLE "PracticePlanItem"
  ADD COLUMN "parentItemId" TEXT,
  ADD COLUMN "itemType" "PracticePlanItemType" NOT NULL DEFAULT 'DRILL',
  ADD COLUMN "focusArea" "SessionFocusArea";

DROP INDEX IF EXISTS "PracticePlanItem_sessionId_sortOrder_key";
CREATE INDEX "PracticePlanItem_sessionId_sortOrder_idx" ON "PracticePlanItem"("sessionId", "sortOrder");
CREATE INDEX "PracticePlanItem_parentItemId_idx" ON "PracticePlanItem"("parentItemId");

ALTER TABLE "PracticePlanItem"
  ADD CONSTRAINT "PracticePlanItem_parentItemId_fkey"
  FOREIGN KEY ("parentItemId") REFERENCES "PracticePlanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProgressEvent"
  ADD COLUMN "practicePlanItemId" TEXT,
  ADD COLUMN "spot" TEXT;

CREATE INDEX "ProgressEvent_practicePlanItemId_idx" ON "ProgressEvent"("practicePlanItemId");

ALTER TABLE "ProgressEvent"
  ADD CONSTRAINT "ProgressEvent_practicePlanItemId_fkey"
  FOREIGN KEY ("practicePlanItemId") REFERENCES "PracticePlanItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
