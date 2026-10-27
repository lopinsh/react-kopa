-- CreateTable
CREATE TABLE "GroupSectionPicture" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "creditName" TEXT,
    "creditUser" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupSectionPicture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupSectionPicture_sectionId_order_idx" ON "GroupSectionPicture"("sectionId", "order");

-- AddForeignKey
ALTER TABLE "GroupSectionPicture" ADD CONSTRAINT "GroupSectionPicture_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "GroupSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
