-- CreateTable
CREATE TABLE "HqRestockLog" (
    "id" TEXT NOT NULL,
    "hqBranchId" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "supplierName" TEXT,
    "referenceNo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HqRestockLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HqRestockItem" (
    "id" TEXT NOT NULL,
    "hqRestockId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION,

    CONSTRAINT "HqRestockItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HqRestockLog" ADD CONSTRAINT "HqRestockLog_hqBranchId_fkey" FOREIGN KEY ("hqBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HqRestockLog" ADD CONSTRAINT "HqRestockLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HqRestockItem" ADD CONSTRAINT "HqRestockItem_hqRestockId_fkey" FOREIGN KEY ("hqRestockId") REFERENCES "HqRestockLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HqRestockItem" ADD CONSTRAINT "HqRestockItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
