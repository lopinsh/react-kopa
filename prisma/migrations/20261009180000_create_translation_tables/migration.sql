-- Owner-written text of sections and events moves into per-language rows (2.13a).
-- Order matters: create tables, copy the existing text into `lv` rows, then drop the old columns.

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "originalLang" TEXT NOT NULL DEFAULT 'lv';

-- AlterTable
ALTER TABLE "GroupSection" ADD COLUMN     "originalLang" TEXT NOT NULL DEFAULT 'lv';

-- CreateTable
CREATE TABLE "GroupSectionTranslation" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTranslation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupSectionTranslation_sectionId_lang_key" ON "GroupSectionTranslation"("sectionId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "EventTranslation_eventId_lang_key" ON "EventTranslation"("eventId", "lang");

-- AddForeignKey
ALTER TABLE "GroupSectionTranslation" ADD CONSTRAINT "GroupSectionTranslation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "GroupSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTranslation" ADD CONSTRAINT "EventTranslation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data: every existing section and event gets its text as an `lv` row (original language `lv`).
-- Sections still carrying a default title ("About us" / "Practical info", stored as the English key
-- or already localised) get a default title in BOTH languages; the text stays Latvian-only.
INSERT INTO "GroupSectionTranslation" ("id", "sectionId", "lang", "title", "content", "updatedAt")
SELECT 'c' || substr(md5(random()::text || clock_timestamp()::text || s."id"), 1, 24),
       s."id",
       'lv',
       CASE
           WHEN s."title" IN ('About us', 'Par mums') THEN 'Par mums'
           WHEN s."title" IN ('Practical info', 'Praktiskā informācija') THEN 'Praktiskā informācija'
           ELSE s."title"
       END,
       s."content",
       CURRENT_TIMESTAMP
FROM "GroupSection" s;

INSERT INTO "GroupSectionTranslation" ("id", "sectionId", "lang", "title", "content", "updatedAt")
SELECT 'c' || substr(md5(random()::text || clock_timestamp()::text || s."id" || 'en'), 1, 24),
       s."id",
       'en',
       CASE
           WHEN s."title" IN ('About us', 'Par mums') THEN 'About us'
           ELSE 'Practical info'
       END,
       '',
       CURRENT_TIMESTAMP
FROM "GroupSection" s
WHERE s."title" IN ('About us', 'Par mums', 'Practical info', 'Praktiskā informācija');

INSERT INTO "EventTranslation" ("id", "eventId", "lang", "title", "description", "instructions", "updatedAt")
SELECT 'c' || substr(md5(random()::text || clock_timestamp()::text || e."id"), 1, 24),
       e."id",
       'lv',
       e."title",
       e."description",
       e."instructions",
       CURRENT_TIMESTAMP
FROM "Event" e;

-- AlterTable: the old text columns are replaced by the translation rows.
ALTER TABLE "Event" DROP COLUMN "description",
DROP COLUMN "instructions",
DROP COLUMN "title";

ALTER TABLE "GroupSection" DROP COLUMN "content",
DROP COLUMN "title";
