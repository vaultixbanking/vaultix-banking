import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpDown, Search, Loader2, ArrowUpRight, ArrowDownLeft, RefreshCw, X,
  CheckCircle2, XCircle, Undo2, AlertCircle, ShieldCheck, Inbox, ChevronRight,
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import TransactionActionModal, { type ActionKind } from './TransactionActionModal';
import {
  fmtMoney, fmtDateTime, statusMeta, SOURCE_LABEL, canReverse, isPending,
  type HubRow, type HubCounts, type HubSource, type HubTab,
} from './transactionHub';

interface Props {
  /** Called after anything that may change the number of pending transfers */
  onPendingChange?: () => void;
}

const TABS: { id: HubTab; label: string }[] = [
  { id: 'PENDING', label: 'Pending review' },
  { id: 'ALL', label: 'All' },
  { id: 'SUCCESSFUL', label: 'Completed' },
  { id: 'UNSUCCESSFUL', label: 'Declined / Failed' },
  { id: 'REVERSED', label: 'Reversed' },
];

const SOURCES: { id: 'ALL' | HubSource; label: string }[] = [
  { id: 'ALL', label: 'All sources' },
  { id: 'TRANSFER', label: 'Customer transfers' },
  { id: 'FUNDING', label: 'Account funding' },
  { id: 'WIRE', label: 'Admin wires' },
];

const EMPTY_COUNTS: HubCounts = { ALL: 0, PENDING: 0, SUCCESSFUL: 0, UNSUCCESSFUL: 0, REVERSED: 0 };

