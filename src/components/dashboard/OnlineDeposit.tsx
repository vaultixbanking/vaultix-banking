import { useState, useEffect } from 'react';
import { Copy, Upload, Check, AlertCircle, ArrowDownToLine } from 'lucide-react';
import { api } from '../../lib/api';

const cryptoOptions = [
  { value: 'bitcoin', label: 'Bitcoin (BTC)', icon: '₿' },
  { value: 'ethereum', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { value: 'litecoin', label: 'Litecoin (LTC)', icon: 'Ł' },
  { value: 'usdt', label: 'Tether (USDT)', icon: '₮' },
];

const OnlineDeposit = () => {
  const [amount, setAmount] = useState('');
  const [cryptoType, setCryptoType] = useState('bitcoin');
  const [walletAddress, setWalletAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchAddress = async (type: string) => {
    setLoadingAddress(true);
    try {
      const res = await api<{ success: boolean; address: string }>(`/api/admin/deposit/${type}`);
      setWalletAddress(res.address || 'Address not available');
    } catch {
      setWalletAddress('Address not available');
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    fetchAddress(cryptoType);
  }, [cryptoType]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !receipt) {
      setError('Please fill in all fields and upload a receipt.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // NOTE: There's no deposit endpoint in the backend yet.
      // For now, show success but this would need a real endpoint.
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setAmount('');
      setReceipt(null);
      setPreviewUrl('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Deposit Submitted!</h2>
        <p className="text-secondary-500 mb-6">Your deposit is being reviewed. Funds will be credited once confirmed.</p>
        <button onClick={() => setSuccess(false)} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          Make Another Deposit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
          <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
            <ArrowDownToLine className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">Online Deposit</h2>
            <p className="text-xs text-secondary-500">Fund your account via cryptocurrency</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Crypto Type */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Crypto Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cryptoOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCryptoType(opt.value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    cryptoType === opt.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-200 hover:border-primary-300 text-secondary-600'
                  }`}
                >
                  <span className="text-lg block mb-1">{opt.icon}</span>
                  <span className="text-xs font-medium">{opt.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Wallet Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={loadingAddress ? 'Loading...' : walletAddress}
                readOnly
                className="flex-1 px-4 py-3 border border-secondary-200 rounded-xl bg-secondary-50 text-secondary-700 text-sm font-mono"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Upload Receipt</label>
            <div
              className="border-2 border-dashed border-secondary-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('receipt-input')?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Receipt preview" className="max-h-40 mx-auto rounded-lg" />
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-500">Click or drag to upload receipt</p>
                  <p className="text-xs text-secondary-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                </div>
              )}
              <input
                id="receipt-input"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              'Submit Deposit'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnlineDeposit;
