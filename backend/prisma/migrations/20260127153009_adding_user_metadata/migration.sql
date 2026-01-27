-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "promotedAt" TIMESTAMP(3),
ADD COLUMN     "promotedById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_promotedById_fkey" FOREIGN KEY ("promotedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
