import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Wallet,
  Activity, BarChart2, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { api, getUser } from '../../lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface MonthlyEntry {
  month: string;
  spent: number;
  count: number;
}

interface DashboardData {
  fullName: string;
  accountNumber: string;
  accountType: string;
  currencyType: string;
  totalBalance: number;
  routingNumber: string;
  loan: number;
  newLoans: number;
  expenses: number;
  paymentToday: number;
  paymentTodayCount: number;
  transactions: number;
  pendingTransactions: number;
  monthlyOverview: MonthlyEntry[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', NGN: '₦', JPY: '¥', CAD: 'C$', AUD: 'A$',
  };
  return symbols[currency] || '$';
};

const fmt = (amount: number, currency = 'USD') =>
  `${getCurrencySymbol(currency)}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const greeting = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
})();

// ─── Component ─────────────────────────────────────────────────────────────────
const DashboardHome = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const user = getUser();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api<{ data: DashboardData }>('/api/users/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const currency = data?.currencyType || user?.currencyType || 'USD';

  // ─── Monthly Chart Calculations ──────────────────────────────────────────────
  const monthly = data?.monthlyOverview || [];
  const maxSpent = Math.max(...monthly.map(m => m.spent), 1); // avoid division by zero

  // ─── Stats Cards ─────────────────────────────────────────────────────────────
  const stats = [
    {
      label: 'Loan Balance',
      value: fmt(data?.loan || 0, currency),
      sub: 'No active loans',
      icon: CreditCard,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      trend: null,
    },
    {
      label: 'Total Expenses',
      value: fmt(data?.expenses || 0, currency),
      sub: `${data?.transactions || 0} total transactions`,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      trend: 'down',
    },
    {
      label: 'Paid Today',
      value: fmt(data?.paymentToday || 0, currency),
      sub: data?.paymentTodayCount
        ? `${data.paymentTodayCount} transaction${data.paymentTodayCount > 1 ? 's' : ''} today`
        : 'No payments today',
      icon: data?.paymentToday ? CheckCircle2 : Clock,
      color: data?.paymentToday ? 'text-green-600' : 'text-secondary-400',
      bg: data?.paymentToday ? 'bg-green-50' : 'bg-secondary-50',
      trend: data?.paymentToday ? 'up' : null,
    },
    {
      label: 'New Loans',
      value: fmt(data?.newLoans || 0, currency),
      sub: 'Feature coming soon',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: null,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Greeting ──────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-secondary-500 text-sm">{greeting},</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">
          {data?.fullName?.split(' ')[0] || 'User'} 👋
        </h2>
      </div>

      {/* ── Balance Card ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-linear-to-r from-primary-700 via-primary-600 to-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-primary-500/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full translate-y-30 -translate-x-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-200 text-sm font-medium mb-1">Total Balance</p>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {showBalance ? fmt(data?.totalBalance || 0, currency) : '••••••••'}
                </h3>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-primary-200 text-xs">Account</p>
              <p className="font-semibold tracking-wider">{data?.accountNumber}</p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Routing Number</p>
              <p className="font-semibold tracking-wider">{data?.routingNumber}</p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Type</p>
              <p className="font-semibold capitalize">{data?.accountType}</p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Currency</p>
              <p className="font-semibold">{data?.currencyType}</p>
            </div>
            <div>
              <p className="text-primary-200 text-xs">Transactions</p>
              <p className="font-semibold">{data?.transactions || 0}</p>
            </div>
            {(data?.pendingTransactions || 0) > 0 && (
              <div>
                <p className="text-primary-200 text-xs">Pending</p>
                <p className="font-semibold text-amber-300">{data?.pendingTransactions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 sm:p-5 border border-secondary-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
              {stat.trend === 'down' && <ArrowDownLeft className="w-4 h-4 text-red-500" />}
            </div>
            <p className="text-xs text-secondary-500 mb-1">{stat.label}</p>
            <p className="text-base sm:text-lg font-bold text-secondary-900 leading-tight">{stat.value}</p>
            <p className="text-[11px] text-secondary-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly Spending Chart — real data */}
        <div className="bg-white rounded-xl p-6 border border-secondary-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-secondary-900">Monthly Spending</h3>
              <p className="text-xs text-secondary-400 mt-0.5">Last 6 months of withdrawals</p>
            </div>
            <BarChart2 className="w-5 h-5 text-secondary-400" />
          </div>

          {monthly.every(m => m.spent === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="w-8 h-8 text-secondary-200 mb-2" />
              <p className="text-sm text-secondary-400">No spending data yet</p>
              <p className="text-xs text-secondary-300 mt-1">Your monthly chart will populate as you make transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthly.map((entry) => (
                <div key={entry.month}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-secondary-600">{entry.month}</span>
                    <div className="flex items-center gap-2">
                      {entry.count > 0 && (
                        <span className="text-xs text-secondary-400">{entry.count} tx</span>
                      )}
                      <span className="text-sm font-semibold text-secondary-900">
                        {entry.spent > 0 ? fmt(entry.spent, currency) : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700"
                      style={{ width: `${(entry.spent / maxSpent) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Summary — real data */}
        <div className="bg-white rounded-xl p-6 border border-secondary-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-secondary-900">Account Summary</h3>
              <p className="text-xs text-secondary-400 mt-0.5">Live figures from your account</p>
            </div>
            <DollarSign className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Balance</span>
              </div>
              <span className="font-bold text-green-600">{fmt(data?.totalBalance || 0, currency)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Total Expenses</span>
              </div>
              <span className="font-bold text-red-600">{fmt(data?.expenses || 0, currency)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Paid Today</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-amber-600">{fmt(data?.paymentToday || 0, currency)}</p>
                {(data?.paymentTodayCount || 0) > 0 && (
                  <p className="text-[11px] text-amber-400">{data?.paymentTodayCount} payment{(data?.paymentTodayCount || 0) > 1 ? 's' : ''}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Loan Balance</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">{fmt(data?.loan || 0, currency)}</p>
                <p className="text-[11px] text-orange-400">Coming soon</p>
              </div>
            </div>

            <div className="mt-2 p-3 bg-primary-50 rounded-xl text-center">
              <p className="text-xs text-secondary-500">Account Status</p>
              <p className="text-sm font-bold text-primary-700">✓ Active & Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;