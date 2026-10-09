-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "originGroupId" TEXT,
ADD COLUMN     "originType" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_originGroupId_idx" ON "Conversation"("originGroupId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_originGroupId_fkey" FOREIGN KEY ("originGroupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
