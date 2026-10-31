import { useState, useEffect, useCallback } from 'react';
import {
  History, ArrowDownLeft, ArrowUpRight, Search,
  RefreshCw, Loader2, Calendar, Download,
  ChevronDown, SlidersHorizontal, TrendingUp, TrendingDown, Activity, Receipt
} from 'lucide-react';
import { api, getUser } from '../../lib/api';
import { maskAccount, type ReceiptData, type ReceiptParty, type ReceiptRow } from '../../lib/receipt';
import ReceiptModal from '../ReceiptModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type TxStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'DECLINED' | 'REVERSED';

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  withdrawalType: 'CRYPTO' | 'BANK' | 'DEPOSIT' | 'REVERSAL';
  status: TxStatus;
  details?: Record<string, unknown>;
  createdAt: string;
}

interface TransactionStats {
  total: number;
  totalOut: number;
  totalPending: number;
  totalFailed: number;
}

type FilterStatus = 'ALL' | TxStatus;
type FilterType = 'ALL' | 'CRYPTO' | 'BANK' | 'DEPOSIT' | 'REVERSAL';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : '');

// Customer-facing status names
const STATUS_LABEL: Record<TxStatus, string> = {
  SUCCESSFUL: 'Completed',
  PENDING: 'Processing',
  FAILED: 'Failed',
  DECLINED: 'Declined',
  REVERSED: 'Reversed',
};

const statusLabel = (status: string) => STATUS_LABEL[status as TxStatus] ?? status;

/** Money in: credits, incoming wires, and reversals that returned money */
const isCredit = (tx: Transaction) =>
  tx.withdrawalType === 'DEPOSIT' || (tx.withdrawalType === 'REVERSAL' && tx.details?.direction === 'CREDIT');

/** The transaction no longer affects the balance (amount shown struck through) */
const isInactive = (tx: Transaction) => tx.status === 'FAILED' || tx.status === 'DECLINED' || tx.status === 'REVERSED';

/** A transfer or withdrawal the customer sent */
const isOutgoingTransfer = (tx: Transaction) => tx.withdrawalType === 'BANK' || tx.withdrawalType === 'CRYPTO';

const CRYPTO_NAMES: Record<string, string> = {
  bitcoin: 'Bitcoin (BTC)',
  ethereum: 'Ethereum (ETH)',
  litecoin: 'Litecoin (LTC)',
  usdt: 'Tether (USDT)',
};

// Copy matches the settlement notes shown on each transfer screen
const BANK_TRANSFER_KINDS: Record<string, { title: string; type: string; note: string }> = {
  WIRE: { title: 'Wire Transfer', type: 'International wire transfer', note: 'International wire transfers typically settle within 3–5 business days.' },
  DOMESTIC: { title: 'Domestic Transfer', type: 'Domestic transfer', note: 'Domestic transfers typically settle within 1–2 business days.' },
  BANK_WITHDRAWAL: { title: 'Bank Withdrawal', type: 'Bank withdrawal', note: 'Bank withdrawals typically process within 1–3 business days.' },
};

const CRYPTO_NOTE = 'Crypto withdrawals are sent on-chain once processing is complete.';

const bankKind = (tx: Transaction) =>
  BANK_TRANSFER_KINDS[text(tx.details?.transferType)] ?? BANK_TRANSFER_KINDS.BANK_WITHDRAWAL;

const txTitle = (tx: Transaction) =>
  tx.withdrawalType === 'REVERSAL' ? (tx.details?.direction === 'CREDIT' ? 'Transfer Reversal' : 'Credit Reversal')
  : tx.details?.transferType === 'INCOMING_WIRE' ? 'Incoming Wire Transfer'
  : tx.withdrawalType === 'DEPOSIT' ? 'Account Credit'
  : tx.withdrawalType === 'CRYPTO' ? 'Crypto Withdrawal'
  : bankKind(tx).title;

/** One plain sentence explaining a status that isn't simply "completed" */
const outcomeNote = (tx: Transaction): string => {
  const credit = isCredit(tx);
  if (tx.status === 'PENDING' && isOutgoingTransfer(tx)) {
    return `This transaction is being processed. ${tx.withdrawalType === 'CRYPTO' ? CRYPTO_NOTE : bankKind(tx).note}`;
  }
  if (tx.status === 'DECLINED') return 'This transaction was declined. The full amount was returned to your Vaultix balance.';
  if (tx.status === 'REVERSED') {
    return credit
      ? 'This credit was reversed and the amount was deducted from your Vaultix balance.'
      : 'This transaction was reversed. The full amount was returned to your Vaultix balance.';
  }
  return '';
};

