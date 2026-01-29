-- DropIndex
DROP INDEX "Sale_mpesaReference_key";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "checkoutRequestId" TEXT,
ALTER COLUMN "mpesaReference" DROP NOT NULL;
