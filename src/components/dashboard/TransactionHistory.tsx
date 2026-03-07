import { useState, useEffect } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, Filter, Search, RefreshCw, Loader2, Calendar, Download } from 'lucide-react';
import { api } from '../../lib/api';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

type FilterType = 'all' | 'withdrawal' | 'deposit' | 'transfer';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await api<{ success: boolean; data: Transaction[] }>('/api/transactions/history');
      setTransactions(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const filtered = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'withdrawal': case 'wire': case 'domestic': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      default: return <ArrowUpRight className="w-4 h-4 text-secondary-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700',
      processing: 'bg-blue-100 text-blue-700',
    };
    return styles[status.toLowerCase()] || 'bg-secondary-100 text-secondary-700';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header + Actions */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-secondary-900">Transaction History</h2>
              <p className="text-xs text-secondary-500">{transactions.length} total transactions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => fetchTransactions(true)} disabled={refreshing} className="p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors text-secondary-500">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 rounded-lg border border-secondary-200 hover:bg-secondary-50 transition-colors text-secondary-500" title="Export">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-secondary-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2 text-sm border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-400 shrink-0" />
            {(['all', 'withdrawal', 'deposit', 'transfer'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-secondary-100">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-16 px-6">
              <p className="text-red-500 mb-2">{error}</p>
              <button onClick={() => fetchTransactions()} className="text-sm text-primary-600 hover:text-primary-700 font-medium">Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Calendar className="w-10 h-10 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500 font-medium">No transactions found</p>
              <p className="text-xs text-secondary-400 mt-1">{search || filter !== 'all' ? 'Try adjusting your filters' : 'Your transactions will appear here'}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary-50 text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <div className="col-span-1">Type</div>
                <div className="col-span-3">Details</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">ID</div>
              </div>

              {filtered.map(tx => (
                <div key={tx.id} className="px-6 py-4 hover:bg-secondary-50/50 transition-colors">
                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <div className="w-8 h-8 rounded-full bg-secondary-50 flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-secondary-900 capitalize">{tx.type}</p>
                      {tx.details && typeof tx.details === 'object' && (
                        <p className="text-xs text-secondary-400 truncate">
                          {Object.values(tx.details).filter(v => typeof v === 'string').slice(0, 2).join(' • ')}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-secondary-700">{formatDate(tx.createdAt)}</p>
                      <p className="text-xs text-secondary-400">{formatTime(tx.createdAt)}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className={`text-sm font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-mono text-secondary-400">{tx.id.slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="sm:hidden flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center shrink-0">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-secondary-900 capitalize">{tx.type}</p>
                        <p className={`text-sm font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-secondary-400">{formatDate(tx.createdAt)}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
