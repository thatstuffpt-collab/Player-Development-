-- Create the tenant table first.
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- Preserve all existing production data inside the original That's Tuff tenant.
INSERT INTO "Tenant" ("id", "name", "slug", "updatedAt")
VALUES ('tenant_thats_tuff', 'That''s Tuff Performance Training', 'thats-tuff', CURRENT_TIMESTAMP);

ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Player" ADD COLUMN "tenantId" TEXT;

UPDATE "User" SET "tenantId" = 'tenant_thats_tuff' WHERE "tenantId" IS NULL;
UPDATE "Player" SET "tenantId" = 'tenant_thats_tuff' WHERE "tenantId" IS NULL;

ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Player" ALTER COLUMN "tenantId" SET NOT NULL;

CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");
CREATE INDEX "Player_tenantId_archivedAt_idx" ON "Player"("tenantId", "archivedAt");

ALTER TABLE "User"
ADD CONSTRAINT "User_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Player"
ADD CONSTRAINT "Player_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
