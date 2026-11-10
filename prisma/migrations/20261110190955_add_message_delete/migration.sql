-- AlterTable
ALTER TABLE "ConversationRead" ADD COLUMN     "clearedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedAt" TIMESTAMP(3);