const statusMessage = (tx: Transaction) => text(tx.details?.statusMessage);

const receiptNote = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ') || undefined;

// Details shown in the expanded row: internal keys hidden, references labelled
const HIDDEN_DETAILS = new Set(['transferType', 'direction', 'statusMessage']);
const DETAIL_LABELS: Record<string, string> = {
  reversalId: 'Reversal reference',
  originalTransactionId: 'Original reference',
  reversedAt: 'Reversed on',
};

const detailEntries = (tx: Transaction): [string, string][] =>
  Object.entries(tx.details ?? {})
    .filter(([key, val]) => val && !HIDDEN_DETAILS.has(key))
    .map(([key, val]) => [
      DETAIL_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').trim(),
      key === 'reversedAt' ? `${formatDate(String(val))} · ${formatTime(String(val))}` : String(val),
    ]);

const buildReceipt = (tx: Transaction): ReceiptData => {
  const d = tx.details ?? {};
  const user = getUser() as { fullName?: string; accountNumber?: string; currencyType?: string } | null;
  const currency = text(d.currency) || user?.currencyType || 'USD';
  const you: ReceiptParty = {
    role: 'From',
    name: user?.fullName || 'Vaultix customer',
    lines: ['Vaultix Bank', user?.accountNumber ? `Account ${maskAccount(user.accountNumber)}` : ''].filter(Boolean),
  };
  const row = (label: string, value: unknown, mono = false): ReceiptRow => ({ label, value: text(value), mono });
  const account = (value: unknown) => (text(value) ? `Account ${maskAccount(text(value))}` : '');
  const message = statusMessage(tx) ? `Message from Vaultix: ${statusMessage(tx)}` : '';
  const reversalRow = row('Reversal reference', d.reversalId, true);
  const base = {
    amount: tx.amount,
    currency,
    status: tx.status,
    reference: tx.transactionId,
    date: new Date(tx.createdAt),
  };

  if (tx.withdrawalType === 'REVERSAL') {
    const credit = d.direction === 'CREDIT';
    return {
      ...base,
      title: credit ? 'Transfer Reversal' : 'Credit Reversal',
      amountLabel: credit ? 'Amount returned' : 'Amount reversed',
      parties: [{ ...you, role: credit ? 'Returned to' : 'Debited from' }],
      rows: [
        row('Transaction type', credit ? 'Transfer reversal' : 'Credit reversal'),
        row('Original reference', d.originalTransactionId, true),
        row('Currency', currency),
      ],
      note: receiptNote(
        credit
          ? 'The full amount of the original transaction was returned to your Vaultix balance.'
          : 'The full amount of the original credit was deducted from your Vaultix balance.',
        message
      ),
    };
  }

  if (d.transferType === 'INCOMING_WIRE') {
    return {
      ...base,
      title: 'Wire Transfer',
      amountLabel: 'Amount received',
      parties: [
        { role: 'From', name: text(d.sender) || 'Sender', lines: [text(d.senderBank), account(d.senderAccount)].filter(Boolean) },
        { ...you, role: 'To' },
      ],
      rows: [row('Transaction type', 'Incoming wire transfer'), row('Purpose', d.purpose), row('Currency', currency), reversalRow],
      note: receiptNote(
        {
          SUCCESSFUL: 'The funds have been credited to your Vaultix account.',
          PENDING: 'This wire is being processed. Your balance updates once it completes.',
          FAILED: 'This wire was not completed and your balance was not changed.',
          DECLINED: undefined,
          REVERSED: outcomeNote(tx),
        }[tx.status],
        message
      ),
    };
  }

  if (tx.withdrawalType === 'DEPOSIT') {
    return {
      ...base,
      title: 'Account Credit',
      amountLabel: 'Amount credited',
      parties: [{ ...you, role: 'Credited to' }],
      rows: [row('Transaction type', 'Account credit'), row('Description', d.description), row('Currency', currency), reversalRow],
      note: receiptNote(outcomeNote(tx), message),
    };
  }

  if (tx.withdrawalType === 'CRYPTO') {
    const asset = CRYPTO_NAMES[text(d.cryptoType)] || text(d.cryptoType);
    return {
      ...base,
      title: 'Crypto Withdrawal',
      amountLabel: 'Amount sent',
      parties: [you, { role: 'To', name: asset ? `${asset} wallet` : 'Crypto wallet', lines: [text(d.network)].filter(Boolean) }],
      rows: [
        row('Transaction type', 'Crypto withdrawal'),
        row('Asset', asset),
        row('Network', d.network),
        row('Wallet address', d.walletAddress, true),
        reversalRow,
      ],
      note: receiptNote(outcomeNote(tx), message),
    };
  }

  const kind = bankKind(tx);
  const place = [text(d.beneficiaryAddress), text(d.beneficiaryCity), text(d.beneficiaryCountry)].filter(Boolean).join(', ');

  return {
    ...base,
    title: kind.title,
    amountLabel: 'Amount sent',
    parties: [
      you,
      { role: 'To', name: text(d.beneficiaryName) || 'Beneficiary', lines: [text(d.bankName), account(d.accountNumber), place].filter(Boolean) },
    ],
    rows: [
      row('Transaction type', kind.type),
      row('SWIFT / BIC', d.swiftCode, true),
      row('Routing number', d.routingNumber, true),
      row('Narration', d.narration),
      row('Currency', currency),
      reversalRow,
    ],
    note: receiptNote(tx.status === 'SUCCESSFUL' ? kind.note : outcomeNote(tx), message),
  };
};

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
  DECLINED: 'bg-red-50 text-red-700 border border-red-200',
  REVERSED: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const statusDot: Record<string, string> = {
  SUCCESSFUL: 'bg-emerald-500',
  PENDING: 'bg-amber-400',
  FAILED: 'bg-red-500',
  DECLINED: 'bg-red-500',
  REVERSED: 'bg-slate-500',
};

