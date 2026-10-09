-- CreateTable
CREATE TABLE "MessageOverride" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageOverride_key_lang_key" ON "MessageOverride"("key", "lang");

-- AddForeignKey
ALTER TABLE "MessageOverride" ADD CONSTRAINT "MessageOverride_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
