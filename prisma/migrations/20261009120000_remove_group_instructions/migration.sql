-- Keep legacy "instructions" text: groups that still have it get a members-only "Practical info" section.

-- Groups without any section only showed a virtual "About us" built from the description.
-- Give them a real first section so the new section never becomes the first (fixed, public) one.
INSERT INTO "GroupSection" ("id", "groupId", "title", "content", "order", "visibility", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, g."id", 'About us', COALESCE(g."description", ''), 0, 'PUBLIC', NOW(), NOW()
FROM "Group" g
WHERE g."instructions" IS NOT NULL
  AND btrim(g."instructions") <> ''
  AND NOT EXISTS (SELECT 1 FROM "GroupSection" s WHERE s."groupId" = g."id");

-- The text was plain; escape it and keep line breaks.
INSERT INTO "GroupSection" ("id", "groupId", "title", "content", "order", "visibility", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  g."id",
  'Practical info',
  '<p>' || replace(replace(replace(replace(g."instructions", '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), E'\n', '<br>') || '</p>',
  COALESCE((SELECT MAX(s."order") + 1 FROM "GroupSection" s WHERE s."groupId" = g."id"), 0),
  'MEMBERS_ONLY',
  NOW(),
  NOW()
FROM "Group" g
WHERE g."instructions" IS NOT NULL
  AND btrim(g."instructions") <> '';

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "instructions";
