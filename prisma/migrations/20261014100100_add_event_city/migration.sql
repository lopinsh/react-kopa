-- AlterTable
ALTER TABLE "Event" ADD COLUMN "city" TEXT,
ADD COLUMN "isOnline" BOOLEAN NOT NULL DEFAULT false;

-- Every existing event takes its group's city (AR-57: "filled in with the group's city").
-- A group whose suggested city was rejected has '' (CityService.reject); its events get '' too, never NULL,
-- so R5a's NOT NULL step only has to re-fill events created by the old code during this deploy.
UPDATE "Event" AS e SET "city" = g."city" FROM "Group" AS g WHERE e."groupId" = g."id" AND e."city" IS NULL;

-- CreateIndex
CREATE INDEX "Event_city_startDate_idx" ON "Event"("city", "startDate");
