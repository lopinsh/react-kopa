-- CreateEnum
CREATE TYPE "FeedbackKind" AS ENUM ('BUG', 'IDEA', 'IMPROVEMENT', 'QUESTION');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'DOING', 'DONE', 'WONT_DO');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "kind" "FeedbackKind" NOT NULL,
    "text" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
    "path" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "viewportW" INTEGER NOT NULL,
    "viewportH" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "elementText" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "reply" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_status_createdAt_idx" ON "Feedback"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_path_idx" ON "Feedback"("path");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
