import { Landmark, Sparkles, Bell, TrendingUp, Home, Car, GraduationCap, Briefcase, User } from 'lucide-react';

const LoanMortgages = () => {
  return (
    <div className="w-full space-y-6">

      {/* Hero Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 sm:p-10">
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
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-amber-200 text-xs font-semibold tracking-widest uppercase">Coming Soon</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
            </div>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Loans & Mortgages</h2>
            <p className="text-white/70 text-sm max-w-md">
              We're building a seamless lending experience — from personal loans to mortgages, all in one place.
            </p>
          </div>

          {/* Placeholder rate badges */}
          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-center">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Personal</p>
              <p className="text-white font-bold text-sm">from 8.5%</p>
            </div>
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-center">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Mortgage</p>
              <p className="text-white font-bold text-sm">from 4.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Types Preview */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100">
          <h3 className="font-semibold text-secondary-900">Available Loan Types</h3>
          <p className="text-xs text-secondary-500 mt-0.5">Products launching with this feature</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: User, label: 'Personal Loan', desc: 'For personal expenses, travel, or emergencies', rate: '8.5% APR', color: 'bg-blue-50 text-blue-600' },
              { icon: Home, label: 'Mortgage', desc: 'Finance your dream home with competitive rates', rate: '4.2% APR', color: 'bg-green-50 text-green-600' },
              { icon: Car, label: 'Auto Loan', desc: 'Drive away with flexible car financing', rate: '6.0% APR', color: 'bg-purple-50 text-purple-600' },
              { icon: Briefcase, label: 'Business Loan', desc: 'Capital to grow or start your business', rate: '9.5% APR', color: 'bg-amber-50 text-amber-600' },
              { icon: GraduationCap, label: 'Education Loan', desc: 'Invest in your future with low-rate student loans', rate: '5.0% APR', color: 'bg-pink-50 text-pink-600' },
              { icon: TrendingUp, label: 'Investment Loan', desc: 'Leverage capital for investment opportunities', rate: 'TBD', color: 'bg-secondary-50 text-secondary-600' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-secondary-100 bg-secondary-50/50 opacity-75">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-secondary-800">{item.label}</p>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{item.rate}</span>
                  </div>
                  <p className="text-xs text-secondary-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What's coming */}
      <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-secondary-100">
          <h3 className="font-semibold text-secondary-900">What to expect</h3>
          <p className="text-xs text-secondary-500 mt-0.5">Features included at launch</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '🧮', title: 'Loan Calculator', desc: 'Estimate monthly payments before applying' },
              { icon: '⚡', title: 'Instant Pre-approval', desc: 'Know your eligibility in seconds' },
              { icon: '📄', title: 'Easy Application', desc: 'Apply in minutes with minimal paperwork' },
              { icon: '📊', title: 'Repayment Tracker', desc: 'Track your loan balance and payment schedule' },
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
      </div>

      {/* Notify CTA */}
      <div className="p-5 bg-primary-50 border border-primary-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-900">Get notified when loans launch</p>
            <p className="text-xs text-primary-600">Be the first to apply when this feature goes live</p>
          </div>
        </div>
        <button className="shrink-0 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors whitespace-nowrap">
          Notify Me
        </button>
      </div>

      <p className="text-xs text-center text-secondary-400">
        Have a specific loan requirement?{' '}
        <button className="text-primary-600 hover:underline font-medium">Contact our lending team</button>
      </p>
    </div>
  );
};

export default LoanMortgages;