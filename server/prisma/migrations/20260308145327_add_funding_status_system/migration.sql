/*
  Warnings:

  - Added the required column `updatedAt` to the `funding_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "funding_transactions" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Backfill existing rows: set updatedAt = createdAt
UPDATE "funding_transactions" SET "updatedAt" = "createdAt" WHERE "updatedAt" = now();
