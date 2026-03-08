import { useState } from 'react';
import {
  DollarSign,
  Search,
  Loader2,
  Check,
  AlertCircle,
  User,
  History,
  ArrowUpCircle,
  RefreshCw,
  Clock,
  XCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface UserInfo {
  id: string;
  accountNumber: string;
  fullName: string;
  emailAddress: string;
  currencyType: string;
  totalBalance: number;
}

interface FundingRecord {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  description: string | null;
  adminNote: string | null;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  createdAt: string;
}

interface HistoryResponse {
  success: boolean;
  data: {
    user: UserInfo;
    history: FundingRecord[];
  };
}

interface CreditResponse {
  success: boolean;
  data: {
    user: UserInfo;
    transaction: FundingRecord;
  };
}

const FUNDING_STATUSES = ['PENDING', 'SUCCESSFUL', 'FAILED'] as const;

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: typeof Clock; label: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
  SUCCESSFUL: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, label: 'Successful' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Failed' },
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, label: 'Completed' },
};

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);

const AdminBLC = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [history, setHistory] = useState<FundingRecord[]>([]);
  const [searching, setSearching] = useState(false);
  const [crediting, setCrediting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Credit form
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [fundingStatus, setFundingStatus] = useState<string>('PENDING');

  // Status update tracking
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!accountNumber.trim()) { setError('Enter an account number'); return; }
    setError(''); setSuccess(''); setUserInfo(null); setHistory([]);
    setSearching(true);
    try {
      const res = await adminApi<HistoryResponse>(
        `/api/admin/users/${accountNumber.trim()}/funding-history`
      );
      setUserInfo(res.data.user);
      setHistory(res.data.history);
      setAmount(''); setDescription(''); setAdminNote(''); setFundingStatus('PENDING');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleCredit = async () => {
    if (!userInfo) return;
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid positive amount');
      return;
    }
    setError(''); setSuccess('');
    setCrediting(true);
    try {
      const res = await adminApi<CreditResponse>(
        `/api/admin/users/${userInfo.accountNumber}/credit`,
        {
          method: 'POST',
          body: {
            amount: parsed,
            status: fundingStatus,
            ...(description && { description }),
            ...(adminNote && { adminNote }),
          },
        }
      );
      setUserInfo(res.data.user);
      setHistory(prev => [res.data.transaction, ...prev]);
      setAmount(''); setDescription(''); setAdminNote(''); setFundingStatus('PENDING');
      const statusLabel = fundingStatus === 'SUCCESSFUL' ? 'credited to' : 'recorded for';
      setSuccess(`${fmt(parsed, res.data.user.currencyType)} ${statusLabel} ${res.data.user.fullName}'s account (${fundingStatus}).`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credit failed');
    } finally {
      setCrediting(false);
    }
  };

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    setError(''); setSuccess('');
    setUpdatingId(transactionId);
    try {
      await adminApi<{ success: boolean; data: FundingRecord }>(
        `/api/admin/funding-transactions/${transactionId}/status`,
        {
          method: 'PATCH',
          body: { status: newStatus },
        }
      );
      // Refresh the funding history to get updated data
      if (userInfo) {
        const res = await adminApi<HistoryResponse>(
          `/api/admin/users/${userInfo.accountNumber}/funding-history`
        );
        setUserInfo(res.data.user);
        setHistory(res.data.history);
      }
      setSuccess(`Transaction ${transactionId} updated to ${newStatus}.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getTxIcon = (status: string) => {
    if (status === 'PENDING') return { bg: 'bg-amber-50', color: 'text-amber-600' };
    if (status === 'FAILED') return { bg: 'bg-red-50', color: 'text-red-600' };
    return { bg: 'bg-green-50', color: 'text-green-600' };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header / Search */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Account Funding</h3>
            <p className="text-xs text-slate-500">Search a user by account number to credit their account</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Enter account number..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {userInfo && (
        <>
          {/* User Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{userInfo.fullName}</p>
                <p className="text-xs text-slate-500 font-mono">{userInfo.accountNumber}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 mb-0.5">Current Balance</p>
                <p className="text-lg font-bold text-primary-600">{fmt(userInfo.totalBalance, userInfo.currencyType)}</p>
              </div>
            </div>

            {/* Credit Form */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpCircle className="w-4 h-4 text-primary-600" />
                <h4 className="font-medium text-slate-900 text-sm">Add Funds</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Amount ({userInfo.currencyType}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={fundingStatus}
                      onChange={e => setFundingStatus(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white pr-10"
                    >
                      {FUNDING_STATUSES.map(s => (
                        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. Account Funding"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Note (internal)</label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Optional internal note..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Status hint */}
              {fundingStatus === 'PENDING' && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    <strong>Pending:</strong> Balance will NOT be updated. User will be notified of an incoming deposit. You can update the status later.
                  </p>
                </div>
              )}
              {fundingStatus === 'SUCCESSFUL' && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700">
                    <strong>Successful:</strong> Balance will be credited immediately and the user will receive a credit notification email.
                  </p>
                </div>
              )}
              {fundingStatus === 'FAILED' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">
                    <strong>Failed:</strong> Balance will NOT be updated. The transaction will be recorded as failed.
                  </p>
                </div>
              )}

              <button
                onClick={handleCredit}
                disabled={crediting}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {crediting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />}
                {fundingStatus === 'SUCCESSFUL' ? 'Credit Account' : 'Create Funding Transaction'}
              </button>
            </div>
          </div>

          {/* Funding History */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <History className="w-5 h-5 text-slate-500" />
              <h4 className="font-semibold text-slate-900">Funding History</h4>
              <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {history.length} record{history.length !== 1 ? 's' : ''}
              </span>
            </div>

            {history.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                No funding transactions yet for this account.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map(tx => {
                  const iconStyle = getTxIcon(tx.status);
                  const isPending = tx.status === 'PENDING';
                  const isUpdating = updatingId === tx.transactionId;

                  return (
                    <div key={tx.id} className="px-6 py-4 flex items-start gap-4">
                      <div className={`w-9 h-9 ${iconStyle.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                        <ArrowUpCircle className={`w-4 h-4 ${iconStyle.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">
                            +{fmt(tx.amount, tx.currency)}
                          </span>
                          {getStatusBadge(tx.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">{tx.transactionId}</p>
                        {tx.description && (
                          <p className="text-xs text-slate-600 mt-1">{tx.description}</p>
                        )}
                        {tx.adminNote && (
                          <p className="text-xs text-slate-400 italic mt-0.5">Note: {tx.adminNote}</p>
                        )}

                        {/* Update Status Actions for PENDING transactions */}
                        {isPending && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleStatusUpdate(tx.transactionId, 'SUCCESSFUL')}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(tx.transactionId, 'FAILED')}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              Decline
                            </button>
                            <RefreshCw className={`w-3 h-3 text-slate-300 ${isUpdating ? 'animate-spin' : ''}`} />
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {fmt(tx.balanceBefore, tx.currency)} → <span className="font-medium text-slate-700">{fmt(tx.balanceAfter, tx.currency)}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBLC;
