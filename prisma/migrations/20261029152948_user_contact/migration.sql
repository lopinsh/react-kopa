-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "contactVisibleToAll" BOOLEAN NOT NULL DEFAULT false;
