/*
  Warnings:

  - You are about to drop the column `images` on the `SKU` table. All the data in the column will be lost.
  - Changed the type of `variants` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `image` to the `SKU` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "variants",
ADD COLUMN     "variants" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SKU" DROP COLUMN "images",
ADD COLUMN     "image" TEXT NOT NULL;
