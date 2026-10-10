-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "title" TEXT;

-- Announcements moved from /discussions to /announcements: point existing notifications at the new page.
UPDATE "Notification"
SET "link" = regexp_replace("link", '/discussions$', '/announcements')
WHERE "type" = 'NEW_POST' AND "link" LIKE '%/discussions';
