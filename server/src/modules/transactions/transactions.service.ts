import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { generateTransactionId } from '../../utils/helpers';
import { sendDebitNotification } from '../../utils/email';
import { WithdrawBody } from '../../types';

export const withdrawService = async (userId: string, body: WithdrawBody) => {
  const { pin, amount, withdrawalType, details } = body;

  if (isNaN(amount) || amount <= 0) {
    throw Object.assign(new Error('Invalid amount. Must be greater than 0.'), { statusCode: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  // Verify PIN
  const isPinValid = await bcrypt.compare(pin, user.pin);
  if (!isPinValid) {
    throw Object.assign(new Error('Invalid PIN.'), { statusCode: 400 });
  }

  // Check balance
  if (user.totalBalance < amount) {
    throw Object.assign(new Error('Insufficient balance.'), { statusCode: 400 });
  }

  const txnId = generateTransactionId('WD');

  // Deduct balance and create withdrawal record in a transaction
  const [updatedUser, withdrawal] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { totalBalance: { decrement: amount } },
    }),
    prisma.withdrawal.create({
      data: {
        userId,
        transactionId: txnId,
        amount,
        withdrawalType,
        details: details as object,
        status: 'SUCCESSFUL',
      },
    }),
  ]);

  // Send debit notification email (non-blocking) with type-specific details
  sendDebitNotification(
    user.emailAddress,
    user.fullName,
    amount,
    user.currencyType,
    updatedUser.totalBalance,
    withdrawalType,
    txnId,
    details as Record<string, unknown> | undefined
  ).catch((err) => {
    console.error('[WITHDRAWAL] Failed to send debit notification:', err);
  });

  return {
    transactionId: withdrawal.transactionId,
    newBalance: updatedUser.totalBalance,
    amount: withdrawal.amount,
    status: withdrawal.status,
  };
};

export const getWithdrawalHistoryService = async (userId: string) => {
  const [withdrawals, fundingTxns, incomingWires] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.fundingTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wireTransfer
      .findMany({
        where: { recipientUserId: userId },
        orderBy: { createdAt: 'desc' },
      })
      // If the code goes live before the wire_transfers migration, keep history working
      .catch((err: unknown) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
          console.warn('[TRANSACTIONS] wire_transfers table missing — run prisma migrate deploy');
          return [];
        }
        throw err;
      }),
  ]);

  const withdrawalItems = withdrawals.map((w: typeof withdrawals[number]) => ({
    id: w.id,
    transactionId: w.transactionId,
    amount: w.amount,
    withdrawalType: w.withdrawalType,
    status: w.status,
    details: w.details as Record<string, unknown> | undefined,
    createdAt: w.createdAt.toISOString(),
  }));

  const creditItems = fundingTxns.map((f: typeof fundingTxns[number]) => ({
    id: f.id,
    transactionId: f.transactionId,
    amount: f.amount,
    withdrawalType: 'DEPOSIT' as const,
    status: 'SUCCESSFUL' as const,
    details: {
      description: f.description || 'Account funding',
      currency: f.currency,
      balanceBefore: f.balanceBefore,
      balanceAfter: f.balanceAfter,
      ...(f.adminNote ? { adminNote: f.adminNote } : {}),
    },
    createdAt: f.createdAt.toISOString(),
  }));

  const wireItems = incomingWires.map((w: typeof incomingWires[number]) => ({
    id: w.id,
    transactionId: w.transactionId,
    amount: w.amount,
    withdrawalType: 'DEPOSIT' as const,
    status: w.status,
    details: {
      transferType: 'INCOMING_WIRE',
      sender: w.senderName,
      senderBank: w.senderBankName,
      purpose: w.reason,
      currency: w.currency,
    },
    createdAt: w.createdAt.toISOString(),
  }));

  return [...withdrawalItems, ...creditItems, ...wireItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};