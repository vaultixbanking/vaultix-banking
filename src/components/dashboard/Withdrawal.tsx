import { useState, useCallback } from 'react';
import { ArrowUpFromLine, AlertCircle, Check, X, Delete, Lock } from 'lucide-react';
import { api } from '../../lib/api';

type WithdrawalTab = 'crypto' | 'bank';

const Withdrawal = () => {
  const [tab, setTab] = useState<WithdrawalTab>('crypto');
  const [step, setStep] = useState<'form' | 'summary' | 'pin'>('form');

  // Crypto form
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoType, setCryptoType] = useState('bitcoin');
  const [walletAddress, setWalletAddress] = useState('');

  // Bank form
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

  const getFormData = () => {
    if (tab === 'crypto') {
      return {
        amount: parseFloat(cryptoAmount),
        withdrawalType: 'crypto',
        details: { cryptoType, walletAddress },
      };
    }
    return {
      amount: parseFloat(bankAmount),
      withdrawalType: 'bank',
      details: { bankName, accountNumber, routingNumber },
    };
  };

  const validateForm = () => {
    if (tab === 'crypto') {
      if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) return 'Enter a valid amount';
      if (!walletAddress.trim()) return 'Enter wallet address';
    } else {
      if (!bankAmount || parseFloat(bankAmount) <= 0) return 'Enter a valid amount';
      if (!bankName.trim()) return 'Enter bank name';
      if (!accountNumber.trim()) return 'Enter account number';
      if (!routingNumber.trim()) return 'Enter routing number';
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
    if (pin.length !== 4) {
      setPinError('Enter your 4-digit PIN');
      return;
    }

    setSubmitting(true);
    setPinError('');

    try {
      const formData = getFormData();
      const res = await api<{ success: boolean; data: { transactionId: string; newBalance: number; amount: number } }>('/api/transactions/withdraw', {
        method: 'POST',
        body: { pin, ...formData },
      });
      setSuccess(res.data);
    } catch (err: unknown) {
      setPinError(err instanceof Error ? err.message : 'Withdrawal failed');
      setPin('');
    } finally {
      setSubmitting(false);
    }
  }, [pin, tab, cryptoAmount, cryptoType, walletAddress, bankAmount, bankName, accountNumber, routingNumber]);

  const resetForm = () => {
    setCryptoAmount(''); setCryptoType('bitcoin'); setWalletAddress('');
    setBankName(''); setAccountNumber(''); setRoutingNumber(''); setBankAmount('');
    setPin(''); setStep('form'); setSuccess(null); setError('');
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Withdrawal Successful!</h2>
        <div className="bg-secondary-50 rounded-xl p-4 mb-4 text-left max-w-sm mx-auto space-y-2">
          <p className="text-sm text-secondary-500">Transaction ID: <span className="font-mono font-semibold text-secondary-700">{success.transactionId}</span></p>
          <p className="text-sm text-secondary-500">Amount: <span className="font-semibold text-secondary-700">${success.amount.toLocaleString()}</span></p>
          <p className="text-sm text-secondary-500">New Balance: <span className="font-semibold text-green-600">${success.newBalance.toLocaleString()}</span></p>
        </div>
        <button onClick={resetForm} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          New Withdrawal
        </button>
      </div>
    );
  }

  // PIN Modal
  if (step === 'pin') {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'];
    return (
      <div className="max-w-sm mx-auto py-8">
        <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-secondary-900 mb-1">Enter PIN to Confirm</h3>
            <p className="text-xs text-secondary-500">Enter your 4-digit PIN to authenticate</p>
          </div>

          {/* PIN Dots */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-primary-600 scale-110' : 'bg-secondary-200 border-2 border-secondary-300'}`} />
            ))}
          </div>

          {pinError && <p className="text-center text-sm text-red-500 mb-4">{pinError}</p>}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2">
            {keys.map(key => {
              if (key === 'clear') return (
                <button key={key} onClick={() => { setPin(''); setPinError(''); }} disabled={submitting} className="h-12 rounded-xl bg-secondary-50 hover:bg-red-50 text-red-500 text-sm font-medium transition-all active:scale-95 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              );
              if (key === 'delete') return (
                <button key={key} onClick={handlePinDelete} disabled={submitting} className="h-12 rounded-xl bg-secondary-50 hover:bg-secondary-100 text-secondary-500 transition-all active:scale-95 flex items-center justify-center">
                  <Delete className="w-4 h-4" />
                </button>
              );
              return (
                <button key={key} onClick={() => handlePinKey(key)} disabled={submitting || pin.length >= 4} className="h-12 rounded-xl bg-secondary-50 hover:bg-secondary-100 text-secondary-900 text-lg font-semibold transition-all active:scale-95">
                  {key}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmitWithdrawal}
            disabled={pin.length !== 4 || submitting}
            className="w-full mt-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Processing...
              </>
            ) : 'Confirm Withdrawal'}
          </button>

          <button onClick={() => setStep('summary')} className="w-full mt-2 py-2 text-sm text-secondary-500 hover:text-secondary-700">
            ← Back to Summary
          </button>
        </div>
      </div>
    );
  }

  // Summary Modal
  if (step === 'summary') {
    const formData = getFormData();
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-primary-50 border-b border-primary-100">
            <h3 className="font-semibold text-primary-900">Transaction Summary</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between"><span className="text-secondary-500">Amount</span><span className="font-semibold">${formData.amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-secondary-500">Method</span><span className="font-semibold capitalize">{formData.withdrawalType}</span></div>
            {tab === 'crypto' ? (
              <>
                <div className="flex justify-between"><span className="text-secondary-500">Crypto</span><span className="font-semibold capitalize">{cryptoType}</span></div>
                <div className="flex justify-between"><span className="text-secondary-500">Wallet</span><span className="font-semibold text-xs font-mono break-all">{walletAddress}</span></div>
              </>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-secondary-500">Bank</span><span className="font-semibold">{bankName}</span></div>
                <div className="flex justify-between"><span className="text-secondary-500">Account</span><span className="font-semibold">{accountNumber}</span></div>
                <div className="flex justify-between"><span className="text-secondary-500">Routing</span><span className="font-semibold">{routingNumber}</span></div>
              </>
            )}
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={() => setStep('form')} className="flex-1 py-2.5 border border-secondary-200 rounded-xl text-secondary-700 font-medium hover:bg-secondary-50 transition-all">
              Cancel
            </button>
            <button onClick={handleConfirmTransaction} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
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
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${
                tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {t === 'crypto' ? '₿ Crypto Withdrawal' : '🏦 Bank Withdrawal'}
            </button>
          ))}
        </div>

        <form onSubmit={handleShowSummary} className="p-6 space-y-5">
          {tab === 'bank' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">Name on account must match your Vaultix account name.</p>
            </div>
          )}

          {tab === 'crypto' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
                  <input type="number" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} placeholder="0.00" min="1" className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Crypto Type</label>
                <select value={cryptoType} onChange={e => setCryptoType(e.target.value)} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="litecoin">Litecoin</option>
                  <option value="usdt">USDT (Tether)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Wallet Address</label>
                <input type="text" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} placeholder="Enter your wallet address" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank name" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Account Number</label>
                  <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Account number" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Routing Number</label>
                  <input type="text" value={routingNumber} onChange={e => setRoutingNumber(e.target.value)} placeholder="Routing number" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
                    <input type="number" value={bankAmount} onChange={e => setBankAmount(e.target.value)} placeholder="0.00" min="1" className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
            Withdraw Funds
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdrawal;
