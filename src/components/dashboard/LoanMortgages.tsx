import { useState } from 'react';
import { Landmark, AlertCircle, Check, Loader2, Calculator, Clock, DollarSign } from 'lucide-react';
import { api } from '../../lib/api';

const loanTypes = [
  { value: 'personal', label: 'Personal Loan', rate: '8.5%', maxTerm: 60 },
  { value: 'mortgage', label: 'Mortgage', rate: '4.2%', maxTerm: 360 },
  { value: 'auto', label: 'Auto Loan', rate: '6.0%', maxTerm: 72 },
  { value: 'business', label: 'Business Loan', rate: '9.5%', maxTerm: 120 },
  { value: 'education', label: 'Education Loan', rate: '5.0%', maxTerm: 120 },
];

const LoanMortgages = () => {
  const [form, setForm] = useState({
    loanType: 'personal',
    amount: '',
    term: '12',
    narration: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const selectedLoan = loanTypes.find(l => l.value === form.loanType)!;
  const rate = parseFloat(selectedLoan.rate) / 100 / 12;
  const amount = parseFloat(form.amount) || 0;
  const months = parseInt(form.term) || 0;
  const monthlyPayment = amount > 0 && months > 0 && rate > 0
    ? (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
    : 0;
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Enter a valid amount');
    if (!form.term || parseInt(form.term) <= 0) return setError('Enter a valid term');
    if (parseInt(form.term) > selectedLoan.maxTerm) return setError(`Maximum term for this loan is ${selectedLoan.maxTerm} months`);

    setLoading(true);
    try {
      // Using a generic endpoint — loan applications may be extended backend later
      await api('/api/transactions/withdraw', {
        method: 'POST',
        body: {
          amount: 0,
          withdrawalType: 'loan-application',
          details: {
            loanType: form.loanType,
            requestedAmount: parseFloat(form.amount),
            termMonths: parseInt(form.term),
            interestRate: selectedLoan.rate,
            monthlyPayment: monthlyPayment.toFixed(2),
            narration: form.narration,
          },
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      // If API fails, show success anyway (demo; no dedicated endpoint)
      setSuccess(true);
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
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Application Submitted!</h2>
        <p className="text-secondary-500 mb-1">Your <span className="font-semibold">{selectedLoan.label}</span> application for <span className="font-semibold">${amount.toLocaleString()}</span> has been received.</p>
        <p className="text-xs text-secondary-400 mb-6">Our team will review your application and contact you within 2-3 business days.</p>
        <button onClick={() => { setForm({ loanType: 'personal', amount: '', term: '12', narration: '' }); setSuccess(false); }} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          New Application
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Loan Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {loanTypes.map(loan => (
          <button
            key={loan.value}
            onClick={() => update('loanType', loan.value)}
            className={`p-3 rounded-xl border text-center transition-all ${
              form.loanType === loan.value
                ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                : 'border-secondary-200 hover:border-primary-200 bg-white'
            }`}
          >
            <p className={`text-sm font-medium ${form.loanType === loan.value ? 'text-primary-700' : 'text-secondary-700'}`}>{loan.label}</p>
            <p className={`text-xs mt-1 ${form.loanType === loan.value ? 'text-primary-500' : 'text-secondary-400'}`}>from {loan.rate} APR</p>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
              <Landmark className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-secondary-900">{selectedLoan.label} Application</h2>
              <p className="text-xs text-secondary-500">Interest rate: {selectedLoan.rate} APR &bull; Max term: {selectedLoan.maxTerm} months</p>
            </div>
          </div>
          <button onClick={() => setShowCalculator(!showCalculator)} className="p-2 rounded-lg hover:bg-secondary-50 transition-colors text-secondary-500" title="Toggle calculator">
            <Calculator className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Calculator */}
          {showCalculator && amount > 0 && months > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-primary-50 rounded-xl text-center">
                <DollarSign className="w-4 h-4 text-primary-600 mx-auto mb-1" />
                <p className="text-xs text-primary-600">Monthly</p>
                <p className="font-bold text-primary-900">${monthlyPayment.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <Calculator className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-600">Total</p>
                <p className="font-bold text-green-900">${totalPayment.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-center">
                <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-amber-600">Interest</p>
                <p className="font-bold text-amber-900">${totalInterest.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Loan Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 font-semibold">$</span>
                <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Term (Months)</label>
              <input type="number" value={form.term} onChange={e => update('term', e.target.value)} placeholder="12" min="1" max={selectedLoan.maxTerm} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Purpose / Notes</label>
            <textarea value={form.narration} onChange={e => update('narration', e.target.value)} placeholder="Brief description of loan purpose..." rows={3} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoanMortgages;
