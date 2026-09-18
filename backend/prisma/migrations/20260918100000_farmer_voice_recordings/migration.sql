BEGIN;

CREATE TABLE "farmer_voice_recordings" (
    "id" TEXT NOT NULL,
    "farmerProfileId" TEXT NOT NULL,
    "fileAssetId" TEXT NOT NULL,
    "recordedById" TEXT,
    "title" VARCHAR(120),
    "durationSeconds" INTEGER NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "farmer_voice_recordings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "farmer_voice_recordings_durationSeconds_check" CHECK ("durationSeconds" BETWEEN 1 AND 600)
);

CREATE UNIQUE INDEX "farmer_voice_recordings_fileAssetId_key"
    ON "farmer_voice_recordings"("fileAssetId");
CREATE INDEX "farmer_voice_recordings_farmerProfileId_createdAt_idx"
    ON "farmer_voice_recordings"("farmerProfileId", "createdAt");
CREATE INDEX "farmer_voice_recordings_recordedById_idx"
    ON "farmer_voice_recordings"("recordedById");

ALTER TABLE "farmer_voice_recordings"
    ADD CONSTRAINT "farmer_voice_recordings_farmerProfileId_fkey"
    FOREIGN KEY ("farmerProfileId") REFERENCES "farmer_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farmer_voice_recordings"
    ADD CONSTRAINT "farmer_voice_recordings_fileAssetId_fkey"
    FOREIGN KEY ("fileAssetId") REFERENCES "files"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "farmer_voice_recordings"
    ADD CONSTRAINT "farmer_voice_recordings_recordedById_fkey"
    FOREIGN KEY ("recordedById") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
