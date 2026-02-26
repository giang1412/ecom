/*
  Warnings:

  - You are about to drop the column `base_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `virtual_price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SKUToVariantOption` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `basePrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `virtualPrice` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Variant" DROP CONSTRAINT "Variant_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."VariantOption" DROP CONSTRAINT "VariantOption_variantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_B_fkey";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "base_price",
DROP COLUMN "virtual_price",
ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "name" VARCHAR(500) NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "variants" JSONB[],
ADD COLUMN     "virtualPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."SKU" ALTER COLUMN "images" SET NOT NULL,
ALTER COLUMN "images" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."Variant";

-- DropTable
DROP TABLE "public"."VariantOption";

-- DropTable
DROP TABLE "public"."_SKUToVariantOption";
