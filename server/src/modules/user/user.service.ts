import { prisma } from '../../config/database';

// ─── Dashboard Service ────────────────────────────────────────────────────────
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
      newLoans: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error('User not found.'), { statusCode: 404 });
  }

  // ─── Payment Today ──────────────────────────────────────────────────────────
  // Sum of all SUCCESSFUL withdrawals made today (midnight → now)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayResult = await prisma.withdrawal.aggregate({
    where: {
      userId,
      status: 'SUCCESSFUL',
      createdAt: { gte: startOfToday },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  const paymentToday = todayResult._sum.amount || 0;
  const paymentTodayCount = todayResult._count.id || 0;

  // ─── Total Expenses ─────────────────────────────────────────────────────────
  // Sum of ALL SUCCESSFUL withdrawals ever (this is the real running expense total)
  const expensesResult = await prisma.withdrawal.aggregate({
    where: { userId, status: 'SUCCESSFUL' },
    _sum: { amount: true },
  });

  const expenses = expensesResult._sum.amount || 0;

  // ─── Total Transactions Count ───────────────────────────────────────────────
  const transactionCount = await prisma.withdrawal.count({
    where: { userId },
  });

  // ─── Monthly Overview (last 6 months) ──────────────────────────────────────
  // Fetch all withdrawals in the last 6 months and group by month
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentWithdrawals = await prisma.withdrawal.findMany({
    where: {
      userId,
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      amount: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Build monthly map: { "Jan 2025": { spent: 0, count: 0 } }
  const monthlyMap: Record<string, { spent: number; count: number }> = {};

  // Pre-fill all 6 months with zeros so empty months still show
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyMap[key] = { spent: 0, count: 0 };
  }

  // Populate from actual transactions
  for (const tx of recentWithdrawals) {
    if (tx.status !== 'SUCCESSFUL') continue;
    const key = new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (monthlyMap[key]) {
      monthlyMap[key].spent += tx.amount;
      monthlyMap[key].count += 1;
    }
  }

  const monthlyOverview = Object.entries(monthlyMap).map(([month, data]) => ({
    month,
    spent: data.spent,
    count: data.count,
  }));

  // ─── Pending Count ──────────────────────────────────────────────────────────
  const pendingCount = await prisma.withdrawal.count({
    where: { userId, status: 'PENDING' },
  });

  return {
    ...user,
    expenses,
    paymentToday,
    paymentTodayCount,
    transactions: transactionCount,
    pendingTransactions: pendingCount,
    monthlyOverview,
    // Loan features not live yet — return stored values as-is
    loan: user.loan,
    newLoans: user.newLoans,
  };
};

// ─── User Info Service ────────────────────────────────────────────────────────
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

// ─── Get User By Account Number ───────────────────────────────────────────────
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

// ─── Update User Balance ──────────────────────────────────────────────────────
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