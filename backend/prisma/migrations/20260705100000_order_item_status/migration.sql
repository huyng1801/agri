ALTER TABLE "order_items" ADD COLUMN "status" "OrderStatus" NOT NULL DEFAULT 'NEW';
ALTER TABLE "order_items" ADD COLUMN "note" TEXT;

UPDATE "order_items" AS oi
SET "status" = o."status"
FROM "orders" AS o
WHERE oi."orderId" = o."id";

CREATE INDEX "order_items_status_idx" ON "order_items"("status");
