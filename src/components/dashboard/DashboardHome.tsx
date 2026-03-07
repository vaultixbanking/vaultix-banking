import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Wallet,
  Activity, PieChart as PieChartIcon
} from 'lucide-react';
import { api, getUser } from '../../lib/api';

interface DashboardData {
  fullName: string;
  accountNumber: string;
  accountType: string;
  currencyType: string;
  totalBalance: number;
  loan: number;
  expenses: number;
  paymentToday: number;
  newLoans: number;
  transactions: number;
}

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

  const formatCurrency = (amount: number) => {
    const currency = data?.currencyType || user?.currencyType || 'USD';
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', JPY: '¥', CAD: 'C$', AUD: 'A$' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Loan Balance', value: data?.loan || 0, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'neutral' as const },
    { label: 'Expenses', value: data?.expenses || 0, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', trend: 'down' as const },
    { label: 'Payments Today', value: data?.paymentToday || 0, icon: Activity, color: 'text-green-600', bg: 'bg-green-50', trend: 'up' as const },
    { label: 'New Loans', value: data?.newLoans || 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'neutral' as const },
  ];

  const chartBars = [
    { label: 'Income', percent: 70, color: 'from-green-400 to-green-600' },
    { label: 'Expenses', percent: Math.min(((data?.expenses || 0) / Math.max(data?.totalBalance || 1, 1)) * 100, 100), color: 'from-red-400 to-red-600' },
    { label: 'Savings', percent: 85, color: 'from-primary-400 to-primary-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-secondary-500 text-sm">{greeting},</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900">
          {data?.fullName?.split(' ')[0] || 'User'} 👋
        </h2>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-primary-500/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full translate-y-30 -translate-x-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-200 text-sm font-medium mb-1">Total Balance</p>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {showBalance ? formatCurrency(data?.totalBalance || 0) : '••••••••'}
                </h3>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
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
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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
            <p className="text-lg font-bold text-secondary-900">{formatCurrency(stat.value)}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="bg-white rounded-xl p-6 border border-secondary-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-secondary-900">Monthly Overview</h3>
            <PieChartIcon className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="space-y-4">
            {chartBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-secondary-600">{bar.label}</span>
                  <span className="text-sm font-semibold text-secondary-900">{Math.round(bar.percent)}%</span>
                </div>
                <div className="h-3 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${bar.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl p-6 border border-secondary-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-secondary-900">Account Summary</h3>
            <DollarSign className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Balance</span>
              </div>
              <span className="font-bold text-green-600">{formatCurrency(data?.totalBalance || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Expenses</span>
              </div>
              <span className="font-bold text-red-600">{formatCurrency(data?.expenses || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Loan</span>
              </div>
              <span className="font-bold text-orange-600">{formatCurrency(data?.loan || 0)}</span>
            </div>
            <div className="mt-4 p-3 bg-primary-50 rounded-xl text-center">
              <p className="text-xs text-secondary-500">Account Status</p>
              <p className="text-sm font-bold text-primary-700">✓ Active & On Track</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
