/*
  Warnings:

  - You are about to drop the column `content` on the `Permission` table. All the data in the column will be lost.
  - Added the required column `description` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Brand" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."BrandTranslation" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."CategoryTranslation" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Language" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Permission" DROP COLUMN "content",
ADD COLUMN     "deletedById" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."ProductTranslation" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Role" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."SKU" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."UserTranslation" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Variant" ADD COLUMN     "deletedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."VariantOption" ADD COLUMN     "deletedById" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Language" ADD CONSTRAINT "Language_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."UserTranslation" ADD CONSTRAINT "UserTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ProductTranslation" ADD CONSTRAINT "ProductTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Variant" ADD CONSTRAINT "Variant_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."VariantOption" ADD CONSTRAINT "VariantOption_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."SKU" ADD CONSTRAINT "SKU_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Brand" ADD CONSTRAINT "Brand_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."BrandTranslation" ADD CONSTRAINT "BrandTranslation_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
