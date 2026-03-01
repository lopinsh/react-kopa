-- CreateTable
CREATE TABLE "_GroupTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupTags_B_index" ON "_GroupTags"("B");

-- AddForeignKey
ALTER TABLE "_GroupTags" ADD CONSTRAINT "_GroupTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupTags" ADD CONSTRAINT "_GroupTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
