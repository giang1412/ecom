-- This is an empty migration.

CREATE UNIQUE INDEX "ProductTranslation_productId_languageId_unique"
ON "public"."ProductTranslation" ("productId", "languageId")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "SKU_productId_value_unique"
ON "public"."SKU" ("productId", "value")
WHERE "deletedAt" IS NULL;