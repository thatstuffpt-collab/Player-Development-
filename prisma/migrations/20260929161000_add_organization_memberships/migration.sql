CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'TRAINER');

CREATE TABLE "OrganizationMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationMembership_tenantId_userId_key"
ON "OrganizationMembership"("tenantId", "userId");

CREATE INDEX "OrganizationMembership_userId_role_idx"
ON "OrganizationMembership"("userId", "role");

ALTER TABLE "OrganizationMembership"
ADD CONSTRAINT "OrganizationMembership_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationMembership"
ADD CONSTRAINT "OrganizationMembership_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing trainer/admin accounts become members of their current organization.
-- At this stage the existing training organization is owner-operated, so current
-- trainers are promoted to OWNER. Future invited staff will receive explicit roles.
INSERT INTO "OrganizationMembership" ("id", "tenantId", "userId", "role", "updatedAt")
SELECT
  'orgmem_' || md5("id" || ':' || "tenantId"),
  "tenantId",
  "id",
  CASE
    WHEN "role" = 'ADMIN' THEN 'ADMIN'::"OrganizationRole"
    ELSE 'OWNER'::"OrganizationRole"
  END,
  CURRENT_TIMESTAMP
FROM "User"
WHERE "role" IN ('TRAINER', 'ADMIN')
ON CONFLICT ("tenantId", "userId") DO NOTHING;
