-- CreateEnum
CREATE TYPE "GroupPracticePlanType" AS ENUM ('GROUP', 'CAMP');

-- CreateTable
CREATE TABLE "GroupPracticePlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "planType" "GroupPracticePlanType" NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupPracticePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPracticePlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "parentItemId" TEXT,
    "itemType" "PracticePlanItemType" NOT NULL DEFAULT 'DRILL',
    "focusArea" "SessionFocusArea",
    "sortOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "GroupPracticePlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupPracticePlan_tenantId_planType_scheduledFor_idx" ON "GroupPracticePlan"("tenantId", "planType", "scheduledFor");

-- CreateIndex
CREATE INDEX "GroupPracticePlan_tenantId_updatedAt_idx" ON "GroupPracticePlan"("tenantId", "updatedAt");

-- CreateIndex
CREATE INDEX "GroupPracticePlanItem_planId_sortOrder_idx" ON "GroupPracticePlanItem"("planId", "sortOrder");

-- CreateIndex
CREATE INDEX "GroupPracticePlanItem_parentItemId_idx" ON "GroupPracticePlanItem"("parentItemId");

-- AddForeignKey
ALTER TABLE "GroupPracticePlan" ADD CONSTRAINT "GroupPracticePlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPracticePlanItem" ADD CONSTRAINT "GroupPracticePlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "GroupPracticePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPracticePlanItem" ADD CONSTRAINT "GroupPracticePlanItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "GroupPracticePlanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
