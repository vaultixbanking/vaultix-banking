import { Shield, LogOut, User, Mail, Clock } from 'lucide-react';
import { getAdmin } from '../../lib/adminApi';

interface AdminSettingsProps {
  onLogout: () => void;
}

const AdminSettings = ({ onLogout }: AdminSettingsProps) => {
  const admin = getAdmin();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Admin Profile</h3>
            <p className="text-xs text-slate-500">Manage your admin account</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {admin?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 capitalize">{admin?.username || 'Admin'}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold capitalize">{admin?.role || 'super_admin'}</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Info Rows */}
          <div className="space-y-4">
            <InfoRow icon={<User className="w-4 h-4" />} label="Username" value={admin?.username || '—'} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={admin?.email || '—'} />
            <InfoRow icon={<Clock className="w-4 h-4" />} label="Session" value="Active" valueCls="text-green-600" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100">
          <h3 className="font-semibold text-red-700">Danger Zone</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500">Logging out will clear your admin session. You'll need to sign in again to access the admin dashboard.</p>
          <button onClick={onLogout} className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, valueCls }: { icon: React.ReactNode; label: string; value: string; valueCls?: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5 text-slate-500">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <span className={`text-sm font-medium ${valueCls || 'text-slate-900'}`}>{value}</span>
  </div>
);

export default AdminSettings;
