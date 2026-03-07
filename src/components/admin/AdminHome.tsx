import { useState, useEffect } from 'react';
import { Users, ArrowRightLeft, DollarSign, Wallet, TrendingUp, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface Stats {
  totalUsers: number;
  totalWithdrawals: number;
  totalBalance: number;
  depositMethods: number;
  recentWithdrawals: {
    id: string;
    transactionId: string;
    amount: number;
    withdrawalType: string;
    status: string;
    createdAt: string;
    user: { fullName: string; accountNumber: string };
  }[];
}

const AdminHome = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi<{ success: boolean; data: Stats }>('/api/admin/stats');
        setStats(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: <Users className="w-5 h-5" />, color: 'bg-primary-50 text-primary-600', trend: '+12%' },
    { label: 'Total Withdrawals', value: stats?.totalWithdrawals ?? 0, icon: <ArrowRightLeft className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600', trend: '+5%' },
    { label: 'Platform Balance', value: `$${(stats?.totalBalance ?? 0).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'bg-green-50 text-green-600', trend: '+8%' },
    { label: 'Deposit Methods', value: stats?.depositMethods ?? 0, icon: <Wallet className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600', trend: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              {card.trend && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Withdrawals */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Withdrawals</h3>
          <p className="text-xs text-slate-500">Latest withdrawal transactions across the platform</p>
        </div>

        {!stats?.recentWithdrawals?.length ? (
          <div className="text-center py-12 text-slate-400">No withdrawals yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3">Transaction ID</th>
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-right px-6 py-3">Amount</th>
                  <th className="text-center px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentWithdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-900">{w.user.fullName}</p>
                      <p className="text-xs text-slate-400">{w.user.accountNumber}</p>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">{w.transactionId}</td>
                    <td className="px-6 py-3 capitalize text-slate-600">{w.withdrawalType}</td>
                    <td className="px-6 py-3 text-right font-semibold text-red-600">-${w.amount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        w.status === 'SUCCESSFUL' ? 'bg-green-100 text-green-700' :
                        w.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{w.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-slate-500">
                      {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
