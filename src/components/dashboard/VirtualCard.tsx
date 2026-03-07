import { CreditCard, Snowflake, Sparkles, Bell } from 'lucide-react';

const VirtualCard = () => {
  return (
    <div className="w-full space-y-6">

      {/* Coming Soon Card Visual */}
      <div className="w-full relative">
        <div className="relative w-full rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 min-h-48">

          {/* Background decorative circles */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 right-4 w-40 h-40 rounded-full border-2 border-white" />
            <div className="absolute top-10 right-10 w-28 h-28 rounded-full border-2 border-white" />
            <div className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full border-2 border-white" />
            <div className="absolute bottom-4 left-16 w-24 h-24 rounded-full border border-white" />
          </div>

          {/* Frosted overlay */}
          <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-[2px]" />

          {/* Top Row */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-7 bg-amber-400/40 rounded-md border border-amber-400/30" />
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Snowflake className="w-4 h-4 text-white/50" />
              </div>
            </div>
            <span className="text-white/60 text-sm font-medium tracking-widest">VAULTIX</span>
          </div>

          {/* Center - Coming Soon */}
          <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
              <CreditCard className="w-7 h-7 text-white/70" />
            </div>
            <h3 className="text-white text-xl font-bold tracking-wide mb-1">Virtual Card</h3>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-amber-200 text-xs font-semibold tracking-widest uppercase">Coming Soon</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
          </div>

          {/* Bottom Row - Masked placeholder */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Card Holder</p>
              <div className="h-3 w-28 bg-white/10 rounded-full" />
            </div>
            <div className="text-right space-y-1">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Expires</p>
              <div className="h-3 w-12 bg-white/10 rounded-full ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100 flex items-center gap-3">
          <div className="bg-primary-50 w-10 h-10 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-secondary-900">Virtual Card</h2>
            <p className="text-xs text-secondary-500">Feature currently in development</p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* What to expect */}
          <div>
            <p className="text-sm font-semibold text-secondary-700 mb-3">What to expect</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: '💳', title: 'Instant Virtual Card', desc: 'Get a virtual Visa/Mastercard instantly linked to your account' },
                { icon: '🔒', title: 'Freeze & Unfreeze', desc: 'Lock your card with one tap whenever you need to' },
                { icon: '🌍', title: 'Online Purchases', desc: 'Shop securely at any online store worldwide' },
                { icon: '📊', title: 'Spending Limits', desc: 'Set custom limits for different spending categories' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-4 bg-secondary-50 rounded-xl">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-secondary-800">{item.title}</p>
                    <p className="text-xs text-secondary-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notify me */}
          <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-900">Get notified when it launches</p>
                <p className="text-xs text-primary-600">We'll let you know as soon as virtual cards are available</p>
              </div>
            </div>
            <button className="shrink-0 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors whitespace-nowrap">
              Notify Me
            </button>
          </div>

          <p className="text-xs text-center text-secondary-400">
            Have feedback or a specific feature request?{' '}
            <button className="text-primary-600 hover:underline font-medium">Contact support</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;