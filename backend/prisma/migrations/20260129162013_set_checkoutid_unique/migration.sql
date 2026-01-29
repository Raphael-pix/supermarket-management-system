/*
  Warnings:

  - A unique constraint covering the columns `[checkoutRequestId]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.
  - Made the column `checkoutRequestId` on table `Sale` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "checkoutRequestId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_checkoutRequestId_key" ON "Sale"("checkoutRequestId");
