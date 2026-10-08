-- The "Interested" response is removed.
DELETE FROM "Attendance" WHERE "status" = 'INTERESTED';

-- CreateEnum
CREATE TYPE "EventJoinMode" AS ENUM ('OPEN', 'REQUEST');

-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('GOING', 'PENDING', 'DECLINED', 'WAITLISTED');
ALTER TABLE "Attendance" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Attendance" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING ("status"::text::"AttendanceStatus_new");
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "AttendanceStatus_old";
ALTER TABLE "Attendance" ALTER COLUMN "status" SET DEFAULT 'GOING';
COMMIT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isFull" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinMode" "EventJoinMode" NOT NULL DEFAULT 'OPEN';
