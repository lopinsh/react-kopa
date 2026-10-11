-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "audience" TEXT NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "Notification_userId_audience_read_idx" ON "Notification"("userId", "audience", "read");
