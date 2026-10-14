-- Events the R3 code created during the R4 deploy have no city: they take their group's (AR-57).
UPDATE "Event" AS e SET "city" = g."city" FROM "Group" AS g WHERE e."groupId" = g."id" AND e."city" IS NULL;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "city" SET NOT NULL;
