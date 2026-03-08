import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { generateToken } from '../../utils/jwt';
import {
  sendCreditNotification,
  sendPendingDepositEmail,
  sendDepositSuccessEmail,
  sendDepositFailedEmail,
} from '../../utils/email';
import { DepositMethodResponse } from '../../types/deposit.types';
import { DepositStatus } from '../../constants/depositStatus';
import { FUNDING_STATUS, FundingStatus, isValidStatusTransition } from '../../constants/fundingStatus';

// ─── Auth ───────────────────────────────────────────────────────────────────

/**
 * Admin login service
 */
export const adminLoginService = async (username: string, password: string) => {
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin) {
    throw Object.assign(new Error('Invalid admin credentials.'), { statusCode: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw Object.assign(new Error('Invalid admin credentials.'), { statusCode: 401 });
  }

  const token = generateToken({
    userId: admin.id,
    username: admin.username,
    email: admin.email,
  });

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
    },
  };
};

// ─── Deposit Methods ────────────────────────────────────────────────────────

/**
 * Get all deposit methods (crypto addresses + networks)
 */
export const getAllDepositMethodsService = async () => {
  return prisma.depositMethod.findMany();
};

/**
 * Create or update a deposit method (admin wallet address + network)
 */
export const upsertDepositMethodService = async (
  method: string,
  details: string,
  network: string = ''
) => {
  return prisma.depositMethod.upsert({
    where: { method },
    update: { details, network },
    create: { method, details, network },
  });
};

/**
 * Get deposit method details by crypto type (for user deposit page)
 */
export const getDepositMethodByCryptoService = async (cryptoType: string): Promise<DepositMethodResponse> => {
  const methodMap: Record<string, string> = {
    bitcoin: 'btc',
    ethereum: 'eth',
    litecoin: 'ltc',
    usdt: 'usdt',
  };

  const dbMethod = methodMap[cryptoType.toLowerCase()];

  if (!dbMethod) {
    throw Object.assign(new Error('Invalid crypto type.'), { statusCode: 400 });
  }

  const depositMethod = await prisma.depositMethod.findUnique({
    where: { method: dbMethod },
  });

  if (!depositMethod) {
    throw Object.assign(new Error('Deposit method not found.'), { statusCode: 404 });
  }

  return {
    address: depositMethod.details,
    network: depositMethod.network || '',
  };
};

// ─── User Management ────────────────────────────────────────────────────────

/**
 * Get all users (for admin user list)
 */
export const getAllUsersService = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      emailAddress: true,
      username: true,
      accountNumber: true,
      accountType: true,
      totalBalance: true,
      phone: true,
      country: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get user by account number (full details)
 */
