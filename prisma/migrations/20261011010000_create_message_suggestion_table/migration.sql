-- CreateTable
CREATE TABLE "MessageSuggestion" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageSuggestion_key_lang_key" ON "MessageSuggestion"("key", "lang");

-- AddForeignKey
ALTER TABLE "MessageSuggestion" ADD CONSTRAINT "MessageSuggestion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
