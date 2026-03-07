import { useState, useEffect } from 'react';
import { Wallet, Loader2, Check, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface DepositMethod {
  id: string;
  method: string;
  details: string;
}

const cryptoOptions = [
  { value: 'btc', label: 'Bitcoin', icon: '₿' },
  { value: 'eth', label: 'Ethereum', icon: 'Ξ' },
  { value: 'ltc', label: 'Litecoin', icon: 'Ł' },
  { value: 'usdt', label: 'USDT (Tether)', icon: '₮' },
];

const AdminDeposit = () => {
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [walletAddress, setWalletAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ success: boolean; data: DepositMethod[] }>('/api/admin/deposit-methods');
      setMethods(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!walletAddress.trim()) { setError('Enter a wallet address'); return; }

    setSaving(true);
    try {
      await adminApi('/api/admin/deposit-methods', {
        method: 'POST',
        body: { method: selectedCrypto, details: walletAddress.trim() },
      });
      setSuccess(`${cryptoOptions.find(c => c.value === selectedCrypto)?.label} address updated!`);
      setWalletAddress('');
      fetchMethods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const copyAddress = (details: string, method: string) => {
    navigator.clipboard.writeText(details);
    setCopied(method);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Manage Deposit Addresses</h3>
            <p className="text-xs text-slate-500">Set wallet addresses for crypto deposits</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Crypto Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cryptoOptions.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedCrypto(c.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedCrypto === c.value
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-primary-300'
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              placeholder="Enter or paste wallet address..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Update Address
          </button>
        </form>
      </div>

      {/* Current Methods */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Current Deposit Addresses</h3>
          <button onClick={fetchMethods} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No deposit methods configured</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {methods.map(m => {
              const crypto = cryptoOptions.find(c => c.value === m.method);
              return (
                <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg shrink-0">
                    {crypto?.icon || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{crypto?.label || m.method.toUpperCase()}</p>
                    <p className="text-xs text-slate-500 font-mono truncate">{m.details || 'Not set'}</p>
                  </div>
                  {m.details && (
                    <button onClick={() => copyAddress(m.details, m.method)} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-primary-600 transition-colors">
                      {copied === m.method ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
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

export default AdminDeposit;
