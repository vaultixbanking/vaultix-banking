import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { generateToken } from '../../utils/jwt';

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

export const updateUserBLCService = async (
  accountNumber: string,
  data: {
    totalBalance?: number;
    loan?: number;
    expenses?: number;
    paymentToday?: number;
    newLoans?: number;
    transactions?: number;
  }
) => {
  const user = await prisma.user.findUnique({ where: { accountNumber } });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  const updated = await prisma.user.update({
    where: { accountNumber },
    data: {
      totalBalance: data.totalBalance ?? user.totalBalance,
      loan: data.loan ?? user.loan,
      expenses: data.expenses ?? user.expenses,
      paymentToday: data.paymentToday ?? user.paymentToday,
      newLoans: data.newLoans ?? user.newLoans,
      transactions: data.transactions ?? user.transactions,
    },
    select: {
      accountNumber: true,
      fullName: true,
      totalBalance: true,
      loan: true,
      expenses: true,
      paymentToday: true,
      newLoans: true,
      transactions: true,
    },
  });

  return updated;
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