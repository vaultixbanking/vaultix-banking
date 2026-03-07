import { useState } from 'react';
import { DollarSign, Search, Loader2, Check, AlertCircle, User } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface UserData {
  accountNumber: string;
  fullName: string;
  totalBalance: number;
  loan: number;
  expenses: number;
  paymentToday: number;
  newLoans: number;
  transactions: number;
}

const AdminBLC = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // BLC fields
  const [fields, setFields] = useState({
    totalBalance: '',
    loan: '',
    expenses: '',
    paymentToday: '',
    newLoans: '',
    transactions: '',
  });

  const handleSearch = async () => {
    if (!accountNumber.trim()) { setError('Enter an account number'); return; }
    setError(''); setSuccess(''); setUserData(null);
    setSearching(true);

    try {
      const res = await adminApi<{ success: boolean; data: UserData }>(`/api/admin/users/${accountNumber.trim()}`);
      setUserData(res.data);
      setFields({
        totalBalance: res.data.totalBalance.toString(),
        loan: res.data.loan.toString(),
        expenses: res.data.expenses.toString(),
        paymentToday: res.data.paymentToday.toString(),
        newLoans: res.data.newLoans.toString(),
        transactions: res.data.transactions.toString(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleUpdate = async () => {
    if (!userData) return;
    setError(''); setSuccess('');
    setSaving(true);

    try {
      const body: Record<string, number> = {};
      if (fields.totalBalance) body.totalBalance = parseFloat(fields.totalBalance);
      if (fields.loan) body.loan = parseFloat(fields.loan);
      if (fields.expenses) body.expenses = parseFloat(fields.expenses);
      if (fields.paymentToday) body.paymentToday = parseFloat(fields.paymentToday);
      if (fields.newLoans) body.newLoans = parseFloat(fields.newLoans);
      if (fields.transactions) body.transactions = parseFloat(fields.transactions);

      const res = await adminApi<{ success: boolean; data: UserData }>(`/api/admin/users/${userData.accountNumber}/blc`, {
        method: 'PATCH',
        body,
      });

      setUserData(res.data);
      setSuccess('BLC updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => setFields(prev => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Balance Manager (BLC)</h3>
            <p className="text-xs text-slate-500">Search a user by account number to manage their balance fields</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Enter account number..."
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <button onClick={handleSearch} disabled={searching} className="px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* User Card + BLC Fields */}
      {userData && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* User Preview */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{userData.fullName}</p>
              <p className="text-xs text-slate-500 font-mono">{userData.accountNumber}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BLCField label="Total Balance ($)" value={fields.totalBalance} onChange={v => updateField('totalBalance', v)} />
              <BLCField label="Loan Balance ($)" value={fields.loan} onChange={v => updateField('loan', v)} />
              <BLCField label="Expenses ($)" value={fields.expenses} onChange={v => updateField('expenses', v)} />
              <BLCField label="Payments Today ($)" value={fields.paymentToday} onChange={v => updateField('paymentToday', v)} />
              <BLCField label="New Loans ($)" value={fields.newLoans} onChange={v => updateField('newLoans', v)} />
              <BLCField label="Transactions" value={fields.transactions} onChange={v => updateField('transactions', v)} />
            </div>

            <button onClick={handleUpdate} disabled={saving} className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Update BLC
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BLCField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <input type="number" value={value} onChange={e => onChange(e.target.value)} step="0.01" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
  </div>
);

export default AdminBLC;
