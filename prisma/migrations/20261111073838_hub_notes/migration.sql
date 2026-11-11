-- CreateEnum
CREATE TYPE "ChatRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "targetNoteId" TEXT,
ADD COLUMN     "targetNoteReplyId" TEXT;

-- CreateTable
CREATE TABLE "HubNote" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "cityId" TEXT,
    "groupId" TEXT,
    "content" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubNoteReply" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubNoteReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "noteId" TEXT,
    "content" TEXT NOT NULL,
    "status" "ChatRequestStatus" NOT NULL DEFAULT 'PENDING',
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ChatRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HubNote_categoryId_expiresAt_idx" ON "HubNote"("categoryId", "expiresAt");

-- CreateIndex
CREATE INDEX "HubNote_authorId_expiresAt_idx" ON "HubNote"("authorId", "expiresAt");

-- CreateIndex
CREATE INDEX "HubNoteReply_noteId_createdAt_idx" ON "HubNoteReply"("noteId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatRequest_recipientId_status_idx" ON "ChatRequest"("recipientId", "status");

-- CreateIndex
CREATE INDEX "ChatRequest_senderId_status_idx" ON "ChatRequest"("senderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRequest_noteId_senderId_key" ON "ChatRequest"("noteId", "senderId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetNoteId_fkey" FOREIGN KEY ("targetNoteId") REFERENCES "HubNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetNoteReplyId_fkey" FOREIGN KEY ("targetNoteReplyId") REFERENCES "HubNoteReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubNote" ADD CONSTRAINT "HubNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubNote" ADD CONSTRAINT "HubNote_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubNote" ADD CONSTRAINT "HubNote_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubNote" ADD CONSTRAINT "HubNote_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubNoteReply" ADD CONSTRAINT "HubNoteReply_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "HubNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubNoteReply" ADD CONSTRAINT "HubNoteReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRequest" ADD CONSTRAINT "ChatRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRequest" ADD CONSTRAINT "ChatRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRequest" ADD CONSTRAINT "ChatRequest_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "HubNote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRequest" ADD CONSTRAINT "ChatRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
