-- AlterTable
ALTER TABLE "orders" ADD COLUMN "orderGroupCode" TEXT;

-- CreateIndex
CREATE INDEX "orders_orderGroupCode_idx" ON "orders"("orderGroupCode");
