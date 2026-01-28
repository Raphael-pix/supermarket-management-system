-- CreateTable
CREATE TABLE "RestockLog" (
    "id" TEXT NOT NULL,
    "fromBranchId" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestockLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestockLogItem" (
    "id" TEXT NOT NULL,
    "restockLogId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "RestockLogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RestockLog_fromBranchId_idx" ON "RestockLog"("fromBranchId");

-- CreateIndex
CREATE INDEX "RestockLog_toBranchId_idx" ON "RestockLog"("toBranchId");

-- CreateIndex
CREATE INDEX "RestockLog_performedById_idx" ON "RestockLog"("performedById");

-- CreateIndex
CREATE INDEX "RestockLogItem_restockLogId_idx" ON "RestockLogItem"("restockLogId");

-- CreateIndex
CREATE INDEX "RestockLogItem_productId_idx" ON "RestockLogItem"("productId");

-- AddForeignKey
ALTER TABLE "RestockLog" ADD CONSTRAINT "RestockLog_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockLog" ADD CONSTRAINT "RestockLog_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockLog" ADD CONSTRAINT "RestockLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockLogItem" ADD CONSTRAINT "RestockLogItem_restockLogId_fkey" FOREIGN KEY ("restockLogId") REFERENCES "RestockLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockLogItem" ADD CONSTRAINT "RestockLogItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
