-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "emailedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "locale" TEXT,
ADD COLUMN     "messagesEmailedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_read_emailedAt_createdAt_idx" ON "Notification"("read", "emailedAt", "createdAt");
