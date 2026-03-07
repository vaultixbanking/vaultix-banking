import { useState, useEffect } from 'react';
import { ArrowUpDown, Search, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface Transaction {
  id: string;
  transactionId: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  user: {
    fullName: string;
    accountNumber: string;
  };
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi<{ success: boolean; data: Transaction[] }>('/api/admin/transactions');
        setTransactions(res.data);
      } catch { /* empty */ } finally { setLoading(false); }
    })();
  }, []);

  const filtered = transactions.filter(t => {
    const matchSearch = search === '' ||
      t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      t.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.user.accountNumber.includes(search);
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  const types = ['all', ...new Set(transactions.map(t => t.type))];

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'failed': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Transactions</h3>
              <p className="text-xs text-slate-500">{transactions.length} total transactions</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full sm:w-52 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent capitalize">
              {types.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No transactions found</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3">Transaction</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs text-slate-700">{tx.transactionId}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{tx.description || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{tx.user.fullName}</p>
                      <p className="text-xs text-slate-400 font-mono">{tx.user.accountNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium capitalize">
                        {tx.type.includes('deposit') || tx.type.includes('credit')
                          ? <ArrowDownLeft className="w-3 h-3 text-green-500" />
                          : <ArrowUpRight className="w-3 h-3 text-red-500" />}
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
