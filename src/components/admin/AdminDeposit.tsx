import { useState, useEffect } from 'react';
import { Wallet, Loader2, Check, AlertCircle, RefreshCw, Copy, Globe } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface DepositMethod {
  id: string;
  method: string;
  details: string;
  network: string;
}

const cryptoOptions = [
  { value: 'btc',  label: 'Bitcoin',       icon: '₿', defaultNetwork: 'Bitcoin Network' },
  { value: 'eth',  label: 'Ethereum',      icon: 'Ξ', defaultNetwork: 'ERC20' },
  { value: 'ltc',  label: 'Litecoin',      icon: 'Ł', defaultNetwork: 'Litecoin Network' },
  { value: 'usdt', label: 'USDT (Tether)', icon: '₮', defaultNetwork: 'TRC20' },
];

const networkOptions: Record<string, string[]> = {
  btc:  ['Bitcoin Network'],
  eth:  ['ERC20', 'BEP20'],
  ltc:  ['Litecoin Network'],
  usdt: ['TRC20', 'ERC20', 'BEP20', 'SOL'],
};

const AdminDeposit = () => {
  const [methods, setMethods]           = useState<DepositMethod[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [walletAddress, setWalletAddress]   = useState('');
  const [network, setNetwork]           = useState('Bitcoin Network');
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState('');
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState('');

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

  // When crypto changes, reset network to its default
  useEffect(() => {
    const crypto = cryptoOptions.find(c => c.value === selectedCrypto);
    setNetwork(crypto?.defaultNetwork || '');
  }, [selectedCrypto]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!walletAddress.trim()) return setError('Enter a wallet address.');
    if (!network.trim()) return setError('Enter a network.');

    setSaving(true);
    try {
      await adminApi('/api/admin/deposit-methods', {
        method: 'POST',
        body: {
          method: selectedCrypto,
          details: walletAddress.trim(),
          network: network.trim(),
        },
      });
      const label = cryptoOptions.find(c => c.value === selectedCrypto)?.label;
      setSuccess(`${label} address and network updated successfully!`);
      setWalletAddress('');
      fetchMethods();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyAddress = (details: string, method: string) => {
    navigator.clipboard.writeText(details);
    setCopied(method);
    setTimeout(() => setCopied(''), 2000);
  };

  const availableNetworks = networkOptions[selectedCrypto] || [];

  return (
    <div className="space-y-6">

      {/* ── Form ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Manage Deposit Addresses</h3>
            <p className="text-xs text-slate-500">Set wallet address and network for each cryptocurrency</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">

          {/* Crypto Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cryptocurrency</label>
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

          {/* Network */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Network
            </label>
            {availableNetworks.length > 1 ? (
              // Dropdown for cryptos with multiple network options
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {availableNetworks.map(net => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setNetwork(net)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        network === net
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
                {/* Also allow manual override */}
                <input
                  type="text"
                  value={network}
                  onChange={e => setNetwork(e.target.value)}
                  placeholder="Or type custom network..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            ) : (
              // Single fixed network — show as read-only badge + allow override
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700 font-medium">{availableNetworks[0]}</span>
                  <span className="text-xs text-slate-400 ml-1">(fixed)</span>
                </div>
                <input
                  type="text"
                  value={network}
                  onChange={e => setNetwork(e.target.value)}
                  placeholder="Override network name if needed..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              placeholder="Enter or paste wallet address..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-mono"
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

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Address & Network
          </button>
        </form>
      </div>

      {/* ── Current Methods ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Current Deposit Addresses</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live addresses shown to users on the deposit page</p>
          </div>
          <button
            onClick={fetchMethods}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : methods.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No deposit methods configured yet
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {methods.map(m => {
              const crypto = cryptoOptions.find(c => c.value === m.method);
              return (
                <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {crypto?.icon || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {crypto?.label || m.method.toUpperCase()}
                      </p>
                      {m.network && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {m.network}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {m.details || 'Address not set'}
                    </p>
                  </div>
                  {m.details && (
                    <button
                      onClick={() => copyAddress(m.details, m.method)}
                      className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-primary-600 transition-colors shrink-0"
                      title="Copy address"
                    >
                      {copied === m.method
                        ? <Check className="w-4 h-4 text-green-600" />
                        : <Copy className="w-4 h-4" />
                      }
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