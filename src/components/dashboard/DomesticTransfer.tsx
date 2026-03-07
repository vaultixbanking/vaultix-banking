import { useState } from 'react';
import { ArrowRightLeft, AlertCircle, Check, ChevronRight, ChevronLeft, Building2, User, Hash, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import TransactionPinModal from './TransactionPinModal';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DomesticForm {
  amount: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  narration: string;
}

type Step = 'form' | 'summary' | 'success';

interface TransactionResult {
  transactionId: string;
  newBalance: number;
  amount: number;
}

const emptyForm: DomesticForm = {
  amount: '',
  beneficiaryName: '',
  bankName: '',
  accountNumber: '',
  routingNumber: '',
  narration: '',
};

// ─── Component ─────────────────────────────────────────────────────────────────
const DomesticTransfer = () => {
  const [form, setForm]       = useState<DomesticForm>(emptyForm);
  const [step, setStep]       = useState<Step>('form');
  const [pinOpen, setPinOpen] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState<TransactionResult | null>(null);

  const update = (field: keyof DomesticForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) return 'Enter a valid transfer amount.';
    if (amt < 1) return 'Minimum transfer amount is $1.00.';
    if (!form.beneficiaryName.trim()) return 'Beneficiary full name is required.';
    if (!form.bankName.trim()) return 'Bank name is required.';
    if (!form.accountNumber.trim()) return 'Account number is required.';
    if (!form.routingNumber.trim()) return 'Routing number is required.';
    if (!/^\d{9}$/.test(form.routingNumber)) return 'Routing number must be exactly 9 digits.';
    return null;
  };

  const handleReview = () => {
    const err = validate();
    if (err) return setError(err);
    setError('');
    setStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── PIN submit → API ─────────────────────────────────────────────────────────
  const handlePinSubmit = async (pin: string) => {
    const data = await api<{ success: boolean; data: TransactionResult }>('/api/transactions/withdraw', {
      method: 'POST',
      body: {
        pin,
        amount: parseFloat(form.amount),
        withdrawalType: 'BANK',
        details: {
          transferType: 'DOMESTIC',
          beneficiaryName: form.beneficiaryName,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber,
          narration: form.narration || null,
        },
      },
    });
    setResult(data.data);
    setPinOpen(false);
    setStep('success');
  };

  const reset = () => {
    setForm(emptyForm);
    setStep('form');
    setError('');
    setResult(null);
  };

  const amt = parseFloat(form.amount) || 0;
  const maskedAccount = form.accountNumber
    ? `••••${form.accountNumber.slice(-4)}`
    : '';

  // ─── Success ───────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="w-full">
        <div className="relative overflow-hidden bg-linear-to-br from-primary-700 via-primary-600 to-primary-800 rounded-2xl shadow-xl shadow-primary-500/20 text-white">

          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full" />
          </div>

          <div className="relative z-10 p-8 text-center">

            {/* Icon */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="w-20 h-20 bg-white/15 rounded-full flex items-center justify-center border border-white/30">
                <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold mb-1">Transfer Successful!</h2>
            <p className="text-primary-200 text-sm mb-6">
              Your funds are on their way to {form.beneficiaryName}
            </p>

            {/* Amount pill */}
            <div className="inline-block bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-8 py-4 mb-6">
              <p className="text-xs text-primary-200 mb-0.5">Amount Sent</p>
              <p className="text-3xl font-bold tracking-tight">
                ${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Details card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-xs">To</span>
                <span className="text-white text-sm font-semibold">{form.beneficiaryName}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-xs">Bank</span>
                <span className="text-white text-sm font-medium">{form.bankName}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-xs">Account</span>
                <span className="text-white text-sm font-mono">{maskedAccount}</span>
              </div>
              {result && (
                <>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-primary-200 text-xs">Transaction ID</span>
                    <span className="text-white text-xs font-mono">{result.transactionId}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-primary-200 text-xs">New Balance</span>
                    <span className="text-green-300 text-sm font-bold">
                      ${result.newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Settlement note */}
            <p className="text-xs text-primary-300 mb-6">
              🕐 Domestic transfers typically settle within 1–2 business days
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl text-sm font-semibold transition-all"
              >
                New Transfer
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 py-3 bg-white text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-50 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Summary ───────────────────────────────────────────────────────────────────
  if (step === 'summary') {
    const rows = [
      { label: 'Beneficiary Name', value: form.beneficiaryName },
      { label: 'Bank Name',        value: form.bankName },
      { label: 'Account Number',   value: maskedAccount },
      { label: 'Routing Number',   value: form.routingNumber },
      ...(form.narration ? [{ label: 'Narration', value: form.narration }] : []),
    ];

    return (
      <>
        <div className="w-full">
          <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
              <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-secondary-900">Review Transfer</h2>
                <p className="text-xs text-secondary-500">Confirm your transfer details</p>
              </div>
            </div>

            <div className="p-6 space-y-5">

              {/* Amount highlight */}
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-center">
                <p className="text-xs text-secondary-500 mb-1">You are sending</p>
                <p className="text-3xl font-bold text-primary-700">
                  ${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-secondary-400 mt-1">Domestic Bank Transfer (ACH)</p>
              </div>

              {/* Details table */}
              <div className="border border-secondary-100 rounded-xl overflow-hidden divide-y divide-secondary-100">
                {rows.map(row => (
                  <div key={row.label} className="flex items-start justify-between px-4 py-3 gap-4">
                    <span className="text-sm text-secondary-500 shrink-0">{row.label}</span>
                    <span className="text-sm font-medium text-secondary-900 text-right break-all">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  Please verify all details carefully. ACH transfers cannot be reversed once submitted.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 border border-secondary-200 rounded-xl text-sm font-semibold text-secondary-700 hover:bg-secondary-50 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setPinOpen(true)}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                >
                  Enter PIN
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <TransactionPinModal
          isOpen={pinOpen}
          onClose={() => setPinOpen(false)}
          onSubmit={handlePinSubmit}
          title="Authorize Transfer"
          subtitle={`Enter your PIN to send $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        />
      </>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
          <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">Domestic Transfer</h2>
            <p className="text-xs text-secondary-500">Transfer funds to any local US bank account</p>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Transfer Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
              <input
                type="number"
                value={form.amount}
                onChange={e => update('amount', e.target.value)}
                placeholder="0.00"
                min="1"
                className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Beneficiary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-secondary-400" />
              <h3 className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Beneficiary</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Full Legal Name</label>
                <input
                  type="text"
                  value={form.beneficiaryName}
                  onChange={e => update('beneficiaryName', e.target.value)}
                  placeholder="As it appears on their account"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={e => update('bankName', e.target.value)}
                  placeholder="e.g. Chase, Wells Fargo"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-secondary-400" />
              <h3 className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Bank Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={e => update('accountNumber', e.target.value)}
                  placeholder="Bank account number"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Hash className="w-3.5 h-3.5 inline mr-1 text-secondary-400" />
                  Routing Number
                  <span className="ml-1 text-xs text-secondary-400 font-normal">(9 digits)</span>
                </label>
                <input
                  type="text"
                  value={form.routingNumber}
                  onChange={e => update('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="e.g. 021000021"
                  maxLength={9}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                />
                <p className="text-xs text-secondary-400 mt-1">Bottom left of your check</p>
              </div>
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Narration / Description
              <span className="ml-1 text-xs text-secondary-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.narration}
              onChange={e => update('narration', e.target.value)}
              placeholder="Purpose of transfer..."
              rows={3}
              className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Review button */}
          <button
            onClick={handleReview}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
          >
            Review Transfer
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomesticTransfer;