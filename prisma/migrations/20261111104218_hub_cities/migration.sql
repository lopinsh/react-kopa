-- CreateEnum
CREATE TYPE "HubCityStatus" AS ENUM ('REQUESTED', 'OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "HubCity" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "status" "HubCityStatus" NOT NULL DEFAULT 'REQUESTED',
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubCityRequest" (
    "id" TEXT NOT NULL,
    "hubCityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HubCityRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HubCity_cityId_status_idx" ON "HubCity"("cityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "HubCity_categoryId_cityId_key" ON "HubCity"("categoryId", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "HubCityRequest_noteId_key" ON "HubCityRequest"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "HubCityRequest_hubCityId_userId_key" ON "HubCityRequest"("hubCityId", "userId");

-- AddForeignKey
ALTER TABLE "HubCity" ADD CONSTRAINT "HubCity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubCity" ADD CONSTRAINT "HubCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubCity" ADD CONSTRAINT "HubCity_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubCityRequest" ADD CONSTRAINT "HubCityRequest_hubCityId_fkey" FOREIGN KEY ("hubCityId") REFERENCES "HubCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubCityRequest" ADD CONSTRAINT "HubCityRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubCityRequest" ADD CONSTRAINT "HubCityRequest_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "HubNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
