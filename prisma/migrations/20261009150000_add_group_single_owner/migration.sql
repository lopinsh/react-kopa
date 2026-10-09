-- One owner per group.
--
-- Step 1: groups that have several OWNERs keep the earliest membership as owner
-- (ties broken by id); every other OWNER becomes ADMIN (shown as "Moderator").
-- This only touches groups that violate the rule, so it is safe on any data and can be re-run.
UPDATE "Membership" AS m
SET "role" = 'ADMIN'
WHERE m."role" = 'OWNER'
  AND EXISTS (
    SELECT 1
    FROM "Membership" AS o
    WHERE o."groupId" = m."groupId"
      AND o."role" = 'OWNER'
      AND (o."joinedAt" < m."joinedAt" OR (o."joinedAt" = m."joinedAt" AND o."id" < m."id"))
  );

-- Step 2: a second owner can never be created. Prisma cannot model partial indexes,
-- so this index lives only in SQL (Prisma ignores it when comparing the schema).
CREATE UNIQUE INDEX "Membership_one_owner_per_group" ON "Membership"("groupId") WHERE "role" = 'OWNER';
