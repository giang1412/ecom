-- DropIndex
DROP INDEX "public"."User_email_key";

-- DropIndex
DROP INDEX "public"."User_totpSecret_key";

CREATE UNIQUE INDEX "User_email_unique"
ON "User" (email)
WHERE "deletedAt" IS NULL;-- This is an empty migration.