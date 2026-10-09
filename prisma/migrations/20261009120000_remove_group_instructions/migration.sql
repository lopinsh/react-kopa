-- Keep legacy "instructions" text: groups that still have it get a members-only "Practical info" section.
-- Only text with at least one non-space character counts (btrim alone keeps newlines).

-- Groups without any section only showed a virtual "About us" built from the description.
-- Give them a real first section so the new section never becomes the first (fixed, public) one.
INSERT INTO "GroupSection" ("id", "groupId", "title", "content", "order", "visibility", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, g."id", 'About us', COALESCE(g."description", ''), 0, 'PUBLIC', NOW(), NOW()
FROM "Group" g
WHERE g."instructions" ~ '\S'
  AND NOT EXISTS (SELECT 1 FROM "GroupSection" s WHERE s."groupId" = g."id");

-- The old group wizard wrote instructions with the rich-text editor (HTML) and also copied them into a
-- "Member Instructions" section; the seed wrote plain text. HTML is kept as is (sanitised when shown),
-- plain text is escaped with its line breaks kept, and text a section already holds is not copied again.
INSERT INTO "GroupSection" ("id", "groupId", "title", "content", "order", "visibility", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  g."id",
  'Practical info',
  CASE
    WHEN g."instructions" ~ '^\s*<[a-zA-Z]' THEN g."instructions"
    ELSE '<p>' || replace(replace(replace(replace(replace(btrim(g."instructions", E' \t\r\n'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), E'\r\n', E'\n'), E'\n', '<br>') || '</p>'
  END,
  COALESCE((SELECT MAX(s."order") + 1 FROM "GroupSection" s WHERE s."groupId" = g."id"), 0),
  'MEMBERS_ONLY',
  NOW(),
  NOW()
FROM "Group" g
WHERE g."instructions" ~ '\S'
  AND NOT EXISTS (
    SELECT 1 FROM "GroupSection" s
    WHERE s."groupId" = g."id" AND btrim(s."content", E' \t\r\n') = btrim(g."instructions", E' \t\r\n')
  );

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "instructions";
