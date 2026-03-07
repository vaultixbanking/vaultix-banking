import { useState } from 'react';
import { Globe, AlertCircle, Check, ChevronRight, ChevronLeft, Building2, User, MapPin, Hash } from 'lucide-react';
import { api } from '../../lib/api';
import TransactionPinModal from './TransactionPinModal';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface WireForm {
  amount: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryCity: string;
  beneficiaryCountry: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  narration: string;
}

type Step = 'form' | 'summary' | 'success';

interface TransactionResult {
  transactionId: string;
  newBalance: number;
  amount: number;
}

const emptyForm: WireForm = {
  amount: '',
  beneficiaryName: '',
  beneficiaryAddress: '',
  beneficiaryCity: '',
  beneficiaryCountry: '',
  bankName: '',
  accountNumber: '',
  swiftCode: '',
  narration: '',
};

// ─── Component ─────────────────────────────────────────────────────────────────
const WireTransfer = () => {
  const [form, setForm]         = useState<WireForm>(emptyForm);
  const [step, setStep]         = useState<Step>('form');
  const [pinOpen, setPinOpen]   = useState(false);
  const [error, setError]       = useState('');
  const [result, setResult]     = useState<TransactionResult | null>(null);

  const update = (field: keyof WireForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) return 'Enter a valid transfer amount.';
    if (amt < 10) return 'Minimum wire transfer amount is $10.00.';
    if (!form.beneficiaryName.trim()) return 'Beneficiary full name is required.';
    if (!form.beneficiaryAddress.trim()) return 'Beneficiary street address is required.';
    if (!form.beneficiaryCity.trim()) return 'Beneficiary city is required.';
    if (!form.beneficiaryCountry.trim()) return 'Beneficiary country is required.';
    if (!form.bankName.trim()) return 'Bank name is required.';
    if (!form.accountNumber.trim()) return 'Account number or IBAN is required.';
    if (!form.swiftCode.trim()) return 'SWIFT/BIC code is required.';
    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(form.swiftCode.toUpperCase()))
      return 'SWIFT/BIC must be 8 or 11 characters (e.g. CHASUS33).';
    return null;
  };

  const handleReview = () => {
    const err = validate();
    if (err) return setError(err);
    setError('');
    setStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── PIN submit → API call ─────────────────────────────────────────────────────
  // This function throws on error so TransactionPinModal can catch and show it
  const handlePinSubmit = async (pin: string) => {
    const data = await api<{ success: boolean; data: TransactionResult }>('/api/transactions/withdraw', {
      method: 'POST',
      body: {
        pin,
        amount: parseFloat(form.amount),
        withdrawalType: 'BANK',
        details: {
          transferType: 'WIRE',
          beneficiaryName: form.beneficiaryName,
          beneficiaryAddress: form.beneficiaryAddress,
          beneficiaryCity: form.beneficiaryCity,
          beneficiaryCountry: form.beneficiaryCountry,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          swiftCode: form.swiftCode,
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

  // ─── Success ───────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="w-full max-w-2xl mx-auto py-10 sm:py-14 px-4">
        <div className="relative overflow-hidden bg-white border border-secondary-100 rounded-3xl shadow-sm">
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-green-100/70 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-primary-100/70 blur-2xl" />

          <div className="relative px-6 sm:px-8 py-8 sm:py-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
              <Check className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">Transfer Submitted</h2>
            <p className="text-secondary-600 leading-relaxed">
              Your wire transfer of{' '}
              <span className="font-semibold text-secondary-900">
                ${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>{' '}
              to <span className="font-semibold text-secondary-900">{form.beneficiaryName}</span> is now in processing.
            </p>
            <p className="text-xs text-secondary-400 mt-2 mb-6">
              International wire transfers typically settle within 3-5 business days.
            </p>

            {result && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7 text-left">
                <div className="bg-secondary-50 border border-secondary-200 rounded-2xl p-4">
                  <p className="text-[11px] uppercase tracking-wide text-secondary-400 mb-1">Transaction ID</p>
                  <p className="text-sm font-mono font-semibold text-secondary-800 break-all">{result.transactionId}</p>
                </div>
                <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
                  <p className="text-[11px] uppercase tracking-wide text-primary-500 mb-1">Available Balance</p>
                  <p className="text-lg font-bold text-primary-700">
                    ${result.newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full sm:w-auto px-7 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Start New Transfer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Summary ───────────────────────────────────────────────────────────────────
  if (step === 'summary') {
    const rows = [
      { label: 'Beneficiary Name',  value: form.beneficiaryName },
      { label: 'Street Address',    value: form.beneficiaryAddress },
      { label: 'City',              value: form.beneficiaryCity },
      { label: 'Country',           value: form.beneficiaryCountry },
      { label: 'Bank Name',         value: form.bankName },
      { label: 'Account / IBAN',    value: form.accountNumber },
      { label: 'SWIFT / BIC',       value: form.swiftCode },
      ...(form.narration ? [{ label: 'Narration', value: form.narration }] : []),
    ];

    return (
      <>
        <div className="w-full">
          <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
              <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-secondary-900">Review Transfer</h2>
                <p className="text-xs text-secondary-500">Confirm details before sending</p>
              </div>
            </div>

            <div className="p-6 space-y-5">

              {/* Amount highlight */}
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-center">
                <p className="text-xs text-secondary-500 mb-1">You are sending</p>
                <p className="text-3xl font-bold text-primary-700">
                  ${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-secondary-400 mt-1">via International Wire Transfer (SWIFT)</p>
              </div>

              {/* Details */}
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
                  Please verify all details carefully. Wire transfers cannot be reversed once submitted.
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
          title="Authorize Wire Transfer"
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
            <Globe className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">Wire Transfer</h2>
            <p className="text-xs text-secondary-500">Send funds internationally via SWIFT</p>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Notice */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
            <Globe className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              Wire transfers are subject to review. Funds typically settle within 3–5 business days.
            </p>
          </div>

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
                min="10"
                className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-secondary-400 mt-1">Minimum transfer: $10.00</p>
          </div>

          {/* Beneficiary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-secondary-400" />
              <h3 className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Beneficiary Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Full Legal Name</label>
                <input
                  type="text"
                  value={form.beneficiaryName}
                  onChange={e => update('beneficiaryName', e.target.value)}
                  placeholder="As it appears on their bank account"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-secondary-400" />
                  Street Address
                </label>
                <input
                  type="text"
                  value={form.beneficiaryAddress}
                  onChange={e => update('beneficiaryAddress', e.target.value)}
                  placeholder="Beneficiary's street address"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">City</label>
                  <input
                    type="text"
                    value={form.beneficiaryCity}
                    onChange={e => update('beneficiaryCity', e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={form.beneficiaryCountry}
                    onChange={e => update('beneficiaryCountry', e.target.value)}
                    placeholder="Country"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-secondary-400" />
              <h3 className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Bank Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={e => update('bankName', e.target.value)}
                  placeholder="Recipient's bank name"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Account Number / IBAN</label>
                  <input
                    type="text"
                    value={form.accountNumber}
                    onChange={e => update('accountNumber', e.target.value)}
                    placeholder="Account number or IBAN"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    <Hash className="w-3.5 h-3.5 inline mr-1 text-secondary-400" />
                    SWIFT / BIC Code
                    <span className="ml-1 text-xs text-secondary-400 font-normal">(8 or 11 chars)</span>
                  </label>
                  <input
                    type="text"
                    value={form.swiftCode}
                    onChange={e => update('swiftCode', e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 11))}
                    placeholder="e.g. CHASUS33"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                  />
                  <p className="text-xs text-secondary-400 mt-1">Found on your bank's website or statements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Narration / Purpose
              <span className="ml-1 text-xs text-secondary-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.narration}
              onChange={e => update('narration', e.target.value)}
              placeholder="e.g. Invoice payment, family support..."
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

export default WireTransfer;