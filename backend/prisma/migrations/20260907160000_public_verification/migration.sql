-- Public records are opt-in so demo or incomplete data cannot appear as production content.
ALTER TABLE "cooperatives" ADD COLUMN "publicVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "news_articles" ADD COLUMN "publicVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "publicVerified" BOOLEAN NOT NULL DEFAULT false;
