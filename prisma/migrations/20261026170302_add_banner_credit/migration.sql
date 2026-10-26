-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "bannerCreditName" TEXT,
ADD COLUMN     "bannerCreditUser" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "bannerCreditName" TEXT,
ADD COLUMN     "bannerCreditUser" TEXT;
