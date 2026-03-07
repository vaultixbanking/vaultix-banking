import { useState } from 'react';
import { Send, Globe, AlertCircle, Check, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

const WireTransfer = () => {
  const [form, setForm] = useState({
    amount: '',
    beneficiaryName: '',
    beneficiaryAddress: '',
    beneficiaryCity: '',
    beneficiaryCountry: '',
    bankName: '',
    accountNumber: '',
    swiftCode: '',
    narration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Enter a valid amount');
    if (!form.beneficiaryName.trim()) return setError('Enter beneficiary name');
    if (!form.beneficiaryAddress.trim()) return setError('Enter beneficiary address');
    if (!form.beneficiaryCity.trim()) return setError('Enter beneficiary city');
    if (!form.beneficiaryCountry.trim()) return setError('Enter beneficiary country');
    if (!form.bankName.trim()) return setError('Enter bank name');
    if (!form.accountNumber.trim()) return setError('Enter account number or IBAN');
    if (!form.swiftCode.trim()) return setError('Enter SWIFT/BIC code');
    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(form.swiftCode.toUpperCase())) {
      return setError('SWIFT/BIC code must be 8 or 11 characters (e.g. CHASUS33)');
    }

    setLoading(true);
    try {
      await api('/api/transactions/withdraw', {
        method: 'POST',
        body: {
          amount: parseFloat(form.amount),
          withdrawalType: 'BANK',
          details: { ...form, amount: undefined },
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      amount: '',
      beneficiaryName: '',
      beneficiaryAddress: '',
      beneficiaryCity: '',
      beneficiaryCountry: '',
      bankName: '',
      accountNumber: '',
      swiftCode: '',
      narration: '',
    });
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="w-full text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Wire Transfer Submitted!</h2>
        <p className="text-secondary-500 mb-2">
          Your wire transfer of{' '}
          <span className="font-semibold">${parseFloat(form.amount).toLocaleString()}</span> is being processed.
        </p>
        <p className="text-xs text-secondary-400 mb-6">
          International wire transfers typically settle within 3–5 business days.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          New Transfer
        </button>
      </div>
    );
  }

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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
            <Send className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700">
              Wire transfers are subject to review and may take 3–5 business days to settle.
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
              <input
                type="number"
                value={form.amount}
                onChange={e => update('amount', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Section: Beneficiary Info */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3">
              Beneficiary Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.beneficiaryName}
                  onChange={e => update('beneficiaryName', e.target.value)}
                  placeholder="Beneficiary's full legal name"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={form.beneficiaryAddress}
                  onChange={e => update('beneficiaryAddress', e.target.value)}
                  placeholder="Street address"
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

          {/* Section: Bank Details */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3">
              Bank Details
            </h3>
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
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Account Number / IBAN
                  </label>
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
              Narration / Purpose of Transfer
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              : 'Send Wire Transfer'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default WireTransfer;