/*
  Warnings:

  - A unique constraint covering the columns `[groupId,slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('GOING', 'INTERESTED');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'GOING';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "instructions" TEXT;

-- CreateTable
CREATE TABLE "GroupSection" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupSection_groupId_idx" ON "GroupSection"("groupId");

-- CreateIndex
CREATE INDEX "GroupSection_order_idx" ON "GroupSection"("order");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_groupId_slug_key" ON "Event"("groupId", "slug");

-- CreateIndex
CREATE INDEX "Group_slug_idx" ON "Group"("slug");

-- CreateIndex
CREATE INDEX "Group_city_idx" ON "Group"("city");

-- CreateIndex
CREATE INDEX "Group_createdAt_idx" ON "Group"("createdAt");

-- AddForeignKey
ALTER TABLE "GroupSection" ADD CONSTRAINT "GroupSection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
