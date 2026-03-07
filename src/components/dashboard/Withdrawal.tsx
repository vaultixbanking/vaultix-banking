import { useState, useCallback } from 'react';
import { ArrowUpFromLine, AlertCircle, Check, X, Delete, Lock } from 'lucide-react';
import { api } from '../../lib/api';

type WithdrawalTab = 'crypto' | 'bank';

const cryptoNetworks: Record<string, string[]> = {
  bitcoin: ['Bitcoin Network'],
  ethereum: ['ERC20', 'BEP20'],
  litecoin: ['Litecoin Network', 'BEP20'],
  usdt: ['ERC20', 'TRC20', 'BEP20', 'SOL'],
};

const Withdrawal = () => {
  const [tab, setTab] = useState<WithdrawalTab>('crypto');
  const [step, setStep] = useState<'form' | 'summary' | 'pin'>('form');

  // Crypto form
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoType, setCryptoType] = useState('bitcoin');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('Bitcoin Network');
  const [customNetwork, setCustomNetwork] = useState('');
  const [isCustomNetwork, setIsCustomNetwork] = useState(false);

  // Bank form
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [bankAmount, setBankAmount] = useState('');

  // PIN
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // State
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ transactionId: string; newBalance: number; amount: number } | null>(null);

  const handleCryptoTypeChange = (type: string) => {
    setCryptoType(type);
    const networks = cryptoNetworks[type] || [];
    setSelectedNetwork(networks[0] || '');
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

  const getActiveNetwork = () => isCustomNetwork ? customNetwork : selectedNetwork;

  const getFormData = () => {
    if (tab === 'crypto') {
      return {
        amount: parseFloat(cryptoAmount),
        withdrawalType: 'CRYPTO' as const,
        details: { cryptoType, walletAddress, network: getActiveNetwork() },
      };
    }
    return {
      amount: parseFloat(bankAmount),
      withdrawalType: 'BANK' as const,
      details: { beneficiaryName, bankName, accountNumber, routingNumber },
    };
  };

  const validateForm = () => {
    if (tab === 'crypto') {
      if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) return 'Enter a valid amount';
      if (!walletAddress.trim()) return 'Enter your wallet address';
      if (!getActiveNetwork().trim()) return 'Select or enter a network';
    } else {
      if (!bankAmount || parseFloat(bankAmount) <= 0) return 'Enter a valid amount';
      if (!beneficiaryName.trim()) return 'Enter beneficiary name';
      if (!bankName.trim()) return 'Enter bank name';
      if (!accountNumber.trim()) return 'Enter account number';
      if (!/^\d{9}$/.test(routingNumber)) return 'Routing number must be exactly 9 digits';
    }
    return null;
  };

  const handleShowSummary = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setError(err); return; }
    setError('');
    setStep('summary');
  };

  const handleConfirmTransaction = () => {
    setStep('pin');
    setPin('');
    setPinError('');
  };

  const handlePinKey = useCallback((digit: string) => {
    if (pin.length < 4) setPin(prev => prev + digit);
  }, [pin]);

  const handlePinDelete = useCallback(() => setPin(prev => prev.slice(0, -1)), []);

  const handleSubmitWithdrawal = useCallback(async () => {
    if (pin.length !== 4) { setPinError('Enter your 4-digit PIN'); return; }
    setSubmitting(true);
    setPinError('');
    try {
      const formData = getFormData();
      const res = await api<{ success: boolean; data: { transactionId: string; newBalance: number; amount: number } }>(
        '/api/transactions/withdraw',
        { method: 'POST', body: { pin, ...formData } }
      );
      setSuccess(res.data);
    } catch (err: unknown) {
      setPinError(err instanceof Error ? err.message : 'Withdrawal failed');
      setPin('');
    } finally {
      setSubmitting(false);
    }
  }, [pin, tab, cryptoAmount, cryptoType, walletAddress, selectedNetwork, customNetwork, bankAmount, beneficiaryName, bankName, accountNumber, routingNumber]);

  const resetForm = () => {
    setCryptoAmount(''); setCryptoType('bitcoin'); setWalletAddress('');
    setSelectedNetwork('Bitcoin Network'); setCustomNetwork(''); setIsCustomNetwork(false);
    setBeneficiaryName(''); setBankName(''); setAccountNumber('');
    setRoutingNumber(''); setBankAmount('');
    setPin(''); setStep('form'); setSuccess(null); setError('');
  };

  // ─── Success ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Withdrawal Successful!</h2>
        <div className="bg-secondary-50 rounded-xl p-4 mb-6 text-left max-w-sm mx-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondary-500">Transaction ID</span>
            <span className="font-mono font-semibold text-secondary-700 text-xs">{success.transactionId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary-500">Amount</span>
            <span className="font-semibold text-secondary-700">${success.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary-500">New Balance</span>
            <span className="font-semibold text-green-600">${success.newBalance.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={resetForm} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          New Withdrawal
        </button>
      </div>
    );
  }

  // ─── PIN Step ─────────────────────────────────────────────────────────────
  if (step === 'pin') {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'];
    return (
      <div className="w-full flex items-start justify-center py-8">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-secondary-900 mb-1">Enter PIN to Confirm</h3>
            <p className="text-xs text-secondary-500">Enter your 4-digit security PIN to authorize this withdrawal</p>
          </div>

          {/* PIN Dots */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-primary-600 scale-110' : 'bg-secondary-200 border-2 border-secondary-300'}`} />
            ))}
          </div>

          {pinError && <p className="text-center text-sm text-red-500 mb-4">{pinError}</p>}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {keys.map(key => {
              if (key === 'clear') return (
                <button key={key} type="button" onClick={() => { setPin(''); setPinError(''); }} disabled={submitting}
                  className="h-12 rounded-xl bg-secondary-50 hover:bg-red-50 text-red-500 text-sm font-medium transition-all active:scale-95 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              );
              if (key === 'delete') return (
                <button key={key} type="button" onClick={handlePinDelete} disabled={submitting}
                  className="h-12 rounded-xl bg-secondary-50 hover:bg-secondary-100 text-secondary-500 transition-all active:scale-95 flex items-center justify-center">
                  <Delete className="w-4 h-4" />
                </button>
              );
              return (
                <button key={key} type="button" onClick={() => handlePinKey(key)} disabled={submitting || pin.length >= 4}
                  className="h-12 rounded-xl bg-secondary-50 hover:bg-secondary-100 text-secondary-900 text-lg font-semibold transition-all active:scale-95">
                  {key}
                </button>
              );
            })}
          </div>

          <button onClick={handleSubmitWithdrawal} disabled={pin.length !== 4 || submitting}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing...</>
            ) : 'Confirm Withdrawal'}
          </button>
          <button onClick={() => setStep('summary')} className="w-full mt-2 py-2 text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
            ← Back to Summary
          </button>
        </div>
      </div>
    );
  }

  // ─── Summary Step ─────────────────────────────────────────────────────────
  if (step === 'summary') {
    const formData = getFormData();
    return (
      <div className="w-full flex items-start justify-center py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
            <h3 className="font-semibold text-primary-900">Review Transaction</h3>
            <p className="text-xs text-primary-600 mt-0.5">Please confirm the details below before proceeding</p>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between py-2 border-b border-secondary-50">
              <span className="text-sm text-secondary-500">Amount</span>
              <span className="text-sm font-semibold text-secondary-900">${formData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-secondary-50">
              <span className="text-sm text-secondary-500">Method</span>
              <span className="text-sm font-semibold text-secondary-900 capitalize">{tab} Withdrawal</span>
            </div>
            {tab === 'crypto' ? (
              <>
                <div className="flex justify-between py-2 border-b border-secondary-50">
                  <span className="text-sm text-secondary-500">Crypto</span>
                  <span className="text-sm font-semibold text-secondary-900 capitalize">{cryptoType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-secondary-50">
                  <span className="text-sm text-secondary-500">Network</span>
                  <span className="text-sm font-semibold text-secondary-900">{getActiveNetwork()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-secondary-500">Wallet</span>
                  <span className="text-xs font-mono font-semibold text-secondary-900 break-all text-right max-w-xs">{walletAddress}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between py-2 border-b border-secondary-50">
                  <span className="text-sm text-secondary-500">Beneficiary</span>
                  <span className="text-sm font-semibold text-secondary-900">{beneficiaryName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-secondary-50">
                  <span className="text-sm text-secondary-500">Bank</span>
                  <span className="text-sm font-semibold text-secondary-900">{bankName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-secondary-50">
                  <span className="text-sm text-secondary-500">Account</span>
                  <span className="text-sm font-semibold text-secondary-900">{accountNumber}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-secondary-500">Routing</span>
                  <span className="text-sm font-semibold text-secondary-900">{routingNumber}</span>
                </div>
              </>
            )}
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={() => setStep('form')} className="flex-1 py-2.5 border border-secondary-200 rounded-xl text-secondary-700 font-medium hover:bg-secondary-50 transition-all">
              Edit
            </button>
            <button onClick={handleConfirmTransaction} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
              Confirm & Enter PIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Form ────────────────────────────────────────────────────────────
  const availableNetworks = cryptoNetworks[cryptoType] || [];

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
            <p className="text-xs text-secondary-500">Withdraw funds from your account</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary-100">
          {(['crypto', 'bank'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700'}`}>
              {t === 'crypto' ? '₿ Crypto Withdrawal' : '🏦 Bank Withdrawal'}
            </button>
          ))}
        </div>

        <form onSubmit={handleShowSummary} className="p-6 space-y-5">

          {tab === 'crypto' ? (
            <>
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
                  <input type="number" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} placeholder="0.00" min="1"
                    className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
              </div>

              {/* Crypto Type */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Cryptocurrency</label>
                <select value={cryptoType} onChange={e => handleCryptoTypeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white">
                  <option value="bitcoin">Bitcoin (BTC)</option>
                  <option value="ethereum">Ethereum (ETH)</option>
                  <option value="litecoin">Litecoin (LTC)</option>
                  <option value="usdt">Tether (USDT)</option>
                </select>
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
                      onChange={e => handleNetworkChange(e.target.value)}
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
                        onChange={e => setCustomNetwork(e.target.value)}
                        placeholder="Type network name (e.g. Polygon, Arbitrum)"
                        className="w-full mt-2 px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </>
                )}
                <p className="text-xs text-amber-600 mt-1">⚠️ Make sure the network matches your wallet. Wrong network = lost funds.</p>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Your Wallet Address</label>
                <input type="text" value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                  placeholder="Paste your wallet address here"
                  className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm" />
              </div>
            </>
          ) : (
            <>
              {/* Bank Warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700">Account name must match your Vaultix registered name.</p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
                  <input type="number" value={bankAmount} onChange={e => setBankAmount(e.target.value)} placeholder="0.00" min="1"
                    className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
              </div>

              {/* Beneficiary Name + Bank Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Beneficiary Name</label>
                  <input type="text" value={beneficiaryName} onChange={e => setBeneficiaryName(e.target.value)} placeholder="Full legal name"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Chase, Wells Fargo"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
              </div>

              {/* Account Number + Routing Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Account Number</label>
                  <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Bank account number"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Routing Number
                    <span className="ml-1 text-xs text-secondary-400 font-normal">(9 digits)</span>
                  </label>
                  <input type="text" value={routingNumber}
                    onChange={e => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="e.g. 021000021" maxLength={9}
                    className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
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

          {/* Submit */}
          <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
            Review Withdrawal
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdrawal;