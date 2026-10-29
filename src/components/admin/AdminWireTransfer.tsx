import { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Search,
  Loader2,
  Check,
  AlertCircle,
  User,
  Building2,
  Landmark,
  History,
  Clock,
  XCircle,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Mail,
  RefreshCw,
  FileText,
  Receipt,
} from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { formatReceiptDate, type ReceiptData } from '../../lib/receipt';
import ReceiptModal from '../ReceiptModal';

type RecipientType = 'VAULTIX' | 'EXTERNAL';
type Step = 'form' | 'review' | 'done';
type StatusFilter = 'ALL' | 'PENDING' | 'SUCCESSFUL' | 'FAILED';

interface VaultixUser {
  id: string;
  accountNumber: string;
  fullName: string;
  emailAddress: string;
  currencyType: string;
  totalBalance: number;
}

interface WireRecord {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  senderName: string;
  senderAddress: string | null;
  senderBankName: string | null;
  senderAccountNumber: string | null;
  senderEmail: string | null;
  recipientType: RecipientType;
  recipientName: string;
  recipientAccountNumber: string;
  recipientBankName: string;
  recipientSwiftCode: string | null;
  recipientRoutingNumber: string | null;
  recipientAddress: string | null;
  recipientCity: string | null;
  recipientCountry: string | null;
  recipientEmail: string | null;
  balanceBefore: number | null;
  balanceAfter: number | null;
  notifyByEmail: boolean;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WireForm {
  amount: string;
  currency: string;
  reason: string;
  status: 'PENDING' | 'SUCCESSFUL';
  senderName: string;
  senderAddress: string;
  senderBankName: string;
  senderAccountNumber: string;
  senderEmail: string;
  recipientAccountNumber: string;
  recipientName: string;
  recipientBankName: string;
  recipientSwiftCode: string;
  recipientRoutingNumber: string;
  recipientAddress: string;
  recipientCity: string;
  recipientCountry: string;
  recipientEmail: string;
  adminNote: string;
  notifyByEmail: boolean;
}

const emptyForm: WireForm = {
  amount: '',
  currency: 'USD',
  reason: '',
  status: 'PENDING',
  senderName: '',
  senderAddress: '',
  senderBankName: 'Vaultix Bank',
  senderAccountNumber: '',
  senderEmail: '',
  recipientAccountNumber: '',
  recipientName: '',
  recipientBankName: '',
  recipientSwiftCode: '',
  recipientRoutingNumber: '',
  recipientAddress: '',
  recipientCity: '',
  recipientCountry: '',
  recipientEmail: '',
  adminNote: '',
  notifyByEmail: true,
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY'];
const SWIFT_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: typeof Clock; label: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
  SUCCESSFUL: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, label: 'Successful' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Failed' },
};

const inputClass =
  'w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm';

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);

const mask = (account: string) => (account.length > 4 ? `••••${account.slice(-4)}` : account);

const RECEIPT_NOTES: Record<string, (wire: WireRecord) => string> = {
  SUCCESSFUL: wire => wire.recipientType === 'VAULTIX'
    ? 'The funds have been credited to the recipient’s Vaultix account.'
    : 'This wire transfer has been completed.',
  PENDING: () => 'This wire transfer is being processed. A confirmation follows once it completes.',
  FAILED: () => 'This wire transfer was not completed and no funds were moved.',
};

const wireReceipt = (wire: WireRecord): ReceiptData => ({
  title: 'Wire Transfer',
  amountLabel: 'Transfer amount',
  amount: wire.amount,
  currency: wire.currency,
  status: wire.status as ReceiptData['status'],
  reference: wire.transactionId,
  date: new Date(wire.createdAt),
  parties: [
    {
      role: 'From',
      name: wire.senderName,
      lines: [
        wire.senderBankName ?? '',
        wire.senderAccountNumber ? `Account ${mask(wire.senderAccountNumber)}` : '',
        wire.senderAddress ?? '',
      ].filter(Boolean),
    },
    {
      role: 'To',
      name: wire.recipientName,
      lines: [
        wire.recipientBankName,
        `Account ${mask(wire.recipientAccountNumber)}`,
        [wire.recipientAddress, wire.recipientCity, wire.recipientCountry].filter(Boolean).join(', '),
      ].filter(Boolean),
    },
  ],
  rows: [
    { label: 'Transaction type', value: wire.recipientType === 'VAULTIX' ? 'Wire transfer to Vaultix account' : 'Wire transfer to external bank' },
    { label: 'Purpose', value: wire.reason },
    { label: 'SWIFT / BIC', value: wire.recipientSwiftCode ?? '', mono: true },
    { label: 'Routing number', value: wire.recipientRoutingNumber ?? '', mono: true },
    { label: 'Currency', value: wire.currency },
    ...(wire.status === 'PENDING' ? [] : [{
      label: wire.status === 'SUCCESSFUL' ? 'Completed' : 'Closed',
      value: formatReceiptDate(new Date(wire.updatedAt)),
    }]),
  ],
  note: RECEIPT_NOTES[wire.status]?.(wire),
});

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title }: { icon: typeof Send; title: string }) => (
  <div className="flex items-center gap-2 pt-2">
    <Icon className="w-4 h-4 text-primary-600" />
    <h4 className="font-medium text-slate-900 text-sm">{title}</h4>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text} border ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const AdminWireTransfer = () => {
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<WireForm>(emptyForm);
  const [recipientType, setRecipientType] = useState<RecipientType>('VAULTIX');
  const [vaultixUser, setVaultixUser] = useState<VaultixUser | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WireRecord | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // History
  const [history, setHistory] = useState<WireRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const closeReceipt = useCallback(() => setReceipt(null), []);

  const update = <K extends keyof WireForm>(field: K, value: WireForm[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const currency = recipientType === 'VAULTIX' && vaultixUser ? vaultixUser.currencyType : form.currency;
  const recipientEmail = recipientType === 'VAULTIX' ? vaultixUser?.emailAddress ?? '' : form.recipientEmail.trim();
  const notifyList = [form.senderEmail.trim(), recipientEmail].filter(Boolean);

  const fetchHistory = useCallback(async (status: StatusFilter, term: string) => {
    setLoadingHistory(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'ALL') params.set('status', status);
      if (term.trim()) params.set('search', term.trim());
      const query = params.toString();
      const res = await adminApi<{ success: boolean; data: WireRecord[] }>(
        `/api/admin/wire-transfers${query ? `?${query}` : ''}`
      );
      setHistory(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load wire transfers');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchHistory(statusFilter, search); }, [fetchHistory, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLookup = async () => {
    const acct = form.recipientAccountNumber.trim();
    if (!acct) { setError('Enter the recipient’s Vaultix account number'); return; }
    setError(''); setVaultixUser(null);
    setLookingUp(true);
    try {
      const res = await adminApi<{ success: boolean; data: VaultixUser }>(`/api/admin/users/${encodeURIComponent(acct)}`);
      setVaultixUser(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Account not found');
    } finally {
      setLookingUp(false);
    }
  };

  const validate = (): string | null => {
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) return 'Enter a valid positive amount';
    if (!form.reason.trim()) return 'Enter the reason for the transfer';
    if (!form.senderName.trim()) return 'Enter the sender’s name';
    if (form.senderEmail.trim() && !EMAIL_REGEX.test(form.senderEmail.trim())) return 'Sender email is not valid';

    if (recipientType === 'VAULTIX') {
      if (!vaultixUser) return 'Find the recipient’s Vaultix account first';
      return null;
    }

    if (!form.recipientName.trim()) return 'Enter the recipient’s name';
    if (!form.recipientAccountNumber.trim()) return 'Enter the recipient’s account number / IBAN';
    if (!form.recipientBankName.trim()) return 'Enter the recipient’s bank name';
    const swift = form.recipientSwiftCode.trim();
    const routing = form.recipientRoutingNumber.trim();
    if (!swift && !routing) return 'Enter a SWIFT/BIC code or a routing number';
    if (swift && !SWIFT_REGEX.test(swift)) return 'SWIFT/BIC must be 8 or 11 characters (e.g. CHASUS33)';
    if (routing && !/^\d{9}$/.test(routing)) return 'Routing number must be exactly 9 digits';
    if (form.recipientEmail.trim() && !EMAIL_REGEX.test(form.recipientEmail.trim())) return 'Recipient email is not valid';
    return null;
  };

  const handleReview = () => {
    const message = validate();
    if (message) { setError(message); return; }
    setError('');
    setStep('review');
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await adminApi<{ success: boolean; data: WireRecord }>('/api/admin/wire-transfers', {
        method: 'POST',
        body: {
          amount: parseFloat(form.amount),
          currency,
          reason: form.reason,
          status: form.status,
          notifyByEmail: form.notifyByEmail,
          adminNote: form.adminNote,
          senderName: form.senderName,
          senderAddress: form.senderAddress,
          senderBankName: form.senderBankName,
          senderAccountNumber: form.senderAccountNumber,
          senderEmail: form.senderEmail,
          recipientType,
          recipientAccountNumber: form.recipientAccountNumber,
          ...(recipientType === 'EXTERNAL' && {
            recipientName: form.recipientName,
            recipientBankName: form.recipientBankName,
            recipientSwiftCode: form.recipientSwiftCode,
            recipientRoutingNumber: form.recipientRoutingNumber,
            recipientAddress: form.recipientAddress,
            recipientCity: form.recipientCity,
            recipientCountry: form.recipientCountry,
            recipientEmail: form.recipientEmail,
          }),
        },
      });
      setResult(res.data);
      setStep('done');
      fetchHistory(statusFilter, search);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wire transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewTransfer = () => {
    setForm(emptyForm);
    setVaultixUser(null);
    setResult(null);
    setError('');
    setStep('form');
  };

  const handleStatusUpdate = async (transactionId: string, newStatus: 'SUCCESSFUL' | 'FAILED') => {
    setError(''); setSuccess('');
    setUpdatingId(transactionId);
    try {
      await adminApi(`/api/admin/wire-transfers/${transactionId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      await fetchHistory(statusFilter, search);
      setSuccess(`Wire ${transactionId} ${newStatus === 'SUCCESSFUL' ? 'approved' : 'declined'}.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Review rows ──────────────────────────────────────────────────────────
  const senderLines = [
    form.senderBankName.trim(),
    form.senderAccountNumber.trim() && mask(form.senderAccountNumber.trim()),
    form.senderAddress.trim(),
  ].filter(Boolean);

  const recipientLines =
    recipientType === 'VAULTIX' && vaultixUser
      ? ['Vaultix Bank', mask(vaultixUser.accountNumber), vaultixUser.emailAddress]
      : [
          form.recipientBankName.trim(),
          form.recipientAccountNumber.trim() && mask(form.recipientAccountNumber.trim()),
          form.recipientSwiftCode.trim() && `SWIFT ${form.recipientSwiftCode.trim()}`,
          form.recipientRoutingNumber.trim() && `Routing ${form.recipientRoutingNumber.trim()}`,
          [form.recipientCity.trim(), form.recipientCountry.trim()].filter(Boolean).join(', '),
        ].filter(Boolean);

  const recipientDisplayName = recipientType === 'VAULTIX' ? vaultixUser?.fullName ?? '' : form.recipientName.trim();

  const willCredit = recipientType === 'VAULTIX' && form.status === 'SUCCESSFUL';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Send className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900">Wire Transfer</h3>
            <p className="text-xs text-slate-500">
              Record a wire sent from the Vaultix pool. Vaultix recipients are credited once the wire is successful.
            </p>
          </div>
          {step !== 'done' && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium shrink-0">
              <span className={step === 'form' ? 'text-primary-600' : 'text-slate-400'}>1. Details</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
              <span className={step === 'review' ? 'text-primary-600' : 'text-slate-400'}>2. Review</span>
            </div>
          )}
        </div>

        {/* ─── Step 1: Form ─────────────────────────────────────────────── */}
        {step === 'form' && (
          <div className="p-6 space-y-4">
            <SectionTitle icon={FileText} title="Transfer Details" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label={`Amount (${currency})`} required>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => update('amount', e.target.value)}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>
              <Field label="Currency" required>
                {recipientType === 'VAULTIX' ? (
                  <input
                    type="text"
                    value={vaultixUser ? vaultixUser.currencyType : 'Account currency'}
                    disabled
                    className={`${inputClass} bg-slate-50 text-slate-500`}
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={form.currency}
                      onChange={e => update('currency', e.target.value)}
                      className={`${inputClass} appearance-none bg-white pr-10`}
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                )}
              </Field>
              <Field label="Status" required>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={e => update('status', e.target.value as WireForm['status'])}
                    className={`${inputClass} appearance-none bg-white pr-10`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="SUCCESSFUL">Successful</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </Field>
            </div>
            <Field label="Reason / Purpose" required>
              <input
                type="text"
                value={form.reason}
                onChange={e => update('reason', e.target.value)}
                placeholder="e.g. Invoice #1042 payment, family support, property deposit..."
                maxLength={500}
                className={inputClass}
              />
            </Field>

            {/* Sender */}
            <SectionTitle icon={User} title="Sender" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sender Name" required>
                <input type="text" value={form.senderName} onChange={e => update('senderName', e.target.value)} placeholder="Full name or company" className={inputClass} />
              </Field>
              <Field label="Sender Email">
                <input type="email" value={form.senderEmail} onChange={e => update('senderEmail', e.target.value)} placeholder="Optional — receives a confirmation" className={inputClass} />
              </Field>
              <Field label="Sender Bank">
                <input type="text" value={form.senderBankName} onChange={e => update('senderBankName', e.target.value)} placeholder="Bank name" className={inputClass} />
              </Field>
              <Field label="Sender Account Number">
                <input type="text" value={form.senderAccountNumber} onChange={e => update('senderAccountNumber', e.target.value)} placeholder="Optional" className={inputClass} />
              </Field>
            </div>
            <Field label="Sender Address">
              <input type="text" value={form.senderAddress} onChange={e => update('senderAddress', e.target.value)} placeholder="Optional" className={inputClass} />
            </Field>

            {/* Recipient */}
            <SectionTitle icon={Landmark} title="Recipient" />
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              {([
                ['VAULTIX', 'Vaultix customer', User],
                ['EXTERNAL', 'Other bank', Building2],
              ] as const).map(([type, label, Icon]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setRecipientType(type); setVaultixUser(null); setError(''); }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    recipientType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {recipientType === 'VAULTIX' ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={form.recipientAccountNumber}
                      onChange={e => { update('recipientAccountNumber', e.target.value); setVaultixUser(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleLookup()}
                      placeholder="Vaultix account number..."
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLookup}
                    disabled={lookingUp}
                    className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0 text-sm"
                  >
                    {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Find
                  </button>
                </div>
                {vaultixUser && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{vaultixUser.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">
                        <span className="font-mono">{vaultixUser.accountNumber}</span> · {vaultixUser.emailAddress}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500 mb-0.5">Current Balance</p>
                      <p className="text-sm font-bold text-primary-600">{fmt(vaultixUser.totalBalance, vaultixUser.currencyType)}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Recipient Name" required>
                    <input type="text" value={form.recipientName} onChange={e => update('recipientName', e.target.value)} placeholder="Account holder name" className={inputClass} />
                  </Field>
                  <Field label="Recipient Email">
                    <input type="email" value={form.recipientEmail} onChange={e => update('recipientEmail', e.target.value)} placeholder="Optional — receives a notice" className={inputClass} />
                  </Field>
                  <Field label="Bank Name" required>
                    <input type="text" value={form.recipientBankName} onChange={e => update('recipientBankName', e.target.value)} placeholder="e.g. JPMorgan Chase" className={inputClass} />
                  </Field>
                  <Field label="Account Number / IBAN" required>
                    <input type="text" value={form.recipientAccountNumber} onChange={e => update('recipientAccountNumber', e.target.value)} placeholder="Account number or IBAN" className={inputClass} />
                  </Field>
                  <Field label="SWIFT / BIC">
                    <input
                      type="text"
                      value={form.recipientSwiftCode}
                      onChange={e => update('recipientSwiftCode', e.target.value.toUpperCase().replace(/\s/g, ''))}
                      maxLength={11}
                      placeholder="e.g. CHASUS33"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>
                  <Field label="Routing Number (ABA)">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.recipientRoutingNumber}
                      onChange={e => update('recipientRoutingNumber', e.target.value.replace(/\D/g, ''))}
                      maxLength={9}
                      placeholder="9 digits"
                      className={`${inputClass} font-mono`}
                    />
                  </Field>
                </div>
                <p className="text-xs text-slate-400 -mt-2">A SWIFT/BIC code or a routing number is required.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Address">
                    <input type="text" value={form.recipientAddress} onChange={e => update('recipientAddress', e.target.value)} placeholder="Optional" className={inputClass} />
                  </Field>
                  <Field label="City">
                    <input type="text" value={form.recipientCity} onChange={e => update('recipientCity', e.target.value)} placeholder="Optional" className={inputClass} />
                  </Field>
                  <Field label="Country">
                    <input type="text" value={form.recipientCountry} onChange={e => update('recipientCountry', e.target.value)} placeholder="Optional" className={inputClass} />
                  </Field>
                </div>
              </div>
            )}

            {/* Notes & notifications */}
            <SectionTitle icon={Mail} title="Notes & Notifications" />
            <Field label="Admin Note (internal)">
              <input type="text" value={form.adminNote} onChange={e => update('adminNote', e.target.value)} placeholder="Optional internal note — never shown to customers" className={inputClass} />
            </Field>
            <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={form.notifyByEmail}
                onChange={e => update('notifyByEmail', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary-600"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-900">Send email notifications</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  {notifyList.length
                    ? `Emails go to ${notifyList.join(' and ')} now and when the status changes.`
                    : 'No email addresses entered yet — nobody will be emailed.'}
                </span>
              </span>
            </label>

            {/* Status hint */}
            {form.status === 'PENDING' ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  <strong>Pending:</strong> No balance changes yet. Approve or decline it later from the history below.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs text-green-700">
                  <strong>Successful:</strong>{' '}
                  {recipientType === 'VAULTIX'
                    ? 'The recipient’s Vaultix balance is credited immediately.'
                    : 'The wire is recorded as completed. No Vaultix balance changes for an external recipient.'}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleReview}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
            >
              Review Transfer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── Step 2: Review ───────────────────────────────────────────── */}
        {step === 'review' && (
          <div className="p-6 space-y-5">
            <div className="text-center py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transfer Amount</p>
              <p className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{fmt(parseFloat(form.amount), currency)}</p>
              <div className="mt-2"><StatusBadge status={form.status} /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['From', form.senderName.trim(), senderLines],
                ['To', recipientDisplayName, recipientLines],
              ].map(([role, name, lines]) => (
                <div key={role as string} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{role as string}</p>
                  <p className="font-semibold text-slate-900 mt-1">{name as string}</p>
                  {(lines as string[]).map(line => (
                    <p key={line} className="text-xs text-slate-500 mt-0.5">{line}</p>
                  ))}
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {[
                ['Reason', form.reason.trim()],
                ['Recipient type', recipientType === 'VAULTIX' ? 'Vaultix customer' : 'External bank'],
                ['Balance effect', willCredit
                  ? `${vaultixUser?.fullName} is credited ${fmt(parseFloat(form.amount), currency)} now`
                  : recipientType === 'VAULTIX' ? 'Credited when approved' : 'None (external recipient)'],
                ['Emails', form.notifyByEmail && notifyList.length ? notifyList.join(', ') : 'None'],
                ...(form.adminNote.trim() ? [['Admin note', form.adminNote.trim()]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900 text-right break-all">{value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setError(''); setStep('form'); }}
                disabled={submitting}
                className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3: Done ─────────────────────────────────────────────── */}
        {step === 'done' && result && (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Wire Transfer Recorded</h4>
              <p className="text-sm text-slate-500 mt-1">
                {fmt(result.amount, result.currency)} from {result.senderName} to {result.recipientName}
              </p>
            </div>
            <div className="inline-flex flex-col items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500">Reference</span>
              <span className="font-mono text-sm font-semibold text-slate-900">{result.transactionId}</span>
              <StatusBadge status={result.status} />
            </div>
            {result.balanceAfter != null && (
              <p className="text-sm text-slate-600">
                New balance for {result.recipientName}: <strong>{fmt(result.balanceAfter, result.currency)}</strong>
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setReceipt(wireReceipt(result))}
                className="w-full sm:w-auto px-6 py-3 border border-primary-200 text-primary-700 bg-primary-50 rounded-xl font-semibold hover:bg-primary-100 transition-all inline-flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                View Receipt
              </button>
              <button
                onClick={handleNewTransfer}
                className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                New Wire Transfer
              </button>
            </div>
          </div>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* ─── History ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <History className="w-5 h-5 text-slate-500" />
          <h4 className="font-semibold text-slate-900">Wire History</h4>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {history.length} record{history.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => fetchHistory(statusFilter, search)}
            className="ml-auto p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {(['ALL', 'PENDING', 'SUCCESSFUL', 'FAILED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'ALL' ? 'All' : statusConfig[s].label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchHistory(statusFilter, search)}
              placeholder="Search reference, name, account, email — press Enter"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {loadingHistory && history.length === 0 ? (
          <div className="px-6 py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">No wire transfers found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map(wire => {
              const isUpdating = updatingId === wire.transactionId;
              const isExpanded = expandedId === wire.id;
              const details: [string, string | null][] = [
                ['Reason', wire.reason],
                ['Sender bank', wire.senderBankName],
                ['Sender account', wire.senderAccountNumber],
                ['Sender address', wire.senderAddress],
                ['Sender email', wire.senderEmail],
                ['Recipient bank', wire.recipientBankName],
                ['Recipient account', wire.recipientAccountNumber],
                ['SWIFT / BIC', wire.recipientSwiftCode],
                ['Routing', wire.recipientRoutingNumber],
                ['Recipient address', [wire.recipientAddress, wire.recipientCity, wire.recipientCountry].filter(Boolean).join(', ') || null],
                ['Recipient email', wire.recipientEmail],
                ['Balance', wire.balanceBefore != null && wire.balanceAfter != null
                  ? `${fmt(wire.balanceBefore, wire.currency)} → ${fmt(wire.balanceAfter, wire.currency)}`
                  : null],
                ['Emails', wire.notifyByEmail ? 'On' : 'Off'],
                ['Admin note', wire.adminNote],
              ];

              return (
                <div key={wire.id}>
                  <div
                    className="px-6 py-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50/60"
                    onClick={() => setExpandedId(isExpanded ? null : wire.id)}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${statusConfig[wire.status]?.bg ?? 'bg-slate-50'}`}>
                      <Send className={`w-4 h-4 ${statusConfig[wire.status]?.text ?? 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">{fmt(wire.amount, wire.currency)}</span>
                        <StatusBadge status={wire.status} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {wire.recipientType === 'VAULTIX' ? 'Vaultix' : 'External'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1 truncate">
                        {wire.senderName} <ArrowRight className="inline w-3 h-3 text-slate-400" /> {wire.recipientName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{wire.transactionId}</p>

                      {wire.status === 'PENDING' && (
                        <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleStatusUpdate(wire.transactionId, 'SUCCESSFUL')}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(wire.transactionId, 'FAILED')}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">
                        {new Date(wire.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      <ChevronDown className={`w-4 h-4 text-slate-300 ml-auto mt-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-4 bg-slate-50/60 pt-3 border-t border-slate-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {details.filter(([, value]) => value).map(([label, value]) => (
                          <div key={label} className="text-xs">
                            <span className="text-slate-400">{label}: </span>
                            <span className="text-slate-700 font-medium break-all">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/70 flex justify-end">
                        <button
                          onClick={() => setReceipt(wireReceipt(wire))}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center"
                        >
                          <Receipt className="w-4 h-4" />
                          View Receipt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {receipt && <ReceiptModal data={receipt} onClose={closeReceipt} />}
    </div>
  );
};

export default AdminWireTransfer;
