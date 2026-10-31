-- AlterTable
ALTER TABLE "users" ADD COLUMN     "transferReviewRequired" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "customerMessage" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedByAdminId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "transaction_reversals" (
    "id" TEXT NOT NULL,
    "reversalId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceTransactionId" TEXT NOT NULL,
    "userId" TEXT,
    "direction" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balanceBefore" DOUBLE PRECISION,
    "balanceAfter" DOUBLE PRECISION,
    "customerMessage" TEXT,
    "adminNote" TEXT,
    "notifyCustomer" BOOLEAN NOT NULL DEFAULT true,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_reversals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_reversals_reversalId_key" ON "transaction_reversals"("reversalId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_reversals_sourceTransactionId_key" ON "transaction_reversals"("sourceTransactionId");

-- CreateIndex
CREATE INDEX "transaction_reversals_userId_idx" ON "transaction_reversals"("userId");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- AddForeignKey
ALTER TABLE "transaction_reversals" ADD CONSTRAINT "transaction_reversals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
