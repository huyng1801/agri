BEGIN;

CREATE TABLE "farmer_zone_assignments" (
    "farmerProfileId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "farmer_zone_assignments_pkey" PRIMARY KEY ("farmerProfileId", "zoneId")
);

INSERT INTO "farmer_zone_assignments" ("farmerProfileId", "zoneId")
SELECT profile."id", zone."id"
FROM "farmer_profiles" AS profile
CROSS JOIN LATERAL jsonb_array_elements_text(
    CASE
        WHEN jsonb_typeof(profile."assignedZones") = 'array' THEN profile."assignedZones"
        ELSE '[]'::jsonb
    END
) AS assigned("zoneId")
INNER JOIN "zones" AS zone
    ON zone."id" = assigned."zoneId"
   AND zone."cooperativeId" = profile."cooperativeId"
ON CONFLICT ("farmerProfileId", "zoneId") DO NOTHING;

CREATE INDEX "farmer_zone_assignments_zoneId_idx"
    ON "farmer_zone_assignments"("zoneId");

ALTER TABLE "farmer_zone_assignments"
    ADD CONSTRAINT "farmer_zone_assignments_farmerProfileId_fkey"
    FOREIGN KEY ("farmerProfileId") REFERENCES "farmer_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "farmer_zone_assignments"
    ADD CONSTRAINT "farmer_zone_assignments_zoneId_fkey"
    FOREIGN KEY ("zoneId") REFERENCES "zones"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "farmer_profiles" DROP COLUMN "assignedZones";

COMMIT;
