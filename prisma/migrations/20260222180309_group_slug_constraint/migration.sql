/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,slug]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Group_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Group_categoryId_slug_key" ON "Group"("categoryId", "slug");
