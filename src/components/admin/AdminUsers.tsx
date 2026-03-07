import { useState, useEffect } from 'react';
import { Users, Search, Loader2, RefreshCw, Eye, X } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface UserItem {
  id: string;
  fullName: string;
  emailAddress: string;
  username: string;
  accountNumber: string;
  accountType: string;
  totalBalance: number;
  phone: string | null;
  country: string | null;
  createdAt: string;
}

interface UserDetail extends UserItem {
  currencyType: string;
  loan: number;
  expenses: number;
  paymentToday: number;
  newLoans: number;
  transactions: number;
  state: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  occupation: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ success: boolean; data: UserItem[] }>('/api/admin/users');
      setUsers(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const viewUser = async (acct: string) => {
    setDetailLoading(true);
    try {
      const res = await adminApi<{ success: boolean; data: UserDetail }>(`/api/admin/users/${acct}`);
      setSelected(res.data);
    } catch {
      // silently fail
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.fullName.toLowerCase().includes(q) ||
      u.emailAddress.toLowerCase().includes(q) ||
      u.accountNumber.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">All Users</h3>
              <p className="text-xs text-slate-500">{users.length} registered accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <button onClick={fetchUsers} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3 hidden sm:table-cell">Account #</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Type</th>
                  <th className="text-right px-6 py-3">Balance</th>
                  <th className="text-right px-6 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-center px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-400">{user.emailAddress}</p>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-500 hidden sm:table-cell">{user.accountNumber}</td>
                    <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{user.accountType}</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">${user.totalBalance.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-slate-500 hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => viewUser(user.accountNumber)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !detailLoading && setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            ) : selected && (
              <>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                  <h3 className="font-semibold text-slate-900">User Details</h3>
                  <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-600">{selected.fullName.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{selected.fullName}</h4>
                      <p className="text-sm text-slate-500">@{selected.username}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Account #" value={selected.accountNumber} />
                    <Field label="Email" value={selected.emailAddress} />
                    <Field label="Phone" value={selected.phone || 'N/A'} />
                    <Field label="Country" value={selected.country || 'N/A'} />
                    <Field label="State" value={selected.state || 'N/A'} />
                    <Field label="Gender" value={selected.gender || 'N/A'} />
                    <Field label="Occupation" value={selected.occupation || 'N/A'} />
                    <Field label="Account Type" value={selected.accountType} />
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <h5 className="font-semibold text-slate-900 mb-3 text-sm">Financial Summary</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Balance" value={`$${selected.totalBalance.toLocaleString()}`} highlight />
                      <Field label="Loan" value={`$${selected.loan.toLocaleString()}`} />
                      <Field label="Expenses" value={`$${selected.expenses.toLocaleString()}`} />
                      <Field label="Today's Payments" value={`$${selected.paymentToday.toLocaleString()}`} />
                      <Field label="New Loans" value={`$${selected.newLoans.toLocaleString()}`} />
                      <Field label="Transactions" value={selected.transactions.toString()} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="p-3 bg-slate-50 rounded-xl">
    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className={`text-sm font-semibold truncate ${highlight ? 'text-green-600' : 'text-slate-900'}`}>{value}</p>
  </div>
);

export default AdminUsers;
