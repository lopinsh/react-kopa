-- Replies (posts with a parent) predate announcements and are not shown anywhere; remove them so they do not
-- turn into top-level announcements once the parent link is gone.
DELETE FROM "Post" WHERE "parentId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_parentId_fkey";

-- DropIndex
DROP INDEX "GroupSection_groupId_idx";

-- DropIndex
DROP INDEX "GroupSection_order_idx";

-- DropIndex
DROP INDEX "Message_conversationId_idx";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "creatorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "accentColor";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isRead";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "parentId";

-- CreateIndex
CREATE INDEX "Attendance_eventId_status_idx" ON "Attendance"("eventId", "status");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "GroupSection_groupId_order_idx" ON "GroupSection"("groupId", "order");

-- CreateIndex
CREATE INDEX "Membership_groupId_role_idx" ON "Membership"("groupId", "role");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_audience_createdAt_idx" ON "Notification"("userId", "audience", "createdAt");

-- CreateIndex
CREATE INDEX "Post_groupId_createdAt_idx" ON "Post"("groupId", "createdAt");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