export const getUserByAccountService = async (accountNumber: string) => {
  const user = await prisma.user.findUnique({
    where: { accountNumber },
    select: {
      id: true,
      fullName: true,
      emailAddress: true,
      username: true,
      accountNumber: true,
      accountType: true,
      currencyType: true,
      totalBalance: true,
      loan: true,
      expenses: true,
      paymentToday: true,
      newLoans: true,
      transactions: true,
      phone: true,
      country: true,
      state: true,
      gender: true,
      dateOfBirth: true,
      occupation: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return user;
};

/**
 * Credit user account (admin funding operation)
 * Creates FundingTransaction record and conditionally updates balance based on status
 */
export const creditUserAccountService = async (
  accountNumber: string,
  amount: number,
  description?: string,
  adminNote?: string,
  status: FundingStatus = FUNDING_STATUS.PENDING
) => {
  const user = await prisma.user.findUnique({ where: { accountNumber } });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const balanceBefore = user.totalBalance;
  const shouldCredit = status === FUNDING_STATUS.SUCCESSFUL;
  const balanceAfter = shouldCredit ? balanceBefore + amount : balanceBefore;
  const transactionId = `FND-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const operations = [
    prisma.fundingTransaction.create({
      data: {
        transactionId,
        userId: user.id,
        amount,
        currency: user.currencyType,
        description: description || 'Account Funding',
        adminNote,
        balanceBefore,
        balanceAfter,
        status,
      },
    }),
  ];

  if (shouldCredit) {
    operations.push(
      prisma.user.update({
        where: { accountNumber },
        data: { totalBalance: balanceAfter },
      }) as never
    );
  }

  const [fundingTx] = await prisma.$transaction(operations);

  // Fetch updated user data
  const updatedUser = await prisma.user.findUnique({
    where: { accountNumber },
    select: {
      id: true,
      accountNumber: true,
      fullName: true,
      emailAddress: true,
      currencyType: true,
      totalBalance: true,
    },
  });

  // Send appropriate email based on status
  if (status === FUNDING_STATUS.PENDING) {
    sendPendingDepositEmail(
      user.emailAddress,
      user.fullName,
      amount,
      user.currencyType,
      description || 'Account Funding',
      transactionId
    ).catch((err) => console.error('[ADMIN] Failed to send pending deposit email:', err));
  } else if (status === FUNDING_STATUS.SUCCESSFUL) {
    sendCreditNotification(
      user.emailAddress,
      user.fullName,
      amount,
      user.currencyType,
      balanceAfter,
      description || 'Account Funding'
    ).catch((err) => console.error('[ADMIN] Failed to send credit notification:', err));
  }
  // FAILED status: no email on initial creation

  return { user: updatedUser, transaction: fundingTx };
};

/**
 * Update funding transaction status (PENDING → SUCCESSFUL or FAILED)
 */
export const updateFundingTransactionStatusService = async (
  transactionId: string,
  newStatus: FundingStatus,
  adminNote?: string
) => {
  const fundingTx = await prisma.fundingTransaction.findUnique({
    where: { transactionId },
    include: { user: true },
  });

  if (!fundingTx) {
    throw Object.assign(new Error('Funding transaction not found.'), { statusCode: 404 });
  }

  if (!isValidStatusTransition(fundingTx.status, newStatus)) {
    throw Object.assign(
      new Error(`Cannot transition from ${fundingTx.status} to ${newStatus}.`),
      { statusCode: 400 }
    );
  }

  const user = fundingTx.user;

  if (newStatus === FUNDING_STATUS.SUCCESSFUL) {
    // Credit user balance and update transaction atomically
    const newBalance = user.totalBalance + fundingTx.amount;

    const [updatedTx] = await prisma.$transaction([
      prisma.fundingTransaction.update({
        where: { transactionId },
        data: {
          status: newStatus,
          balanceAfter: newBalance,
          ...(adminNote !== undefined && { adminNote }),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { totalBalance: newBalance },
      }),
    ]);

    sendDepositSuccessEmail(
      user.emailAddress,
      user.fullName,
      fundingTx.amount,
      fundingTx.currency,
      newBalance,
      fundingTx.description || 'Account Funding',
      transactionId
    ).catch((err) => console.error('[ADMIN] Failed to send deposit success email:', err));

    return updatedTx;
  } else {
    // FAILED — just update the status, no balance change
    const updatedTx = await prisma.fundingTransaction.update({
      where: { transactionId },
      data: {
        status: newStatus,
        ...(adminNote !== undefined && { adminNote }),
      },
    });

    sendDepositFailedEmail(
      user.emailAddress,
      user.fullName,
      fundingTx.amount,
      fundingTx.currency,
      fundingTx.description || 'Account Funding',
      transactionId
    ).catch((err) => console.error('[ADMIN] Failed to send deposit failed email:', err));

    return updatedTx;
  }
};

/**
 * Get user's funding transaction history
 */
export const getUserFundingHistoryService = async (accountNumber: string) => {
  const user = await prisma.user.findUnique({
    where: { accountNumber },
    select: {
      id: true,
      fullName: true,
      accountNumber: true,
      currencyType: true,
      totalBalance: true,
      emailAddress: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const history = await prisma.fundingTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return { user, history };
};

// ─── Stats ──────────────────────────────────────────────────────────────────

export const getAdminStatsService = async () => {
  const [totalUsers, totalWithdrawals, depositMethods, totalDepositRequests] = await Promise.all([
    prisma.user.count(),
    prisma.withdrawal.count(),
    prisma.depositMethod.count(),
    prisma.depositRequest.count(),
  ]);

  const users = await prisma.user.findMany({ select: { totalBalance: true } });
  const totalBalance = users.reduce((sum: number, u: { totalBalance: number }) => sum + u.totalBalance, 0);

  const recentWithdrawals = await prisma.withdrawal.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, accountNumber: true } },
    },
  });

  const pendingDeposits = await prisma.depositRequest.count({
    where: { status: 'PENDING' },
  });

  return {
    totalUsers,
    totalWithdrawals,
    totalBalance,
    depositMethods,
    totalDepositRequests,
    pendingDeposits,
    recentWithdrawals,
  };
};

// ─── Transaction History (all users) ────────────────────────────────────────

export const getAllTransactionsService = async () => {
  return prisma.withdrawal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, accountNumber: true } },
    },
  });
};

// ─── Deposit Requests (admin view) ──────────────────────────────────────────

/**
 * Get all deposit requests (for admin review)
 */
export const getAllDepositRequestsService = async () => {
  return prisma.depositRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { fullName: true, accountNumber: true, emailAddress: true },
      },
    },
  });
};

/**
 * Update deposit request status (approve or reject)
 */
export const updateDepositRequestStatusService = async (
  requestId: string,
  status: DepositStatus,
  adminNote?: string
) => {
  const deposit = await prisma.depositRequest.findUnique({ where: { requestId } });

  if (!deposit) {
    throw Object.assign(new Error('Deposit request not found.'), { statusCode: 404 });
  }

  return prisma.depositRequest.update({
    where: { requestId },
    data: { status, adminNote },
  });
};