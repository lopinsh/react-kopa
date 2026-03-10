-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "role" "AppRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Category"
ADD COLUMN "slugLv" TEXT,
ADD COLUMN "submittedAt" TIMESTAMP(3),
ADD COLUMN "submittedById" TEXT;

-- CreateTable
CREATE TABLE "CategoryAlias" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "locale" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAlias_value_locale_key" ON "CategoryAlias"("value", "locale");

-- CreateIndex
CREATE INDEX "CategoryAlias_categoryId_idx" ON "CategoryAlias"("categoryId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryAlias" ADD CONSTRAINT "CategoryAlias_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
