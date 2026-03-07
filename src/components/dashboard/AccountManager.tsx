import { useState, useEffect } from 'react';
import { UserCircle, Activity, ShieldOff, FileText, Loader2, Mail, Phone, MapPin, Calendar, Hash, Eye, EyeOff, AlertTriangle, Clock, Download } from 'lucide-react';
import { api, getUser } from '../../lib/api';

type Tab = 'overview' | 'activity' | 'deactivation' | 'documents';

interface UserInfo {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  country: string;
  state: string;
  zipCode: string;
  occupation: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: number;
  createdAt: string;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <UserCircle className="w-4 h-4" /> },
  { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> },
  { id: 'deactivation', label: 'Deactivation', icon: <ShieldOff className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
];

const AccountManager = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deactivationConfirm, setDeactivationConfirm] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api<{ success: boolean; data: UserInfo }>('/api/users/info');
        setUserInfo(res.data);
      } catch {
        // Fallback to stored user
        const u = getUser();
        if (u) setUserInfo(u as unknown as UserInfo);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const activityLogs = [
    { action: 'Login', device: 'Chrome on macOS', time: '2 minutes ago', ip: '192.168.1.***' },
    { action: 'Password Changed', device: 'System', time: '3 days ago', ip: '192.168.1.***' },
    { action: 'Wire Transfer', device: 'Chrome on macOS', time: '5 days ago', ip: '192.168.1.***' },
    { action: 'Login', device: 'Safari on iPhone', time: '1 week ago', ip: '10.0.0.***' },
    { action: 'Deposit', device: 'Chrome on macOS', time: '2 weeks ago', ip: '192.168.1.***' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm">
        <div className="flex overflow-x-auto border-b border-secondary-100 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && userInfo && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-secondary-100">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {(userInfo.firstName?.[0] || '')}{(userInfo.lastName?.[0] || '')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">{userInfo.firstName} {userInfo.lastName}</h3>
                  <p className="text-sm text-secondary-500">Member since {userInfo.createdAt ? formatDate(userInfo.createdAt) : 'N/A'}</p>
                </div>
              </div>

              {/* Account Details */}
              <div>
                <h4 className="font-semibold text-secondary-900 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField icon={<Hash className="w-4 h-4" />} label="Account Number" value={userInfo.accountNumber || 'N/A'} />
                  <InfoField icon={<Hash className="w-4 h-4" />} label="Account Type" value={userInfo.accountType || 'Savings'} />
                  <div className="p-4 bg-secondary-50 rounded-xl">
                    <div className="flex items-center gap-2 text-secondary-500 mb-1">
                      <Hash className="w-4 h-4" />
                      <span className="text-xs">Balance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-secondary-900">
                        {showBalance ? `$${(userInfo.balance || 0).toLocaleString()}` : '••••••••'}
                      </span>
                      <button onClick={() => setShowBalance(!showBalance)} className="text-secondary-400 hover:text-secondary-600">
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <InfoField icon={<Hash className="w-4 h-4" />} label="Currency" value={userInfo.currency || 'USD'} />
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h4 className="font-semibold text-secondary-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={userInfo.emailAddress} />
                  <InfoField icon={<Phone className="w-4 h-4" />} label="Phone" value={userInfo.phoneNumber || 'N/A'} />
                  <InfoField icon={<MapPin className="w-4 h-4" />} label="Location" value={`${userInfo.state || ''}, ${userInfo.country || ''}`.replace(/^,\s|,\s$/g, '') || 'N/A'} />
                  <InfoField icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={userInfo.dateOfBirth ? formatDate(userInfo.dateOfBirth) : 'N/A'} />
                  <InfoField icon={<UserCircle className="w-4 h-4" />} label="Gender" value={userInfo.gender || 'N/A'} />
                  <InfoField icon={<UserCircle className="w-4 h-4" />} label="Occupation" value={userInfo.occupation || 'N/A'} />
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-secondary-900">Recent Activity</h4>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {activityLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-secondary-200">
                      <Clock className="w-4 h-4 text-secondary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-secondary-900">{log.action}</p>
                        <span className="text-xs text-secondary-400">{log.time}</span>
                      </div>
                      <p className="text-xs text-secondary-500 mt-0.5">{log.device} &bull; IP: {log.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deactivation Tab */}
          {activeTab === 'deactivation' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900">Danger Zone</h4>
                    <p className="text-sm text-red-700 mt-1">Account deactivation is permanent. All your data, transaction history, and linked services will be removed. This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Reason for Deactivation</label>
                <select value={deactivationReason} onChange={e => setDeactivationReason(e.target.value)} className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="">Select a reason</option>
                  <option value="no-longer-needed">No longer needed</option>
                  <option value="switching-bank">Switching to another bank</option>
                  <option value="security-concern">Security concerns</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Type "DEACTIVATE" to confirm</label>
                <input type="text" value={deactivationConfirm} onChange={e => setDeactivationConfirm(e.target.value)} placeholder="DEACTIVATE" className="w-full px-4 py-3 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>

              <button
                disabled={deactivationConfirm !== 'DEACTIVATE' || !deactivationReason}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                Deactivate Account
              </button>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-secondary-900">Your Documents</h4>
                <button className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                  Upload Document
                </button>
              </div>

              {[
                { name: 'Government ID', status: 'Verified', uploaded: 'Jan 15, 2025' },
                { name: 'Proof of Address', status: 'Verified', uploaded: 'Jan 15, 2025' },
                { name: 'Selfie Verification', status: 'Pending', uploaded: 'Jan 20, 2025' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-secondary-100 rounded-xl">
                  <div className="w-10 h-10 bg-secondary-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-secondary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900">{doc.name}</p>
                    <p className="text-xs text-secondary-400">Uploaded: {doc.uploaded}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${doc.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {doc.status}
                  </span>
                  <button className="p-2 hover:bg-secondary-50 rounded-lg transition-colors text-secondary-400">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="p-4 bg-secondary-50 rounded-xl">
    <div className="flex items-center gap-2 text-secondary-500 mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="font-semibold text-secondary-900 truncate">{value}</p>
  </div>
);

export default AccountManager;
