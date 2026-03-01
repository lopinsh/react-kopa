-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowDirectMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isProfilePublic" BOOLEAN NOT NULL DEFAULT true;
