ALTER TABLE "TrainingSession"
ADD COLUMN "startedAt" TIMESTAMP(3);

-- Existing sessions were created under the old behavior where creating a
-- session meant starting it immediately. Preserve that meaning.
UPDATE "TrainingSession"
SET "startedAt" = "createdAt"
WHERE "startedAt" IS NULL;

CREATE INDEX "TrainingSession_playerId_completedAt_startedAt_idx"
ON "TrainingSession"("playerId", "completedAt", "startedAt");
