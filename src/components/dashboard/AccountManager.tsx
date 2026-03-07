import { UserCircle, Sparkles, Bell, Activity, ShieldCheck, FileText, Settings, Lock } from 'lucide-react';

const AccountManager = () => {
  return (
    <div className="w-full space-y-6">

      {/* Hero Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 p-8 sm:p-10">
        {/* Background decorative circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-52 h-52 rounded-full border-2 border-white" />
          <div className="absolute -top-4 -right-4 w-36 h-36 rounded-full border-2 border-white" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border-2 border-white" />
          <div className="absolute bottom-6 left-20 w-20 h-20 rounded-full border border-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-amber-200 text-xs font-semibold tracking-widest uppercase">Coming Soon</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
            </div>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Account Manager</h2>
            <p className="text-white/70 text-sm max-w-md">
              A full suite of tools to manage your profile, monitor activity, handle documents, and control your account security — all in one place.
            </p>
          </div>

          {/* Preview tab icons */}
          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-white/60" />
              <span className="text-white/70 text-xs font-medium">Profile Overview</span>
            </div>
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/60" />
              <span className="text-white/70 text-xs font-medium">Activity Logs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Tabs Preview */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100">
          <h3 className="font-semibold text-secondary-900">Feature Tabs</h3>
          <p className="text-xs text-secondary-500 mt-0.5">What's included when this launches</p>
        </div>

        {/* Mocked tab bar */}
        <div className="flex border-b border-secondary-100 overflow-x-auto">
          {[
            { label: 'Overview', icon: UserCircle },
            { label: 'Activity', icon: Activity },
            { label: 'Security', icon: ShieldCheck },
            { label: 'Documents', icon: FileText },
          ].map((tab, i) => (
            <div key={tab.label}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-not-allowed select-none ${
                i === 0
                  ? 'border-primary-200 text-primary-400 bg-primary-50/40'
                  : 'border-transparent text-secondary-300'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </div>
          ))}
        </div>

        {/* Mocked content skeleton */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-5 border-b border-secondary-100">
            <div className="w-14 h-14 bg-secondary-100 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-36 bg-secondary-100 rounded-full animate-pulse" />
              <div className="h-3 w-24 bg-secondary-100 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 bg-secondary-50 rounded-xl space-y-2">
                <div className="h-3 w-20 bg-secondary-200 rounded-full animate-pulse" />
                <div className="h-4 w-32 bg-secondary-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What to expect */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100">
          <h3 className="font-semibold text-secondary-900">What to expect</h3>
          <p className="text-xs text-secondary-500 mt-0.5">Features included at launch</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: UserCircle, label: 'Profile Overview', desc: 'View and manage all your personal and account details in one place', color: 'bg-blue-50 text-blue-600' },
              { icon: Activity, label: 'Activity Logs', desc: 'Track every login, transaction, and account action with timestamps and device info', color: 'bg-purple-50 text-purple-600' },
              { icon: Lock, label: 'Security & Deactivation', desc: 'Control account access, manage sessions, and safely deactivate your account', color: 'bg-red-50 text-red-600' },
              { icon: FileText, label: 'Document Center', desc: 'Upload, manage, and download your KYC and verification documents', color: 'bg-green-50 text-green-600' },
              { icon: Settings, label: 'Account Settings', desc: 'Update preferences, notification settings, and communication options', color: 'bg-amber-50 text-amber-600' },
              { icon: ShieldCheck, label: 'Verification Status', desc: 'See the status of your identity verification and what is still pending', color: 'bg-secondary-50 text-secondary-600' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-secondary-100 bg-secondary-50/50">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary-800">{item.label}</p>
                  <p className="text-xs text-secondary-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notify CTA */}
      <div className="p-5 bg-primary-50 border border-primary-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-900">Get notified when Account Manager launches</p>
            <p className="text-xs text-primary-600">Be the first to access your full account management dashboard</p>
          </div>
        </div>
        <button className="shrink-0 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors whitespace-nowrap">
          Notify Me
        </button>
      </div>

      <p className="text-xs text-center text-secondary-400">
        Need to update your account details urgently?{' '}
        <button className="text-primary-600 hover:underline font-medium">Contact support</button>
      </p>
    </div>
  );
};

export default AccountManager;