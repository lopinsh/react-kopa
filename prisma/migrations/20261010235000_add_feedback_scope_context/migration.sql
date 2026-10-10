-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "cssPath",
DROP COLUMN "xpath",
ADD COLUMN     "breadcrumb" TEXT,
ADD COLUMN     "commit" TEXT;
