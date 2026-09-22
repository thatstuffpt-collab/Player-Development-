CREATE TABLE "AthleticTest" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "testKey" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "lowerIsBetter" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AthleticTest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AthleticTest_playerId_testedAt_idx" ON "AthleticTest"("playerId", "testedAt");
CREATE INDEX "AthleticTest_playerId_testKey_idx" ON "AthleticTest"("playerId", "testKey");
ALTER TABLE "AthleticTest" ADD CONSTRAINT "AthleticTest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
