UPDATE "products"
SET "farmerId" = NULL
WHERE "farmerId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "users" WHERE "users"."id" = "products"."farmerId");

UPDATE "products"
SET "thumbnailFileId" = NULL
WHERE "thumbnailFileId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "files" WHERE "files"."id" = "products"."thumbnailFileId");

CREATE INDEX "products_farmerId_idx" ON "products"("farmerId");
CREATE INDEX "products_thumbnailFileId_idx" ON "products"("thumbnailFileId");

ALTER TABLE "products"
ADD CONSTRAINT "products_farmerId_fkey"
FOREIGN KEY ("farmerId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "products"
ADD CONSTRAINT "products_thumbnailFileId_fkey"
FOREIGN KEY ("thumbnailFileId") REFERENCES "files"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
