-- CreateTable
CREATE TABLE "wire_transfers" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT,
    "senderBankName" TEXT,
    "senderAccountNumber" TEXT,
    "senderEmail" TEXT,
    "recipientType" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientAccountNumber" TEXT NOT NULL,
    "recipientBankName" TEXT NOT NULL,
    "recipientSwiftCode" TEXT,
    "recipientRoutingNumber" TEXT,
    "recipientAddress" TEXT,
    "recipientCity" TEXT,
    "recipientCountry" TEXT,
    "recipientEmail" TEXT,
    "recipientUserId" TEXT,
    "balanceBefore" DOUBLE PRECISION,
    "balanceAfter" DOUBLE PRECISION,
    "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
    "adminNote" TEXT,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wire_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wire_transfers_transactionId_key" ON "wire_transfers"("transactionId");

-- CreateIndex
CREATE INDEX "wire_transfers_recipientUserId_idx" ON "wire_transfers"("recipientUserId");

-- CreateIndex
CREATE INDEX "wire_transfers_status_idx" ON "wire_transfers"("status");

-- AddForeignKey
ALTER TABLE "wire_transfers" ADD CONSTRAINT "wire_transfers_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
