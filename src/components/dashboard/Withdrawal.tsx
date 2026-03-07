import { useState } from 'react';
import {
  ArrowUpFromLine, AlertCircle, Check, ChevronRight,
  ChevronLeft, Sparkles, Bitcoin, Banknote
} from 'lucide-react';
import { api } from '../../lib/api';
import TransactionPinModal from './TransactionPinModal';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'crypto' | 'bank';
type Step = 'form' | 'summary' | 'success';

interface SuccessData {
  transactionId: string;
  newBalance: number;
  amount: number;
}

const cryptoOptions = [
  { value: 'bitcoin',  label: 'Bitcoin',  symbol: 'BTC', icon: '₿' },
  { value: 'ethereum', label: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  { value: 'litecoin', label: 'Litecoin', symbol: 'LTC', icon: 'Ł' },
  { value: 'usdt',     label: 'Tether',   symbol: 'USDT', icon: '₮' },
];

const cryptoNetworks: Record<string, string[]> = {
  bitcoin:  ['Bitcoin Network'],
  ethereum: ['ERC20', 'BEP20'],
  litecoin: ['Litecoin Network', 'BEP20'],
  usdt:     ['TRC20', 'ERC20', 'BEP20', 'SOL'],
};

// ─── Component ─────────────────────────────────────────────────────────────────
const Withdrawal = () => {
  const [tab, setTab]   = useState<Tab>('crypto');
  const [step, setStep] = useState<Step>('form');

  // ── Crypto fields ────────────────────────────────────────────────────────────
  const [cryptoAmount, setCryptoAmount]     = useState('');
  const [cryptoType, setCryptoType]         = useState('bitcoin');
  const [walletAddress, setWalletAddress]   = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('Bitcoin Network');
  const [customNetwork, setCustomNetwork]   = useState('');
  const [isCustomNetwork, setIsCustomNetwork] = useState(false);

  // ── Bank fields ──────────────────────────────────────────────────────────────
  const [bankAmount, setBankAmount]           = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [bankName, setBankName]               = useState('');
  const [accountNumber, setAccountNumber]     = useState('');
  const [routingNumber, setRoutingNumber]     = useState('');

  // ── State ────────────────────────────────────────────────────────────────────
  const [error, setError]       = useState('');
  const [pinOpen, setPinOpen]   = useState(false);
  const [success, setSuccess]   = useState<SuccessData | null>(null);

  // ─── Crypto helpers ───────────────────────────────────────────────────────────
  const handleCryptoTypeChange = (type: string) => {
    setCryptoType(type);
    const nets = cryptoNetworks[type] || [];
    setSelectedNetwork(nets[0] || '');
    setIsCustomNetwork(false);
    setCustomNetwork('');
  };

  const handleNetworkChange = (value: string) => {
    if (value === 'other') {
      setIsCustomNetwork(true);
      setSelectedNetwork('');
    } else {
      setIsCustomNetwork(false);
      setSelectedNetwork(value);
      setCustomNetwork('');
    }
  };

  const activeNetwork = isCustomNetwork ? customNetwork : selectedNetwork;
  const activeAmount  = tab === 'crypto' ? cryptoAmount : bankAmount;
  const amt           = parseFloat(activeAmount) || 0;

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (tab === 'crypto') {
      if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) return 'Enter a valid amount.';
      if (!walletAddress.trim()) return 'Enter your wallet address.';
      if (!activeNetwork.trim()) return 'Select or enter a network.';
    } else {
      if (!bankAmount || parseFloat(bankAmount) <= 0) return 'Enter a valid amount.';
      if (!beneficiaryName.trim()) return 'Enter beneficiary name.';
      if (!bankName.trim()) return 'Enter bank name.';
      if (!accountNumber.trim()) return 'Enter account number.';
      if (!/^\d{9}$/.test(routingNumber)) return 'Routing number must be exactly 9 digits.';
    }
    return null;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError('');
    setStep('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── PIN submit → API ─────────────────────────────────────────────────────────
  const handlePinSubmit = async (pin: string) => {
    const body = tab === 'crypto'
      ? {
          pin,
          amount: parseFloat(cryptoAmount),
          withdrawalType: 'CRYPTO' as const,
          details: { cryptoType, walletAddress, network: activeNetwork },
        }
      : {
          pin,
          amount: parseFloat(bankAmount),
          withdrawalType: 'BANK' as const,
          details: {
            transferType: 'BANK_WITHDRAWAL',
            beneficiaryName,
            bankName,
            accountNumber,
            routingNumber,
          },
        };

    const res = await api<{ success: boolean; data: SuccessData }>(
      '/api/transactions/withdraw',
      { method: 'POST', body }
    );
    setSuccess(res.data);
    setPinOpen(false);
    setStep('success');
  };

  // ─── Reset ────────────────────────────────────────────────────────────────────
  const reset = () => {
    setCryptoAmount(''); setCryptoType('bitcoin'); setWalletAddress('');
    setSelectedNetwork('Bitcoin Network'); setCustomNetwork(''); setIsCustomNetwork(false);
    setBankAmount(''); setBeneficiaryName(''); setBankName('');
    setAccountNumber(''); setRoutingNumber('');
    setStep('form'); setSuccess(null); setError('');
  };

  const maskedAccount = accountNumber ? `••••${accountNumber.slice(-4)}` : '';
  const selectedCrypto = cryptoOptions.find(c => c.value === cryptoType);
  const availableNetworks = cryptoNetworks[cryptoType] || [];

  // ─── Success ───────────────────────────────────────────────────────────────────
  if (step === 'success' && success) {
    const isCrypto = tab === 'crypto';
    return (
      <div className="w-full">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 rounded-2xl shadow-xl shadow-primary-500/20 text-white">

          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/5 rounded-full" />
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

            <h2 className="text-2xl font-bold mb-1">Withdrawal Successful!</h2>
            <p className="text-primary-200 text-sm mb-6">
              Your {isCrypto ? 'crypto' : 'bank'} withdrawal has been processed
            </p>

            {/* Amount pill */}
            <div className="inline-block bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-8 py-4 mb-6">
              <p className="text-xs text-primary-200 mb-0.5">Amount Withdrawn</p>
              <p className="text-3xl font-bold tracking-tight">
                ${success.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Details card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6 text-left space-y-3">

              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-xs">Type</span>
                <span className="text-white text-sm font-semibold capitalize">
                  {isCrypto ? `${selectedCrypto?.label} (${selectedCrypto?.symbol})` : 'Bank Withdrawal'}
                </span>
              </div>
              <div className="h-px bg-white/10" />

              {isCrypto ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-200 text-xs">Network</span>
                    <span className="text-white text-sm font-medium">{activeNetwork}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-primary-200 text-xs shrink-0">Wallet</span>
                    <span className="text-white text-xs font-mono break-all text-right">{walletAddress}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-200 text-xs">Beneficiary</span>
                    <span className="text-white text-sm font-medium">{beneficiaryName}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-primary-200 text-xs">Bank</span>
                    <span className="text-white text-sm font-medium">{bankName}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-primary-200 text-xs">Account</span>
                    <span className="text-white text-sm font-mono">{maskedAccount}</span>
                  </div>
                </>
              )}

              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-xs">Transaction ID</span>
                <span className="text-white text-xs font-mono">{success.transactionId}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-primary-200 text-xs">New Balance</span>
                <span className="text-green-300 text-sm font-bold">
                  ${success.newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <p className="text-xs text-primary-300 mb-6">
              {isCrypto
                ? '⛓️ Crypto transactions are processed on-chain and may take a few minutes'
                : '🕐 Bank withdrawals typically process within 1–3 business days'}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl text-sm font-semibold transition-all"
              >
                New Withdrawal
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 py-3 bg-white text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-50 transition-all"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Summary ───────────────────────────────────────────────────────────────────
  if (step === 'summary') {
    const rows = tab === 'crypto'
      ? [
          { label: 'Cryptocurrency', value: `${selectedCrypto?.label} (${selectedCrypto?.symbol})` },
          { label: 'Network',        value: activeNetwork },
          { label: 'Wallet Address', value: walletAddress, mono: true },
        ]
      : [
          { label: 'Beneficiary',    value: beneficiaryName },
          { label: 'Bank',           value: bankName },
          { label: 'Account',        value: maskedAccount },
          { label: 'Routing',        value: routingNumber },
        ];

    return (
      <>
        <div className="w-full">
          <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
              <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
                <ArrowUpFromLine className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-secondary-900">Review Withdrawal</h2>
                <p className="text-xs text-secondary-500">Confirm your withdrawal details</p>
              </div>
            </div>

            <div className="p-6 space-y-5">

              {/* Amount highlight */}
              <div className={`rounded-2xl p-5 text-center border ${
                tab === 'crypto'
                  ? 'bg-orange-50 border-orange-100'
                  : 'bg-primary-50 border-primary-100'
              }`}>
                <p className="text-xs text-secondary-500 mb-1">You are withdrawing</p>
                <p className={`text-3xl font-bold ${tab === 'crypto' ? 'text-orange-600' : 'text-primary-700'}`}>
                  ${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-secondary-400 mt-1">
                  {tab === 'crypto' ? `via ${selectedCrypto?.label} · ${activeNetwork}` : 'via Bank Transfer (ACH)'}
                </p>
              </div>

              {/* Details */}
              <div className="border border-secondary-100 rounded-xl overflow-hidden divide-y divide-secondary-100">
                {rows.map(row => (
                  <div key={row.label} className="flex items-start justify-between px-4 py-3 gap-4">
                    <span className="text-sm text-secondary-500 shrink-0">{row.label}</span>
                    <span className={`text-sm font-medium text-secondary-900 text-right break-all ${row.mono ? 'font-mono text-xs' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  {tab === 'crypto'
                    ? 'Double-check the wallet address and network. Crypto transactions cannot be reversed.'
                    : 'Verify all bank details carefully. Withdrawals cannot be reversed once submitted.'}
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
          title="Authorize Withdrawal"
          subtitle={`Enter your PIN to withdraw $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
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
            <ArrowUpFromLine className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">Withdrawal</h2>
            <p className="text-xs text-secondary-500">Withdraw funds via crypto or bank transfer</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary-100">
          {(['crypto', 'bank'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-2 ${
                tab === t
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {t === 'crypto'
                ? <><Bitcoin className="w-4 h-4" /> Crypto</>
                : <><Banknote className="w-4 h-4" /> Bank Transfer</>
              }
            </button>
          ))}
        </div>

        <form onSubmit={handleReview} className="p-6 space-y-5">

          {/* ── Crypto Tab ──────────────────────────────────────────────────── */}
          {tab === 'crypto' && (
            <>
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
                  <input
                    type="number"
                    value={cryptoAmount}
                    onChange={e => { setCryptoAmount(e.target.value); setError(''); }}
                    placeholder="0.00"
                    min="1"
                    className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Crypto selector */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Cryptocurrency</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {cryptoOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleCryptoTypeChange(opt.value)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        cryptoType === opt.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 hover:border-primary-300 text-secondary-600'
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{opt.icon}</span>
                      <span className="text-xs font-semibold block">{opt.label}</span>
                      <span className="text-xs text-secondary-400">{opt.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Network */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Network</label>
                {cryptoType === 'bitcoin' ? (
                  <div className="w-full px-4 py-3 border border-secondary-200 rounded-xl bg-secondary-50 text-secondary-600 text-sm">
                    Bitcoin Network <span className="text-secondary-400 text-xs ml-1">(fixed)</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={isCustomNetwork ? 'other' : selectedNetwork}
                      onChange={e => { handleNetworkChange(e.target.value); setError(''); }}
                      className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      {availableNetworks.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                      <option value="other">Other (type manually)</option>
                    </select>
                    {isCustomNetwork && (
                      <input
                        type="text"
                        value={customNetwork}
                        onChange={e => { setCustomNetwork(e.target.value); setError(''); }}
                        placeholder="e.g. Polygon, Arbitrum"
                        className="w-full mt-2 px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </>
                )}
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Wrong network = permanently lost funds. Double-check before proceeding.
                </p>
              </div>

              {/* Wallet address */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Your Wallet Address</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={e => { setWalletAddress(e.target.value); setError(''); }}
                  placeholder="Paste your wallet address here"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </>
          )}

          {/* ── Bank Tab ────────────────────────────────────────────────────── */}
          {tab === 'bank' && (
            <>
              {/* Warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  Account name must match your Vaultix registered name for successful processing.
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
                  <input
                    type="number"
                    value={bankAmount}
                    onChange={e => { setBankAmount(e.target.value); setError(''); }}
                    placeholder="0.00"
                    min="1"
                    className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Beneficiary + Bank name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Beneficiary Name</label>
                  <input
                    type="text"
                    value={beneficiaryName}
                    onChange={e => { setBeneficiaryName(e.target.value); setError(''); }}
                    placeholder="Full legal name"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => { setBankName(e.target.value); setError(''); }}
                    placeholder="e.g. Chase, Wells Fargo"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Account + Routing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => { setAccountNumber(e.target.value); setError(''); }}
                    placeholder="Bank account number"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Routing Number
                    <span className="ml-1 text-xs text-secondary-400 font-normal">(9 digits)</span>
                  </label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={e => { setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9)); setError(''); }}
                    placeholder="e.g. 021000021"
                    maxLength={9}
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                  />
                  <p className="text-xs text-secondary-400 mt-1">Bottom left of your check</p>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Review button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
          >
            Review Withdrawal
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdrawal;