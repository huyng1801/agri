-- CreateEnum
CREATE TYPE "ContactInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'DONE', 'SPAM');

-- CreateTable
CREATE TABLE "contact_inquiries" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "sourcePath" TEXT DEFAULT '/lien-he',
    "status" "ContactInquiryStatus" NOT NULL DEFAULT 'NEW',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_inquiries_status_idx" ON "contact_inquiries"("status");

-- CreateIndex
CREATE INDEX "contact_inquiries_createdAt_idx" ON "contact_inquiries"("createdAt");
