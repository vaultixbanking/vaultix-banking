import { useState, useEffect } from 'react';
import { Copy, Upload, Check, AlertCircle, ArrowDownToLine, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const cryptoOptions = [
  { value: 'bitcoin', label: 'Bitcoin', symbol: 'BTC', icon: '₿', networkHint: 'BTC Network' },
  { value: 'ethereum', label: 'Ethereum', symbol: 'ETH', icon: 'Ξ', networkHint: 'ERC20' },
  { value: 'litecoin', label: 'Litecoin', symbol: 'LTC', icon: 'Ł', networkHint: 'LTC Network' },
  { value: 'usdt', label: 'Tether', symbol: 'USDT', icon: '₮', networkHint: 'TRC20 / ERC20' },
];

interface DepositInfo {
  address: string;
  network: string;
}

interface DepositAddressResponse {
  success: boolean;
  message: string;
  data: {
    address: string;
    network: string;
  };
}

const OnlineDeposit = () => {
  const [amount, setAmount]                 = useState('');
  const [cryptoType, setCryptoType]         = useState('bitcoin');
  const [depositInfo, setDepositInfo]       = useState<DepositInfo>({ address: '', network: '' });
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [receipt, setReceipt]               = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]         = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [success, setSuccess]               = useState(false);
  const [successData, setSuccessData]       = useState<{ requestId: string; amount: number } | null>(null);
  const [error, setError]                   = useState('');

  // ─── Fetch wallet address + network whenever crypto changes ───────────────
  const fetchDepositInfo = async (type: string) => {
    setLoadingAddress(true);
    setDepositInfo({ address: '', network: '' });
    setError('');
    try {
      const res = await api<DepositAddressResponse>(
        `/api/admin/deposit/${type}`
      );

      const address = res.data?.address?.trim();
      const network = res.data?.network?.trim() || '';

      setDepositInfo({
        address: address || 'Address not available',
        network,
      });

      if (!address) {
        setError('Wallet address is unavailable for this asset.');
      }
    } catch {
      setDepositInfo({ address: 'Address not available', network: '' });
      setError('Failed to load wallet address. Please try again.');
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    fetchDepositInfo(cryptoType);
  }, [cryptoType]);

  // ─── Copy address ──────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!depositInfo.address || depositInfo.address === 'Address not available') return;
    try {
      await navigator.clipboard.writeText(depositInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silently
    }
  };

  // ─── Receipt file picker ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ─── Submit deposit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount.');
    if (!receipt) return setError('Please upload a payment receipt.');
    if (depositInfo.address === 'Address not available') {
      return setError('Wallet address is unavailable. Please try again.');
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('vaultix_token');

      // Use FormData because we're uploading a file
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('cryptoType', cryptoType);
      formData.append('network', depositInfo.network);
      formData.append('walletAddress', depositInfo.address);
      formData.append('receipt', receipt);

      // Can't use the api() helper for file uploads — fetch directly
      const response = await fetch(`${API_URL}/api/deposits`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Do NOT set Content-Type — browser sets it with boundary for FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Deposit submission failed.');
      }

      setSuccessData({ requestId: data.data.requestId, amount: data.data.amount });
      setSuccess(true);
      setAmount('');
      setReceipt(null);
      setPreviewUrl('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deposit submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full text-center py-16 px-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Deposit Submitted!</h2>
        <p className="text-secondary-500 mb-2">
          Your deposit request has been received and is under review.
        </p>
        <p className="text-secondary-400 text-sm mb-1">
          Funds will be credited once our team confirms your transaction.
        </p>
        {successData && (
          <div className="mt-4 inline-flex flex-col items-center gap-1 bg-secondary-50 border border-secondary-200 rounded-xl px-6 py-4">
            <p className="text-xs text-secondary-400">Request ID</p>
            <p className="text-sm font-mono font-semibold text-secondary-700">{successData.requestId}</p>
            <p className="text-xs text-secondary-400 mt-2">Amount</p>
            <p className="text-sm font-bold text-primary-600">${successData.amount.toLocaleString()}</p>
          </div>
        )}
        <div className="mt-6">
          <button
            onClick={() => { setSuccess(false); setSuccessData(null); }}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Make Another Deposit
          </button>
        </div>
      </div>
    );
  }

  const selectedCrypto = cryptoOptions.find(c => c.value === cryptoType);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">

        {/* Header */}
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

          {/* Crypto Selector */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Select Cryptocurrency</label>
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
                  <span className="text-xs font-semibold block">{opt.label}</span>
                  <span className="text-xs text-secondary-400">{opt.symbol}</span>
                  <span className="text-[10px] text-secondary-400 block mt-0.5">{opt.networkHint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network Badge */}
          {!loadingAddress && (depositInfo.network || selectedCrypto?.networkHint) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary-500">Network:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {depositInfo.network || selectedCrypto?.networkHint}
              </span>
              {cryptoType === 'bitcoin' && (
                <span className="text-xs text-secondary-400">(fixed network)</span>
              )}
            </div>
          )}

          {/* Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              {selectedCrypto?.label} Wallet Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={loadingAddress ? 'Fetching address...' : depositInfo.address}
                readOnly
                className="w-full px-4 py-3 pr-12 border border-secondary-200 rounded-xl bg-secondary-50 text-secondary-700 text-sm font-mono truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                title="Copy address"
                disabled={loadingAddress}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-secondary-400 hover:text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-40"
              >
                {copied
                  ? <Check className="w-4 h-4 text-green-500" />
                  : <Copy className="w-4 h-4" />
                }
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Address copied to clipboard
              </p>
            )}
            <p className="text-xs text-secondary-400 mt-1">
              Only send {selectedCrypto?.symbol} to this address. Sending other assets may result in permanent loss.
            </p>
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Upload Payment Receipt <span className="text-red-400">*</span>
            </label>
            <div
              className="border-2 border-dashed border-secondary-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('receipt-input')?.click()}
            >
              {previewUrl ? (
                <div>
                  <img src={previewUrl} alt="Receipt preview" className="max-h-40 mx-auto rounded-lg mb-2" />
                  <p className="text-xs text-secondary-500">{receipt?.name}</p>
                  <p className="text-xs text-primary-600 mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 font-medium">Click to upload receipt</p>
                  <p className="text-xs text-secondary-400 mt-1">PNG, JPG, PDF — max 5MB</p>
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
            disabled={submitting || loadingAddress}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
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