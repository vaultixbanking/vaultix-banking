import bcrypt from 'bcryptjs';
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

  // Send debit notification email (non-blocking)
  sendDebitNotification(
    user.emailAddress,
    user.fullName,
    amount,
    user.currencyType,
    updatedUser.totalBalance,
    withdrawalType,
    txnId
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
  return prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};