/*
  Warnings:

  - A unique constraint covering the columns `[skuId,userId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CartItem_skuId_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_skuId_userId_key" ON "CartItem"("skuId", "userId");
