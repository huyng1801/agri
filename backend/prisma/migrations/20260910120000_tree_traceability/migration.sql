ALTER TYPE "RoleSlug" ADD VALUE IF NOT EXISTS 'ENTERPRISE';
ALTER TYPE "RoleSlug" ADD VALUE IF NOT EXISTS 'AUTHORITY';

CREATE TYPE "TreeStatus" AS ENUM ('ACTIVE', 'NEEDS_ATTENTION', 'ALERT', 'HARVESTED', 'INACTIVE');
CREATE TYPE "TreeEventType" AS ENUM ('PLANTING', 'WATERING', 'FERTILIZING', 'SPRAYING', 'PRUNING', 'WEEDING', 'FLOWERING', 'FRUITING', 'PEST_CONTROL', 'INSPECTION', 'HARVESTING', 'OTHER');
CREATE TYPE "TreeEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "SeasonStatus" AS ENUM ('PLANNING', 'ACTIVE', 'CLOSED');
CREATE TYPE "HarvestStatus" AS ENUM ('RECORDED', 'ALLOCATED', 'ARCHIVED');
CREATE TYPE "LotStatus" AS ENUM ('DRAFT', 'OPEN', 'PACKED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProductBatchStatus" AS ENUM ('DRAFT', 'PACKAGED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "TraceabilityCodeType" AS ENUM ('TREE', 'PRODUCT_BATCH');
CREATE TYPE "TraceabilityCodeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'EXPIRED');

CREATE TABLE "crop_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "crop_types_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_seasons" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "SeasonStatus" NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "production_seasons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trees" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "cropTypeId" TEXT NOT NULL,
    "treeCode" TEXT NOT NULL,
    "variety" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "plantedDate" TIMESTAMP(3),
    "status" "TreeStatus" NOT NULL DEFAULT 'ACTIVE',
    "publicVerified" BOOLEAN NOT NULL DEFAULT false,
    "imagesJson" JSONB NOT NULL DEFAULT '[]',
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tree_events" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "seasonId" TEXT,
    "actorId" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventType" "TreeEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "imagesJson" JSONB NOT NULL DEFAULT '[]',
    "status" "TreeEventStatus" NOT NULL DEFAULT 'PUBLISHED',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tree_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tree_inputs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "materialType" TEXT,
    "materialName" TEXT NOT NULL,
    "quantity" DECIMAL(65,30),
    "unit" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tree_inputs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "harvests" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "seasonId" TEXT,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "status" "HarvestStatus" NOT NULL DEFAULT 'RECORDED',
    "note" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "harvests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lots" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "zoneId" TEXT,
    "cropTypeId" TEXT,
    "lotCode" TEXT NOT NULL,
    "harvestDate" TIMESTAMP(3),
    "totalQuantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "packagingDate" TIMESTAMP(3),
    "status" "LotStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lot_trees" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lot_trees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_batches" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "harvestDate" TIMESTAMP(3),
    "packagingDate" TIMESTAMP(3),
    "status" "ProductBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "publicVerified" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "traceability_codes" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "codeType" "TraceabilityCodeType" NOT NULL,
    "treeId" TEXT,
    "productBatchId" TEXT,
    "qrDataUrl" TEXT,
    "status" "TraceabilityCodeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "traceability_codes_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "trees" ADD CONSTRAINT "trees_coordinates_range_check" CHECK (
    ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90)
    AND ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180)
);
ALTER TABLE "tree_inputs" ADD CONSTRAINT "tree_inputs_quantity_nonnegative_check" CHECK ("quantity" IS NULL OR "quantity" >= 0);
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_quantity_positive_check" CHECK ("quantity" > 0);
ALTER TABLE "lots" ADD CONSTRAINT "lots_total_quantity_nonnegative_check" CHECK ("totalQuantity" >= 0);
ALTER TABLE "lot_trees" ADD CONSTRAINT "lot_trees_quantity_positive_check" CHECK ("quantity" > 0);
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_quantity_positive_check" CHECK ("quantity" > 0);
ALTER TABLE "traceability_codes" ADD CONSTRAINT "traceability_codes_single_target_check" CHECK (num_nonnulls("treeId", "productBatchId") = 1);

