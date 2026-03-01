-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrencePattern" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "discordLink" TEXT,
ADD COLUMN     "instagramLink" TEXT,
ADD COLUMN     "isAcceptingMembers" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "websiteLink" TEXT;
