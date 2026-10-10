-- CreateTable
CREATE TABLE "FeedbackReply" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "authorId" TEXT,
    "byAgent" BOOLEAN NOT NULL DEFAULT false,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackReply_pkey" PRIMARY KEY ("id")
);

-- Move the old single reply into the thread (it was written by an agent or an admin; shown as agent).
INSERT INTO "FeedbackReply" ("id", "feedbackId", "byAgent", "text", "createdAt")
SELECT 'fr_' || "id", "id", true, "reply", COALESCE("resolvedAt", "updatedAt")
FROM "Feedback" WHERE "reply" IS NOT NULL AND "reply" <> '';

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "reply";

-- CreateIndex
CREATE INDEX "FeedbackReply_feedbackId_createdAt_idx" ON "FeedbackReply"("feedbackId", "createdAt");

-- AddForeignKey
ALTER TABLE "FeedbackReply" ADD CONSTRAINT "FeedbackReply_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackReply" ADD CONSTRAINT "FeedbackReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
