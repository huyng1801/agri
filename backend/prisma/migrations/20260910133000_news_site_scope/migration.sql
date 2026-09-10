CREATE TYPE "NewsSite" AS ENUM ('AGRIPASSPORT', 'PASSPORT', 'HTXONLINE');

ALTER TABLE "news_articles"
ADD COLUMN "siteKey" "NewsSite" NOT NULL DEFAULT 'AGRIPASSPORT';

CREATE INDEX "news_articles_siteKey_idx" ON "news_articles"("siteKey");
