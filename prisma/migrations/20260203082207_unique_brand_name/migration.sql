-- This is an empty migration.
CREATE UNIQUE INDEX "BrandTranslation_brandId_languageId_unique_not_deleted"
ON "public"."BrandTranslation" ("brandId", "languageId")
WHERE "deletedAt" IS NULL;