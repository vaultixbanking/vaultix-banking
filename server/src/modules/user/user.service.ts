import { prisma } from '../../config/database';

export const getUserDashboardService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      fullName: true,
      accountNumber: true,
      accountType: true,
      currencyType: true,
      totalBalance: true,
      loan: true,
      expenses: true,
      paymentToday: true,
      newLoans: true,
      transactions: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return user;
};

export const getUserInfoService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      accountNumber: true,
      emailAddress: true,
      fullName: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return user;
};

export const getUserByAccountNumberService = async (accountNumber: string) => {
  const user = await prisma.user.findUnique({
    where: { accountNumber },
    select: {
      fullName: true,
      emailAddress: true,
      totalBalance: true,
      loan: true,
      expenses: true,
      paymentToday: true,
      newLoans: true,
      transactions: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  return user;
};

export const updateUserBalanceService = async (
  accountNumber: string,
  updates: {
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
      totalBalance: updates.totalBalance ?? user.totalBalance,
      loan: updates.loan ?? user.loan,
      expenses: updates.expenses ?? user.expenses,
      paymentToday: updates.paymentToday ?? user.paymentToday,
      newLoans: updates.newLoans ?? user.newLoans,
      transactions: updates.transactions ?? user.transactions,
    },
    select: {
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