import { useState } from 'react';
import { ArrowRightLeft, AlertCircle, Check, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

const DomesticTransfer = () => {
  const [form, setForm] = useState({
    amount: '',
    beneficiaryName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'savings',
    narration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Enter a valid amount');
    if (!form.beneficiaryName.trim()) return setError('Enter beneficiary name');
    if (!form.bankName.trim()) return setError('Enter bank name');
    if (!form.accountNumber.trim()) return setError('Enter account number');

    setLoading(true);
    try {
      await api('/api/transactions/withdraw', {
        method: 'POST',
        body: {
          amount: parseFloat(form.amount),
          withdrawalType: 'domestic',
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

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Transfer Submitted!</h2>
        <p className="text-secondary-500 mb-2">Your domestic transfer of <span className="font-semibold">${parseFloat(form.amount).toLocaleString()}</span> is being processed.</p>
        <p className="text-xs text-secondary-400 mb-6">Domestic transfers typically settle within 1-2 business days.</p>
        <button onClick={() => { setForm({ amount: '', beneficiaryName: '', bankName: '', accountNumber: '', accountType: 'savings', narration: '' }); setSuccess(false); }} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          New Transfer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
          <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">Domestic Transfer</h2>
            <p className="text-xs text-secondary-500">Transfer funds to any local bank account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
              <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
            </div>
          </div>

          {/* Beneficiary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Beneficiary Name</label>
              <input type="text" value={form.beneficiaryName} onChange={e => update('beneficiaryName', e.target.value)} placeholder="Full name" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Name</label>
              <input type="text" value={form.bankName} onChange={e => update('bankName', e.target.value)} placeholder="Bank name" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Account Number</label>
            <input type="text" value={form.accountNumber} onChange={e => update('accountNumber', e.target.value)} placeholder="Account number" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Account Type</label>
            <div className="flex gap-3">
              {['savings', 'checking', 'current'].map(t => (
                <button key={t} type="button" onClick={() => update('accountType', t)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${form.accountType === t ? 'bg-primary-600 text-white border-primary-600' : 'border-secondary-200 text-secondary-600 hover:border-primary-300'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Narration / Description</label>
            <textarea value={form.narration} onChange={e => update('narration', e.target.value)} placeholder="Purpose of transfer..." rows={3} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Send Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DomesticTransfer;
