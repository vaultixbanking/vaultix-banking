import { useState, useEffect, useCallback } from 'react';
import {
  History, ArrowDownLeft, ArrowUpRight, Search,
  RefreshCw, Loader2, Calendar, Download,
  ChevronDown, SlidersHorizontal, TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { api } from '../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  withdrawalType: 'CRYPTO' | 'BANK' | 'DEPOSIT';
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  details?: Record<string, unknown>;
  createdAt: string;
}

interface TransactionStats {
  total: number;
  totalOut: number;
  totalPending: number;
  totalFailed: number;
}

type FilterStatus = 'ALL' | 'SUCCESSFUL' | 'PENDING' | 'FAILED';
type FilterType = 'ALL' | 'CRYPTO' | 'BANK' | 'DEPOSIT';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const getDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return formatDate(dateStr);
};

const groupByDate = (txs: Transaction[]): Record<string, Transaction[]> => {
  return txs.reduce((acc, tx) => {
    const label = getDateLabel(tx.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
};

const statusStyles: Record<string, string> = {
  SUCCESSFUL: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  FAILED: 'bg-red-50 text-red-700 border border-red-200',
};

const statusDot: Record<string, string> = {
  SUCCESSFUL: 'bg-emerald-500',
  PENDING: 'bg-amber-400',
  FAILED: 'bg-red-500',
};

// ─── Component ───────────────────────────────────────────────────────────────
const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (showRefresh = false) => {
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
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats: TransactionStats = {
    total: transactions.reduce((s, t) => (t.status === 'SUCCESSFUL' && t.withdrawalType !== 'DEPOSIT') ? s + t.amount : s, 0),
    totalOut: transactions.filter(t => t.status === 'SUCCESSFUL' && t.withdrawalType !== 'DEPOSIT').length,
    totalPending: transactions.filter(t => t.status === 'PENDING').length,
    totalFailed: transactions.filter(t => t.status === 'FAILED').length,
  };

  // ─── Filter + Sort ────────────────────────────────────────────────────────
  const processed = transactions
    .filter(t => {
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
      if (filterType !== 'ALL' && t.withdrawalType !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.transactionId?.toLowerCase().includes(q) ||
          t.withdrawalType?.toLowerCase().includes(q) ||
          t.status?.toLowerCase().includes(q) ||
          t.amount?.toString().includes(q) ||
          JSON.stringify(t.details || {}).toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === 'highest') return b.amount - a.amount;
      return a.amount - b.amount;
    });

  const grouped = groupByDate(processed);
  const groupKeys = Object.keys(grouped);

  const activeFilterCount = [filterStatus !== 'ALL', filterType !== 'ALL', sortOrder !== 'newest'].filter(Boolean).length;

  return (
    <div className="w-full space-y-5">

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Withdrawn',
            value: `$${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: TrendingDown,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
          {
            label: 'Successful',
            value: stats.totalOut,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Pending',
            value: stats.totalPending,
            icon: Activity,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Failed',
            value: stats.totalFailed,
            icon: RefreshCw,
            color: 'text-red-500',
            bg: 'bg-red-50',
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-secondary-500 font-medium">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-secondary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-secondary-900">Transaction History</h2>
              <p className="text-xs text-secondary-500">
                {processed.length} of {transactions.length} transactions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTransactions(true)}
              disabled={refreshing}
              title="Refresh"
              className="p-2.5 rounded-xl border border-secondary-200 hover:bg-secondary-50 transition-colors text-secondary-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              title="Export CSV"
              className="p-2.5 rounded-xl border border-secondary-200 hover:bg-secondary-50 transition-colors text-secondary-500"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="px-6 py-4 border-b border-secondary-100 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, type, amount, or details..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-secondary-50/50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-secondary-200 text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-1">
              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary-400 font-medium mr-1">Status:</span>
                {(['ALL', 'SUCCESSFUL', 'PENDING', 'FAILED'] as FilterStatus[]).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'}`}>
                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Type */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary-400 font-medium mr-1">Type:</span>
                {(['ALL', 'CRYPTO', 'BANK', 'DEPOSIT'] as FilterType[]).map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === t ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'}`}>
                    {t === 'ALL' ? 'All' : t === 'CRYPTO' ? '₿ Crypto' : t === 'BANK' ? '🏦 Bank' : '💳 Deposit'}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary-400 font-medium mr-1">Sort:</span>
                {([
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'highest', label: 'Highest' },
                  { value: 'lowest', label: 'Lowest' },
                ] as { value: SortOrder; label: string }[]).map(s => (
                  <button key={s.value} onClick={() => setSortOrder(s.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortOrder === s.value ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {activeFilterCount > 0 && (
                <button onClick={() => { setFilterStatus('ALL'); setFilterType('ALL'); setSortOrder('newest'); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all">
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
            <p className="text-sm text-secondary-400">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-secondary-700 font-medium mb-1">Failed to load transactions</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => fetchTransactions()}
              className="px-5 py-2 bg-primary-600 text-white text-sm rounded-xl font-medium hover:bg-primary-700 transition-colors">
              Try Again
            </button>
          </div>
        ) : processed.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-14 h-14 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-secondary-300" />
            </div>
            <p className="text-secondary-700 font-semibold mb-1">No transactions found</p>
            <p className="text-sm text-secondary-400">
              {search || filterStatus !== 'ALL' || filterType !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Your transactions will appear here once you make one'}
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table Head */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-secondary-50/70 text-[11px] font-semibold text-secondary-400 uppercase tracking-widest border-b border-secondary-100">
              <div className="col-span-1" />
              <div className="col-span-3">Transaction</div>
              <div className="col-span-2">Method</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Details</div>
            </div>

            {/* Grouped Rows */}
            {groupKeys.map(group => (
              <div key={group}>
                {/* Date Group Label */}
                <div className="px-6 py-2 bg-secondary-50/40 border-y border-secondary-100/60">
                  <span className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">{group}</span>
                </div>

                {grouped[group].map(tx => (
                  <div key={tx.id}>
                    {/* Desktop Row */}
                    <div
                      className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-secondary-50/50 transition-colors border-b border-secondary-50 cursor-pointer group"
                      onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                    >
                      {/* Icon */}
                      <div className="col-span-1">
                        {tx.withdrawalType === 'DEPOSIT' ? (
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50">
                            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.status === 'SUCCESSFUL' ? 'bg-red-50' : tx.status === 'FAILED' ? 'bg-secondary-100' : 'bg-amber-50'}`}>
                            <ArrowUpRight className={`w-4 h-4 ${tx.status === 'SUCCESSFUL' ? 'text-red-500' : tx.status === 'FAILED' ? 'text-secondary-400' : 'text-amber-500'}`} />
                          </div>
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div className="col-span-3">
                        <p className="text-sm font-semibold text-secondary-900">
                          {tx.withdrawalType === 'DEPOSIT' ? 'Account Credit' : tx.withdrawalType === 'CRYPTO' ? 'Crypto Withdrawal' : 'Bank Withdrawal'}
                        </p>
                        <p className="text-xs text-secondary-400 font-mono mt-0.5">{tx.transactionId}</p>
                      </div>

                      {/* Method */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          tx.withdrawalType === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-700'
                          : tx.withdrawalType === 'CRYPTO' ? 'bg-orange-50 text-orange-700'
                          : 'bg-blue-50 text-blue-700'
                        }`}>
                          {tx.withdrawalType === 'DEPOSIT' ? '💳' : tx.withdrawalType === 'CRYPTO' ? '₿' : '🏦'}{' '}
                          {tx.withdrawalType === 'DEPOSIT' ? 'Deposit' : tx.withdrawalType}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <p className="text-sm text-secondary-700">{formatDate(tx.createdAt)}</p>
                        <p className="text-xs text-secondary-400">{formatTime(tx.createdAt)}</p>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 text-right">
                        {tx.withdrawalType === 'DEPOSIT' ? (
                          <p className="text-sm font-bold tabular-nums text-emerald-600">
                            +${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        ) : (
                          <p className={`text-sm font-bold tabular-nums ${tx.status === 'FAILED' ? 'text-secondary-400 line-through' : 'text-red-600'}`}>
                            -${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-1 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[tx.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[tx.status]}`} />
                          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                        </span>
                      </div>

                      {/* Expand Arrow */}
                      <div className="col-span-1 text-right">
                        <ChevronDown className={`w-4 h-4 text-secondary-300 group-hover:text-secondary-500 transition-all ml-auto ${expandedTx === tx.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Desktop Expanded Details */}
                    {expandedTx === tx.id && (
                      <div className="hidden lg:block px-6 py-4 bg-secondary-50/60 border-b border-secondary-100">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {tx.details && Object.entries(tx.details).map(([key, val]) =>
                            val ? (
                              <div key={key} className="min-w-35">
                                <p className="text-xs text-secondary-400 capitalize mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="font-medium text-secondary-800 font-mono text-xs break-all">{String(val)}</p>
                              </div>
                            ) : null
                          )}
                          {!tx.details || Object.keys(tx.details).length === 0 && (
                            <p className="text-xs text-secondary-400">No additional details available.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mobile Row */}
                    <div
                      className="lg:hidden flex items-center gap-3 px-4 py-4 border-b border-secondary-50 hover:bg-secondary-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                    >
                      {tx.withdrawalType === 'DEPOSIT' ? (
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50">
                          <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                        </div>
                      ) : (
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tx.status === 'SUCCESSFUL' ? 'bg-red-50' : tx.status === 'FAILED' ? 'bg-secondary-100' : 'bg-amber-50'}`}>
                          <ArrowUpRight className={`w-5 h-5 ${tx.status === 'SUCCESSFUL' ? 'text-red-500' : tx.status === 'FAILED' ? 'text-secondary-400' : 'text-amber-500'}`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-secondary-900 truncate">
                            {tx.withdrawalType === 'DEPOSIT' ? 'Account Credit' : tx.withdrawalType === 'CRYPTO' ? 'Crypto Withdrawal' : 'Bank Withdrawal'}
                          </p>
                          {tx.withdrawalType === 'DEPOSIT' ? (
                            <p className="text-sm font-bold tabular-nums shrink-0 text-emerald-600">
                              +${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          ) : (
                            <p className={`text-sm font-bold tabular-nums shrink-0 ${tx.status === 'FAILED' ? 'text-secondary-400 line-through' : 'text-red-600'}`}>
                              -${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-xs text-secondary-400 font-mono truncate">{tx.transactionId}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${statusStyles[tx.status]}`}>
                            <span className={`w-1 h-1 rounded-full ${statusDot[tx.status]}`} />
                            {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-secondary-400 mt-0.5">{formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-secondary-300 shrink-0 transition-transform ${expandedTx === tx.id ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Mobile Expanded Details */}
                    {expandedTx === tx.id && tx.details && (
                      <div className="lg:hidden px-4 pb-4 pt-2 bg-secondary-50/60 border-b border-secondary-100">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(tx.details).map(([key, val]) =>
                            val ? (
                              <div key={key} className="bg-white rounded-lg p-2.5 border border-secondary-100">
                                <p className="text-[10px] text-secondary-400 capitalize mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-xs font-medium text-secondary-700 break-all">{String(val)}</p>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-secondary-100 bg-secondary-50/30">
              <p className="text-xs text-secondary-400">
                Showing <span className="font-semibold text-secondary-600">{processed.length}</span> transaction{processed.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-1.5">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-secondary-400">
                  {transactions.filter(t => t.withdrawalType === 'DEPOSIT').length} credit{transactions.filter(t => t.withdrawalType === 'DEPOSIT').length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;