const StatusBadge = ({ status }: { status: string }) => {
  const meta = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${meta.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const ReviewPill = () => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
    <ShieldCheck className="w-3 h-3" /> Review
  </span>
);

/** Row action buttons: approve/decline pending items, reverse completed ones */
const RowActions = ({ row, onAction }: { row: HubRow; onAction: (kind: ActionKind, row: HubRow) => void }) => {
  const stop = (kind: ActionKind) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(kind, row);
  };
  if (isPending(row)) {
    const transfer = row.source === 'TRANSFER';
    return (
      <div className="flex items-center gap-2">
        <button onClick={stop(transfer ? 'approve' : 'complete')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> {transfer ? 'Approve' : 'Complete'}
        </button>
        <button onClick={stop(transfer ? 'decline' : 'fail')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50">
          <XCircle className="w-3.5 h-3.5" /> {transfer ? 'Decline' : 'Fail'}
        </button>
      </div>
    );
  }
  if (canReverse(row)) {
    return (
      <button onClick={stop('reverse')}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50">
        <Undo2 className="w-3.5 h-3.5" /> Reverse
      </button>
    );
  }
  return null;
};

const Party = ({ role, party }: { role: string; party: HubRow['from'] }) => (
  <div className="rounded-xl border border-slate-200 p-3">
    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{role}</p>
    <p className="text-sm font-semibold text-slate-900 mt-1 break-words">{party.name}</p>
    {party.lines.map(line => <p key={line} className="text-xs text-slate-500 break-all">{line}</p>)}
  </div>
);

const InfoRow = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="text-xs text-slate-500 shrink-0">{label}</span>
    <span className={`text-sm text-slate-900 text-right break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
  </div>
);

// ─── Detail drawer ───────────────────────────────────────────────────────────
const DetailDrawer = ({
  row, onClose, onAction, onToggleReview, reviewSaving,
}: {
  row: HubRow;
  onClose: () => void;
  onAction: (kind: ActionKind, row: HubRow) => void;
  onToggleReview: (row: HubRow) => void;
  reviewSaving: boolean;
}) => {
  const money = (n: number) => fmtMoney(n, row.currency);
  const r = row.reversal;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <aside className="relative w-full sm:max-w-md h-full bg-white shadow-xl overflow-y-auto" role="dialog" aria-modal="true" aria-label="Transaction details">
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">{SOURCE_LABEL[row.source]} · {row.kind}</p>
            <p className="font-mono text-xs text-slate-700 truncate">{row.transactionId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="text-center">
            <p className={`text-3xl font-bold tabular-nums ${row.status === 'SUCCESSFUL' ? 'text-slate-900' : 'text-slate-500'}`}>
              {row.flow === 'IN' ? '+' : '-'}{money(row.amount)}
            </p>
            <div className="mt-2"><StatusBadge status={row.status} /></div>
          </div>

          <div className="flex justify-center"><RowActions row={row} onAction={onAction} /></div>

          {row.customer && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{row.customer.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{row.customer.accountNumber}</p>
                  <p className="text-xs text-slate-500 truncate">{row.customer.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Balance</p>
                  <p className="text-sm font-bold text-slate-900">{fmtMoney(row.customer.balance, row.customer.currency)}</p>
                </div>
              </div>
              <label className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-3 cursor-pointer">
                <span>
                  <span className="block text-sm font-medium text-slate-800">Review this customer's transfers</span>
                  <span className="block text-xs text-slate-500">
                    {row.customer.reviewRequired ? 'New transfers wait in Pending review.' : 'New transfers complete instantly.'}
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.customer.reviewRequired}
                  disabled={reviewSaving}
                  onClick={() => onToggleReview(row)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${row.customer.reviewRequired ? 'bg-amber-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${row.customer.reviewRequired ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <Party role="From" party={row.from} />
            <Party role="To" party={row.to} />
          </div>

          <div className="divide-y divide-slate-100">
            <InfoRow label="Created" value={fmtDateTime(row.createdAt)} />
            {row.processedAt && <InfoRow label="Processed" value={fmtDateTime(row.processedAt)} />}
            {row.description && <InfoRow label={row.source === 'WIRE' ? 'Purpose' : row.source === 'FUNDING' ? 'Description' : 'Narration'} value={row.description} />}
            {row.customerMessage && <InfoRow label="Message to customer" value={row.customerMessage} />}
            {row.adminNote && <InfoRow label="Internal note" value={row.adminNote} />}
          </div>

          {r && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 mb-1">
                <Undo2 className="w-4 h-4 text-slate-500" /> Reversal
              </p>
              <div className="divide-y divide-slate-100">
                <InfoRow label="Reference" value={r.reversalId} mono />
                <InfoRow label="Reversed" value={fmtDateTime(r.createdAt)} />
                <InfoRow
                  label="Effect"
                  value={r.direction === 'CREDIT' ? `${money(r.amount)} returned to customer` : r.direction === 'DEBIT' ? `${money(r.amount)} taken back` : 'No balance change'}
                />
                {r.balanceBefore != null && r.balanceAfter != null && (
                  <InfoRow label="Balance" value={`${money(r.balanceBefore)} → ${money(r.balanceAfter)}`} />
                )}
                <InfoRow label="Email sent" value={r.notifyCustomer ? 'Yes' : 'No (silent)'} />
                {r.customerMessage && <InfoRow label="Message to customer" value={r.customerMessage} />}
                {r.adminNote && <InfoRow label="Internal note" value={r.adminNote} />}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

// ─── Hub ─────────────────────────────────────────────────────────────────────
const AdminTransactions = ({ onPendingChange }: Props) => {
  const [tab, setTab] = useState<HubTab>('PENDING');
  const [source, setSource] = useState<'ALL' | HubSource>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<HubRow[]>([]);
  const [counts, setCounts] = useState<HubCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [selected, setSelected] = useState<HubRow | null>(null);
  const [action, setAction] = useState<{ kind: ActionKind; row: HubRow } | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (tab !== 'ALL') params.set('tab', tab);
      if (source !== 'ALL') params.set('source', source);
      if (search) params.set('search', search);
      const res = await adminApi<{ data: { rows: HubRow[]; counts: HubCounts } }>(`/api/admin/transactions?${params}`);
      setRows(res.data.rows);
      setCounts(res.data.counts);
      // Keep an open drawer in sync with the fresh data
      setSelected(prev => (prev ? res.data.rows.find(r => r.transactionId === prev.transactionId) ?? prev : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [tab, source, search]);

  useEffect(() => { load(); }, [load]);

  // Search as you type, without a request per keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openAction = (kind: ActionKind, row: HubRow) => setAction({ kind, row });

  const actionDone = async (message: string) => {
    setAction(null);
    setFlash(message);
    await load();
    onPendingChange?.();
  };

  const toggleReview = async (row: HubRow) => {
    if (!row.customer) return;
    const required = !row.customer.reviewRequired;
    setReviewSaving(true);
    try {
      await adminApi(`/api/admin/users/${encodeURIComponent(row.customer.accountNumber)}/transfer-review`, {
        method: 'PATCH',
        body: { required },
      });
      setFlash(`Transfer review ${required ? 'switched on' : 'switched off'} for ${row.customer.name}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update transfer review');
    } finally {
      setReviewSaving(false);
    }
  };

  const amountCell = (row: HubRow) => (
    <span className={`font-semibold tabular-nums ${['FAILED', 'DECLINED', 'REVERSED'].includes(row.status) ? 'text-slate-400 line-through' : row.flow === 'IN' ? 'text-green-700' : 'text-slate-900'}`}>
      {row.flow === 'IN' ? '+' : '-'}{fmtMoney(row.amount, row.currency)}
    </span>
  );

  const counterparty = (row: HubRow) => (row.flow === 'OUT' ? row.to : row.from);

  return (
    <div className="space-y-4">
      {flash && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-green-800 flex-1">{flash}</p>
          <button onClick={() => setFlash('')} className="text-green-600 hover:text-green-800" aria-label="Dismiss"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <ArrowUpDown className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900">Transactions</h3>
            <p className="text-xs text-slate-500">Approve or decline pending transfers, and reverse completed transactions.</p>
          </div>
          <button onClick={load} disabled={loading} title="Refresh"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs + filters */}
        <div className="px-6 py-3 border-b border-slate-100 space-y-3">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {t.label}
                <span className={`min-w-5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  t.id === 'PENDING' && counts.PENDING > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {counts[t.id]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by reference, customer, account or email"
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <select value={source} onChange={e => setSource(e.target.value as 'ALL' | HubSource)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* List */}
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {tab === 'PENDING' && !search ? 'Nothing waiting for review' : 'No transactions found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {tab === 'PENDING' && !search ? 'Transfers from customers under review will appear here.' : 'Try another tab, source or search.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Transaction</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Counterparty</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map(row => (
                    <tr key={row.transactionId} onClick={() => setSelected(row)} className="hover:bg-slate-50/60 cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.flow === 'IN' ? 'bg-green-50' : 'bg-slate-100'}`}>
                            {row.flow === 'IN' ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-slate-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{row.kind}</p>
                            <p className="font-mono text-[11px] text-slate-400">{row.transactionId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {row.customer ? (
                          <>
                            <p className="font-medium text-slate-900 flex items-center gap-1.5">
                              {row.customer.name} {row.customer.reviewRequired && <ReviewPill />}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{row.customer.accountNumber}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-900">{row.to.name}</p>
                            <p className="text-xs text-slate-400">External account</p>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 truncate max-w-[180px]">{counterparty(row).name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">{counterparty(row).lines[0]}</p>
                      </td>
                      <td className="px-6 py-4 text-right">{amountCell(row)}</td>
                      <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{fmtDateTime(row.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end"><RowActions row={row} onAction={openAction} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {rows.map(row => (
                <div key={row.transactionId} className="px-4 py-4">
                  <button onClick={() => setSelected(row)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{row.kind}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                          {row.customer?.name ?? row.to.name} {row.customer?.reviewRequired && <ReviewPill />}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400 truncate">{row.transactionId}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm">{amountCell(row)}</p>
                        <div className="mt-1"><StatusBadge status={row.status} /></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      {fmtDateTime(row.createdAt)} <ChevronRight className="w-3 h-3" />
                    </p>
                  </button>
                  <div className="mt-3"><RowActions row={row} onAction={openAction} /></div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
              Showing {rows.length} transaction{rows.length !== 1 ? 's' : ''}{rows.length >= 200 ? ' (newest 200, use search to narrow)' : ''}
            </div>
          </>
        )}
      </div>

      {selected && (
        <DetailDrawer
          row={selected}
          onClose={() => setSelected(null)}
          onAction={openAction}
          onToggleReview={toggleReview}
          reviewSaving={reviewSaving}
        />
      )}

      {action && (
        <TransactionActionModal
          kind={action.kind}
          row={action.row}
          onClose={() => setAction(null)}
          onDone={actionDone}
        />
      )}
    </div>
  );
};

export default AdminTransactions;