CREATE UNIQUE INDEX "crop_types_code_key" ON "crop_types"("code");
CREATE UNIQUE INDEX "production_seasons_cooperativeId_code_key" ON "production_seasons"("cooperativeId", "code");
CREATE UNIQUE INDEX "trees_treeCode_key" ON "trees"("treeCode");
CREATE UNIQUE INDEX "lots_cooperativeId_lotCode_key" ON "lots"("cooperativeId", "lotCode");
CREATE UNIQUE INDEX "lot_trees_lotId_harvestId_key" ON "lot_trees"("lotId", "harvestId");
CREATE UNIQUE INDEX "product_batches_cooperativeId_productCode_key" ON "product_batches"("cooperativeId", "productCode");
CREATE UNIQUE INDEX "traceability_codes_code_key" ON "traceability_codes"("code");
CREATE UNIQUE INDEX "traceability_codes_publicSlug_key" ON "traceability_codes"("publicSlug");
CREATE UNIQUE INDEX "traceability_codes_treeId_key" ON "traceability_codes"("treeId");
CREATE UNIQUE INDEX "traceability_codes_productBatchId_key" ON "traceability_codes"("productBatchId");

CREATE INDEX "crop_types_isActive_sortOrder_idx" ON "crop_types"("isActive", "sortOrder");
CREATE INDEX "production_seasons_cooperativeId_status_idx" ON "production_seasons"("cooperativeId", "status");
CREATE INDEX "trees_cooperativeId_idx" ON "trees"("cooperativeId");
CREATE INDEX "trees_zoneId_idx" ON "trees"("zoneId");
CREATE INDEX "trees_cropTypeId_idx" ON "trees"("cropTypeId");
CREATE INDEX "trees_cooperativeId_status_idx" ON "trees"("cooperativeId", "status");
CREATE INDEX "tree_events_cooperativeId_idx" ON "tree_events"("cooperativeId");
CREATE INDEX "tree_events_treeId_eventDate_idx" ON "tree_events"("treeId", "eventDate");
CREATE INDEX "tree_events_seasonId_idx" ON "tree_events"("seasonId");
CREATE INDEX "tree_events_eventType_idx" ON "tree_events"("eventType");
CREATE INDEX "harvests_cooperativeId_idx" ON "harvests"("cooperativeId");
CREATE INDEX "harvests_treeId_harvestDate_idx" ON "harvests"("treeId", "harvestDate");
CREATE INDEX "harvests_seasonId_idx" ON "harvests"("seasonId");
CREATE INDEX "lot_trees_treeId_idx" ON "lot_trees"("treeId");
CREATE INDEX "lot_trees_harvestId_idx" ON "lot_trees"("harvestId");
CREATE INDEX "lots_cooperativeId_status_idx" ON "lots"("cooperativeId", "status");
CREATE INDEX "lots_zoneId_idx" ON "lots"("zoneId");
CREATE INDEX "lots_cropTypeId_idx" ON "lots"("cropTypeId");
CREATE INDEX "product_batches_cooperativeId_status_idx" ON "product_batches"("cooperativeId", "status");
CREATE INDEX "product_batches_lotId_idx" ON "product_batches"("lotId");
CREATE INDEX "product_batches_productId_idx" ON "product_batches"("productId");
CREATE INDEX "traceability_codes_cooperativeId_codeType_idx" ON "traceability_codes"("cooperativeId", "codeType");
CREATE INDEX "traceability_codes_status_idx" ON "traceability_codes"("status");

ALTER TABLE "production_seasons" ADD CONSTRAINT "production_seasons_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trees" ADD CONSTRAINT "trees_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trees" ADD CONSTRAINT "trees_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trees" ADD CONSTRAINT "trees_cropTypeId_fkey" FOREIGN KEY ("cropTypeId") REFERENCES "crop_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trees" ADD CONSTRAINT "trees_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tree_events" ADD CONSTRAINT "tree_events_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tree_events" ADD CONSTRAINT "tree_events_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tree_events" ADD CONSTRAINT "tree_events_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "production_seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tree_events" ADD CONSTRAINT "tree_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tree_inputs" ADD CONSTRAINT "tree_inputs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "tree_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "production_seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lots" ADD CONSTRAINT "lots_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lots" ADD CONSTRAINT "lots_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lots" ADD CONSTRAINT "lots_cropTypeId_fkey" FOREIGN KEY ("cropTypeId") REFERENCES "crop_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lot_trees" ADD CONSTRAINT "lot_trees_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lot_trees" ADD CONSTRAINT "lot_trees_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "trees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lot_trees" ADD CONSTRAINT "lot_trees_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "harvests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "traceability_codes" ADD CONSTRAINT "traceability_codes_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "traceability_codes" ADD CONSTRAINT "traceability_codes_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "traceability_codes" ADD CONSTRAINT "traceability_codes_productBatchId_fkey" FOREIGN KEY ("productBatchId") REFERENCES "product_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
