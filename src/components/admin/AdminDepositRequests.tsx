import { useState, useEffect } from 'react';
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, Clock,
  ChevronDown, ChevronUp, AlertCircle, Search, ArrowDownToLine
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

// ─── Types ────────────────────────────────────────────────────────────────────
type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface DepositRequest {
  id: string;
  requestId: string;
  amount: number;
  cryptoType: string;
  network: string;
  walletAddress: string;
  receiptPath: string | null;
  status: DepositStatus;
  adminNote: string | null;
  createdAt: string;
  user: {
    fullName: string;
    accountNumber: string;
    emailAddress: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusConfig: Record<DepositStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Pending',  color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: <Clock className="w-3.5 h-3.5" /> },
  APPROVED: { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200',        icon: <XCircle className="w-3.5 h-3.5" /> },
};

const cryptoIcons: Record<string, string> = {
  bitcoin: '₿', ethereum: 'Ξ', litecoin: 'Ł', usdt: '₮',
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Component ────────────────────────────────────────────────────────────────
const AdminDepositRequests = () => {
  const [requests, setRequests]       = useState<DepositRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<DepositStatus | 'ALL'>('ALL');
  const [search, setSearch]           = useState('');
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [actionId, setActionId]       = useState<string | null>(null);
  const [adminNote, setAdminNote]     = useState('');
  const [processing, setProcessing]   = useState(false);
  const [toast, setToast]             = useState('');
  const [toastError, setToastError]   = useState('');

  const showToast = (msg: string, isError = false) => {
    if (isError) { setToastError(msg); setTimeout(() => setToastError(''), 4000); }
    else         { setToast(msg);      setTimeout(() => setToast(''), 4000); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ success: boolean; data: DepositRequest[] }>('/api/admin/deposit-requests');
      setRequests(res.data || []);
    } catch {
      showToast('Failed to load deposit requests.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ─── Approve / Reject ────────────────────────────────────────────────────────
  const handleAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessing(true);
    try {
      await adminApi(`/api/admin/deposit-requests/${requestId}/status`, {
        method: 'PATCH',
        body: { status, adminNote: adminNote.trim() || undefined },
      });
      showToast(`Deposit request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      setExpanded(null);
      setActionId(null);
      setAdminNote('');
      fetchRequests();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed. Try again.', true);
    } finally {
      setProcessing(false);
    }
  };

  // ─── Filtering ───────────────────────────────────────────────────────────────
  const filtered = requests.filter(r => {
    const matchStatus = filter === 'ALL' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [r.user.fullName, r.user.accountNumber, r.requestId, r.cryptoType]
      .some(v => v.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  // ─── Counts ───────────────────────────────────────────────────────────────────
  const counts = {
    ALL:      requests.length,
    PENDING:  requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-5">

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{toast}</p>
        </div>
      )}
      {toastError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{toastError}</p>
        </div>
      )}

      {/* ── Header + Filters ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Deposit Requests</h3>
              <p className="text-xs text-slate-500">{counts.PENDING} pending review</p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search + Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, account, request ID..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  filter === s
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  filter === s ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {counts[s]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── List ────────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            {search || filter !== 'ALL' ? 'No matching deposit requests found.' : 'No deposit requests yet.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(req => {
              const st = statusConfig[req.status];
              const isExpanded = expanded === req.requestId;
              const isActioning = actionId === req.requestId;

              return (
                <div key={req.id}>
                  {/* Row */}
                  <div
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : req.requestId)}
                  >
                    {/* Crypto icon */}
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg shrink-0">
                      {cryptoIcons[req.cryptoType] || '?'}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{req.user.fullName}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                          {st.icon}{st.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {req.requestId} · {req.user.accountNumber} · {fmtDate(req.createdAt)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">${req.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-400 capitalize">{req.cryptoType} · {req.network}</p>
                    </div>

                    {/* Expand toggle */}
                    <div className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">User Email</p>
                          <p className="text-sm font-medium text-slate-800">{req.user.emailAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Account Number</p>
                          <p className="text-sm font-medium text-slate-800">{req.user.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Crypto & Network</p>
                          <p className="text-sm font-medium text-slate-800 capitalize">{req.cryptoType} — {req.network || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Wallet Address (sent to)</p>
                          <p className="text-sm font-mono text-slate-700 break-all">{req.walletAddress}</p>
                        </div>
                        {req.adminNote && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-slate-500 mb-1">Admin Note</p>
                            <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">{req.adminNote}</p>
                          </div>
                        )}
                        {req.receiptPath && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-slate-500 mb-2">Payment Receipt</p>
                            <a
                              href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/${req.receiptPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline"
                            >
                              View Receipt ↗
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action panel — only for PENDING */}
                      {req.status === 'PENDING' && (
                        <div className="border-t border-slate-200 pt-4">
                          {isActioning ? (
                            <div className="space-y-3">
                              <textarea
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                placeholder="Optional note to attach to this decision..."
                                rows={2}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleAction(req.requestId, 'APPROVED')}
                                  disabled={processing}
                                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAction(req.requestId, 'REJECTED')}
                                  disabled={processing}
                                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                  Reject
                                </button>
                                <button
                                  onClick={() => { setActionId(null); setAdminNote(''); }}
                                  disabled={processing}
                                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActionId(req.requestId)}
                              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all"
                            >
                              Review this Request
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDepositRequests;