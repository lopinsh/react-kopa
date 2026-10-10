-- CreateTable
CREATE TABLE "SiteTheme" (
    "id" TEXT NOT NULL,
    "presetKey" TEXT NOT NULL,
    "light" JSONB NOT NULL,
    "dark" JSONB NOT NULL,
    "headingFont" TEXT NOT NULL,
    "bodyFont" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteTheme_isPublished_idx" ON "SiteTheme"("isPublished");
