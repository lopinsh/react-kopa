-- CreateEnum
CREATE TYPE "CityStatus" AS ENUM ('ACTIVE', 'PENDING_REVIEW');

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameLv" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "status" "CityStatus" NOT NULL DEFAULT 'ACTIVE',
    "submittedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_status_idx" ON "City"("status");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The ten cities that used to live in code (slug = the value groups already store).
INSERT INTO "City" ("id", "slug", "nameLv", "nameEn") VALUES
    ('city_riga', 'Riga', 'Rīga', 'Riga'),
    ('city_jurmala', 'Jurmala', 'Jūrmala', 'Jūrmala'),
    ('city_liepaja', 'Liepaja', 'Liepāja', 'Liepāja'),
    ('city_daugavpils', 'Daugavpils', 'Daugavpils', 'Daugavpils'),
    ('city_ventspils', 'Ventspils', 'Ventspils', 'Ventspils'),
    ('city_jelgava', 'Jelgava', 'Jelgava', 'Jelgava'),
    ('city_jekabpils', 'Jekabpils', 'Jēkabpils', 'Jēkabpils'),
    ('city_sigulda', 'Sigulda', 'Sigulda', 'Sigulda'),
    ('city_cesis', 'Cesis', 'Cēsis', 'Cēsis'),
    ('city_valmiera', 'Valmiera', 'Valmiera', 'Valmiera')
ON CONFLICT ("slug") DO NOTHING;

-- Any other city value a group already has (free text from before) becomes an approved city under its own name,
-- so no group loses its city. Empty values are left alone.
INSERT INTO "City" ("id", "slug", "nameLv", "nameEn")
SELECT 'city_' || md5("city"), "city", "city", "city"
FROM (SELECT DISTINCT "city" FROM "Group" WHERE "city" <> '') AS used
WHERE NOT EXISTS (SELECT 1 FROM "City" c WHERE c."slug" = used."city");
