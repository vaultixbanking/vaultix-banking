import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { generateToken } from '../../utils/jwt';
import { sendCreditNotification } from '../../utils/email';

// ─── Auth ───────────────────────────────────────────────────────────────────

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

export const getAllDepositMethodsService = async () => {
  return prisma.depositMethod.findMany();
};

export const upsertDepositMethodService = async (method: string, details: string) => {
  return prisma.depositMethod.upsert({
    where: { method },
    update: { details },
    create: { method, details },
  });
};

export const getDepositMethodByCryptoService = async (cryptoType: string) => {
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

  return { address: depositMethod.details };
};

// ─── User Management ────────────────────────────────────────────────────────

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

export const creditUserAccountService = async (
  accountNumber: string,
  amount: number,
  description?: string,
  adminNote?: string
) => {
  const user = await prisma.user.findUnique({ where: { accountNumber } });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const balanceBefore = user.totalBalance;
  const balanceAfter = balanceBefore + amount;
  const transactionId = `FND-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const [updatedUser, fundingTx] = await prisma.$transaction([
    prisma.user.update({
      where: { accountNumber },
      data: { totalBalance: balanceAfter },
      select: {
        id: true,
        accountNumber: true,
        fullName: true,
        emailAddress: true,
        currencyType: true,
        totalBalance: true,
      },
    }),
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
        status: 'COMPLETED',
      },
    }),
  ]);

  sendCreditNotification(
    updatedUser.emailAddress,
    updatedUser.fullName,
    amount,
    updatedUser.currencyType,
    updatedUser.totalBalance,
    description || 'Account Funding'
  ).catch((err) => {
    console.error('[ADMIN] Failed to send credit notification:', err);
  });

  return { user: updatedUser, transaction: fundingTx };
};

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
  const [totalUsers, totalWithdrawals, depositMethods] = await Promise.all([
    prisma.user.count(),
    prisma.withdrawal.count(),
    prisma.depositMethod.count(),
  ]);

  const users = await prisma.user.findMany({ select: { totalBalance: true } });
  const totalBalance = users.reduce((sum, u) => sum + u.totalBalance, 0);

  const recentWithdrawals = await prisma.withdrawal.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, accountNumber: true } },
    },
  });

  return {
    totalUsers,
    totalWithdrawals,
    totalBalance,
    depositMethods,
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