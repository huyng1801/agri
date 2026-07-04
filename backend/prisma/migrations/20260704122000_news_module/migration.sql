CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

CREATE TABLE "news_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "news_articles" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT,
  "authorId" TEXT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "bodyHtml" TEXT NOT NULL,
  "coverImageUrl" TEXT,
  "coverImageAlt" TEXT,
  "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "showOnHome" BOOLEAN NOT NULL DEFAULT false,
  "focusKeyword" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "canonicalUrl" TEXT,
  "robotsNoIndex" BOOLEAN NOT NULL DEFAULT false,
  "robotsNoFollow" BOOLEAN NOT NULL DEFAULT false,
  "schemaType" TEXT NOT NULL DEFAULT 'NewsArticle',
  "ogTitle" TEXT,
  "ogDescription" TEXT,
  "ogImageUrl" TEXT,
  "twitterTitle" TEXT,
  "twitterDescription" TEXT,
  "twitterImageUrl" TEXT,
  "tagsJson" JSONB NOT NULL DEFAULT '[]',
  "seoScore" INTEGER NOT NULL DEFAULT 0,
  "readabilityScore" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "scheduledAt" TIMESTAMP(3),
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");
CREATE INDEX "news_articles_categoryId_idx" ON "news_articles"("categoryId");
CREATE INDEX "news_articles_status_idx" ON "news_articles"("status");
CREATE INDEX "news_articles_publishedAt_idx" ON "news_articles"("publishedAt");

ALTER TABLE "news_articles"
ADD CONSTRAINT "news_articles_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "news_categories"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "news_articles"
ADD CONSTRAINT "news_articles_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