const methodChip = (tx: Transaction) =>
  tx.withdrawalType === 'REVERSAL' ? { cls: 'bg-slate-100 text-slate-700', label: '↩ Reversal' }
  : tx.withdrawalType === 'DEPOSIT' ? { cls: 'bg-emerald-50 text-emerald-700', label: '💳 Deposit' }
  : tx.withdrawalType === 'CRYPTO' ? { cls: 'bg-orange-50 text-orange-700', label: '₿ CRYPTO' }
  : { cls: 'bg-blue-50 text-blue-700', label: '🏦 BANK' };

const amountText = (tx: Transaction) =>
  `${isCredit(tx) ? '+' : '-'}$${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const amountClass = (tx: Transaction) =>
  isInactive(tx) ? 'text-secondary-400 line-through' : isCredit(tx) ? 'text-emerald-600' : 'text-red-600';

// Icon tile: green for money in, then by status for money out
const iconTone = (tx: Transaction) =>
  isCredit(tx) ? { bg: 'bg-emerald-50', fg: 'text-emerald-600' }
  : isInactive(tx) ? { bg: 'bg-secondary-100', fg: 'text-secondary-400' }
  : tx.status === 'PENDING' ? { bg: 'bg-amber-50', fg: 'text-amber-500' }
  : { bg: 'bg-red-50', fg: 'text-red-500' };

/** Outcome sentence plus any message, shown above the details when expanded */
const StatusExplainer = ({ tx }: { tx: Transaction }) => {
  const note = outcomeNote(tx);
  const message = statusMessage(tx);
  if (!note && !message) return null;
  return (
    <div className="mb-4 space-y-2">
      {note && <p className="text-xs text-secondary-600">{note}</p>}
      {message && (
        <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-700 mb-1">Message from Vaultix</p>
          <p className="text-sm text-secondary-800 whitespace-pre-line">{message}</p>
        </div>
      )}
    </div>
  );
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
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const closeReceipt = useCallback(() => setReceipt(null), []);

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
    total: transactions.reduce((s, t) => (t.status === 'SUCCESSFUL' && isOutgoingTransfer(t)) ? s + t.amount : s, 0),
    totalOut: transactions.filter(t => t.status === 'SUCCESSFUL' && isOutgoingTransfer(t)).length,
    totalPending: transactions.filter(t => t.status === 'PENDING').length,
    totalFailed: transactions.filter(t => t.status === 'FAILED' || t.status === 'DECLINED').length,
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
          statusLabel(t.status).toLowerCase().includes(q) ||
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
            label: 'Completed',
            value: stats.totalOut,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Processing',
            value: stats.totalPending,
            icon: Activity,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Unsuccessful',
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
                {(['ALL', 'SUCCESSFUL', 'PENDING', 'DECLINED', 'FAILED', 'REVERSED'] as FilterStatus[]).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'}`}>
                    {s === 'ALL' ? 'All' : statusLabel(s)}
                  </button>
                ))}
              </div>

              {/* Type */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary-400 font-medium mr-1">Type:</span>
                {(['ALL', 'CRYPTO', 'BANK', 'DEPOSIT', 'REVERSAL'] as FilterType[]).map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === t ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100'}`}>
                    {t === 'ALL' ? 'All' : t === 'CRYPTO' ? '₿ Crypto' : t === 'BANK' ? '🏦 Bank' : t === 'DEPOSIT' ? '💳 Deposit' : '↩ Reversal'}
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
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconTone(tx).bg}`}>
                          {isCredit(tx)
                            ? <ArrowDownLeft className={`w-4 h-4 ${iconTone(tx).fg}`} />
                            : <ArrowUpRight className={`w-4 h-4 ${iconTone(tx).fg}`} />}
                        </div>
                      </div>

                      {/* Transaction Info */}
                      <div className="col-span-3">
                        <p className="text-sm font-semibold text-secondary-900">
                          {txTitle(tx)}
                        </p>
                        <p className="text-xs text-secondary-400 font-mono mt-0.5">{tx.transactionId}</p>
                      </div>

                      {/* Method */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${methodChip(tx).cls}`}>
                          {methodChip(tx).label}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <p className="text-sm text-secondary-700">{formatDate(tx.createdAt)}</p>
                        <p className="text-xs text-secondary-400">{formatTime(tx.createdAt)}</p>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 text-right">
                        <p className={`text-sm font-bold tabular-nums ${amountClass(tx)}`}>{amountText(tx)}</p>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyles[tx.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[tx.status]}`} />
                          {statusLabel(tx.status)}
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
                        <StatusExplainer tx={tx} />
                        <div className="flex flex-wrap gap-4 text-sm">
                          {detailEntries(tx).map(([label, val]) => (
                            <div key={label} className="min-w-35">
                              <p className="text-xs text-secondary-400 capitalize mb-0.5">{label}</p>
                              <p className="font-medium text-secondary-800 font-mono text-xs break-all">{val}</p>
                            </div>
                          ))}
                          {detailEntries(tx).length === 0 && (
                            <p className="text-xs text-secondary-400">No additional details available.</p>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-secondary-200/70 flex items-center justify-between gap-4">
                          <p className="text-xs text-secondary-400">Download or share a receipt for this transaction.</p>
                          <button
                            onClick={() => setReceipt(buildReceipt(tx))}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shrink-0"
                          >
                            <Receipt className="w-4 h-4" />
                            View Receipt
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mobile Row */}
                    <div
                      className="lg:hidden flex items-center gap-3 px-4 py-4 border-b border-secondary-50 hover:bg-secondary-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconTone(tx).bg}`}>
                        {isCredit(tx)
                          ? <ArrowDownLeft className={`w-5 h-5 ${iconTone(tx).fg}`} />
                          : <ArrowUpRight className={`w-5 h-5 ${iconTone(tx).fg}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-secondary-900 truncate">
                            {txTitle(tx)}
                          </p>
                          <p className={`text-sm font-bold tabular-nums shrink-0 ${amountClass(tx)}`}>{amountText(tx)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-xs text-secondary-400 font-mono truncate">{tx.transactionId}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${statusStyles[tx.status]}`}>
                            <span className={`w-1 h-1 rounded-full ${statusDot[tx.status]}`} />
                            {statusLabel(tx.status)}
                          </span>
                        </div>
                        <p className="text-xs text-secondary-400 mt-0.5">{formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-secondary-300 shrink-0 transition-transform ${expandedTx === tx.id ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Mobile Expanded Details */}
                    {expandedTx === tx.id && (
                      <div className="lg:hidden px-4 pb-4 pt-2 bg-secondary-50/60 border-b border-secondary-100">
                        <StatusExplainer tx={tx} />
                        {detailEntries(tx).length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {detailEntries(tx).map(([label, val]) => (
                              <div key={label} className="bg-white rounded-lg p-2.5 border border-secondary-100">
                                <p className="text-[10px] text-secondary-400 capitalize mb-0.5">{label}</p>
                                <p className="text-xs font-medium text-secondary-700 break-all">{val}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => setReceipt(buildReceipt(tx))}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                        >
                          <Receipt className="w-4 h-4" />
                          View Receipt
                        </button>
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
                  {transactions.filter(isCredit).length} credit{transactions.filter(isCredit).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {receipt && <ReceiptModal data={receipt} onClose={closeReceipt} />}
    </div>
  );
};

export default TransactionHistory;