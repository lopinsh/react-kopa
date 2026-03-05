/*
  Warnings:

  - The values [SINGLE_EVENT] on the enum `GroupType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GroupType_new" AS ENUM ('PUBLIC', 'PRIVATE');
ALTER TABLE "public"."Group" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Group" ALTER COLUMN "type" TYPE "GroupType_new" USING ("type"::text::"GroupType_new");
ALTER TYPE "GroupType" RENAME TO "GroupType_old";
ALTER TYPE "GroupType_new" RENAME TO "GroupType";
DROP TYPE "public"."GroupType_old";
ALTER TABLE "Group" ALTER COLUMN "type" SET DEFAULT 'PUBLIC';
COMMIT;
