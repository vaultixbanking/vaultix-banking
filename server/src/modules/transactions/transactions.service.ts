import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { generateTransactionId, maskAccount } from '../../utils/helpers';
import { sendDebitNotification } from '../../utils/email';
import { WithdrawBody } from '../../types';
import { TRANSFER_STATUS } from '../../constants/transferStatus';

const WITHDRAWAL_TYPES = ['BANK', 'CRYPTO'];

const insufficientBalance = () =>
  Object.assign(new Error('Insufficient balance.'), { statusCode: 400 });

/**
 * Customer transfer / withdrawal. The amount is deducted immediately. Customers with
 * transfer review switched on get a PENDING transfer that an admin completes or
 * declines later; everyone else's transfer completes straight away.
 */
export const withdrawService = async (userId: string, body: WithdrawBody) => {
  const { pin, withdrawalType, details } = body;
  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw Object.assign(new Error('Invalid amount. Must be greater than 0.'), { statusCode: 400 });
  }

  if (!WITHDRAWAL_TYPES.includes(withdrawalType)) {
    throw Object.assign(new Error('Invalid transaction type.'), { statusCode: 400 });
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

  if (user.totalBalance < amount) {
    throw insufficientBalance();
  }

  const txnId = generateTransactionId('WD');
  const status = user.transferReviewRequired ? TRANSFER_STATUS.PENDING : TRANSFER_STATUS.SUCCESSFUL;

  const { withdrawal, newBalance } = await prisma.$transaction(async (tx) => {
    // Conditional on the balance so two transfers submitted at once can never overdraw
    const { count } = await tx.user.updateMany({
      where: { id: userId, totalBalance: { gte: amount } },
      data: { totalBalance: { decrement: amount } },
    });
    if (count === 0) throw insufficientBalance();

    const created = await tx.withdrawal.create({
      data: {
        userId,
        transactionId: txnId,
        amount,
        withdrawalType,
        details: details as Prisma.InputJsonValue | undefined,
        status,
      },
    });
    const { totalBalance } = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { totalBalance: true },
    });
    return { withdrawal: created, newBalance: totalBalance };
  });

  // Confirmation, or "we've received it and it's processing" (non-blocking)
  sendDebitNotification(
    user.emailAddress,
    user.fullName,
    amount,
    user.currencyType,
    newBalance,
    withdrawalType,
    txnId,
    details as Record<string, unknown> | undefined,
    status === TRANSFER_STATUS.PENDING ? 'PROCESSING' : 'COMPLETED'
  ).catch((err) => {
    console.error('[WITHDRAWAL] Failed to send debit notification:', err);
  });

  return {
    transactionId: withdrawal.transactionId,
    newBalance,
    amount: withdrawal.amount,
    status: withdrawal.status,
  };
};

/**
 * Customer transaction history. Everything here is shown to the customer, so it must
 * never include internal notes, admin ids or the transfer review flag.
 */
export const getWithdrawalHistoryService = async (userId: string) => {
  const [withdrawals, fundingTxns, incomingWires, reversals] = await Promise.all([
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
    prisma.transactionReversal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // A reversed transaction points at its reversal entry (reference, date, message)
  const reversalOf = new Map(reversals.map((r: typeof reversals[number]) => [r.sourceTransactionId, r]));
  const reversalInfo = (transactionId: string, status: string) => {
    const r = status === TRANSFER_STATUS.REVERSED ? reversalOf.get(transactionId) : undefined;
    return r
      ? {
          reversalId: r.reversalId,
          reversedAt: r.createdAt.toISOString(),
          ...(r.customerMessage ? { statusMessage: r.customerMessage } : {}),
        }
      : {};
  };

  const withdrawalItems = withdrawals.map((w: typeof withdrawals[number]) => {
    const showMessage = !!w.customerMessage && w.status === TRANSFER_STATUS.DECLINED;
    return {
      id: w.id,
      transactionId: w.transactionId,
      amount: w.amount,
      withdrawalType: w.withdrawalType,
      status: w.status,
      details: {
        ...((w.details as Record<string, unknown> | null) ?? {}),
        ...(showMessage ? { statusMessage: w.customerMessage } : {}),
        ...reversalInfo(w.transactionId, w.status),
      },
      createdAt: w.createdAt.toISOString(),
    };
  });

  const creditItems = fundingTxns.map((f: typeof fundingTxns[number]) => ({
    id: f.id,
    transactionId: f.transactionId,
    amount: f.amount,
    withdrawalType: 'DEPOSIT' as const,
    status: f.status,
    details: {
      description: f.description || 'Account funding',
      currency: f.currency,
      balanceBefore: f.balanceBefore,
      balanceAfter: f.balanceAfter,
      ...reversalInfo(f.transactionId, f.status),
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
      ...(w.senderAccountNumber ? { senderAccount: maskAccount(w.senderAccountNumber) } : {}),
      purpose: w.reason,
      currency: w.currency,
      ...reversalInfo(w.transactionId, w.status),
    },
    createdAt: w.createdAt.toISOString(),
  }));

  // A reversal is its own entry, pointing at the transaction it undid
  const reversalItems = reversals.map((r: typeof reversals[number]) => ({
    id: r.id,
    transactionId: r.reversalId,
    amount: r.amount,
    withdrawalType: 'REVERSAL' as const,
    status: 'SUCCESSFUL' as const,
    details: {
      transferType: 'REVERSAL',
      direction: r.direction,
      originalTransactionId: r.sourceTransactionId,
      description: `Reversal of ${r.sourceTransactionId}`,
      currency: r.currency,
      ...(r.customerMessage ? { statusMessage: r.customerMessage } : {}),
    },
    createdAt: r.createdAt.toISOString(),
  }));

  return [...withdrawalItems, ...creditItems, ...wireItems, ...reversalItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
