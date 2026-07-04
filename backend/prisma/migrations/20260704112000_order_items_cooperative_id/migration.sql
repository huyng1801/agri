ALTER TABLE "order_items" ADD COLUMN "cooperativeId" TEXT;

UPDATE "order_items" AS oi
SET "cooperativeId" = p."cooperativeId"
FROM "products" AS p
WHERE oi."productId" = p."id"
  AND oi."cooperativeId" IS NULL;

CREATE INDEX "order_items_cooperativeId_idx" ON "order_items"("cooperativeId");

ALTER TABLE "order_items"
ADD CONSTRAINT "order_items_cooperativeId_fkey"
FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
