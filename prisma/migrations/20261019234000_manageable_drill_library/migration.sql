-- CreateTable
CREATE TABLE "Drill" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "primaryCategory" TEXT NOT NULL,
    "subcategory" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "measurable" BOOLEAN NOT NULL DEFAULT false,
    "measurementType" TEXT NOT NULL DEFAULT 'none',
    "variations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Drill_tenantId_normalizedName_key" ON "Drill"("tenantId", "normalizedName");
CREATE INDEX "Drill_tenantId_isActive_sortOrder_idx" ON "Drill"("tenantId", "isActive", "sortOrder");
CREATE INDEX "Drill_tenantId_primaryCategory_idx" ON "Drill"("tenantId", "primaryCategory");

ALTER TABLE "Drill" ADD CONSTRAINT "Drill_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
