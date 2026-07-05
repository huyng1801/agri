-- AlterTable
ALTER TABLE "zones" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "zones_cooperativeId_isPublic_idx" ON "zones"("cooperativeId", "isPublic");
