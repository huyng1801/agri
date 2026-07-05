ALTER TABLE "passport_certifications" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "passport_certifications_zoneId_idx" ON "passport_certifications"("zoneId");
CREATE INDEX "passport_certifications_fileId_idx" ON "passport_certifications"("fileId");
CREATE INDEX "passport_certifications_isPublic_idx" ON "passport_certifications"("isPublic");

ALTER TABLE "passport_certifications"
ADD CONSTRAINT "passport_certifications_cooperativeId_fkey"
FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "passport_certifications"
ADD CONSTRAINT "passport_certifications_fileId_fkey"
FOREIGN KEY ("fileId") REFERENCES "files"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
