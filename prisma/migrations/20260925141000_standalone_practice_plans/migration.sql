CREATE TABLE "StandalonePracticePlan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "planDate" TIMESTAMP(3) NOT NULL,
  "groupName" TEXT,
  "duration" TEXT,
  "location" TEXT,
  "focus" TEXT,
  "notes" TEXT,
  "sections" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StandalonePracticePlan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StandalonePracticePlan_planDate_idx" ON "StandalonePracticePlan"("planDate");
