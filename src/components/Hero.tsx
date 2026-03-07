import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Users, TrendingUp, CreditCard, DollarSign } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-0">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-50 via-white to-blue-50" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-2xl opacity-15" />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #1e40af 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="container-custom relative z-10 py-12 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* ═══ Left Content ═══ */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-100/60 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-primary-200/50">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              Trusted by 500K+ Customers
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary-900 leading-tight mb-6">
              Banking Made Easy,{' '}
              <span className="bg-linear-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
                More Personal,
              </span>{' '}
              and Secure
            </h1>

            <p className="text-base sm:text-lg text-secondary-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Experience the future of financial management with cutting-edge
              security and a human touch that puts you first.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10 sm:mb-12">
              <button 
                onClick={() => navigate('/signup')}
                className="btn-primary group inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-secondary inline-flex items-center justify-center">
                Learn More
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary-600">$2.5B+</div>
                <div className="text-xs sm:text-sm text-secondary-500">Assets Managed</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary-600">500K+</div>
                <div className="text-xs sm:text-sm text-secondary-500">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-primary-600">99.9%</div>
                <div className="text-xs sm:text-sm text-secondary-500">Security Uptime</div>
              </div>
            </div>
          </div>

          {/* ═══ Right Content — Visual Dashboard Mockup ═══ */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            {/* Main dashboard card */}
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-linear-to-r from-primary-400/20 to-blue-400/20 rounded-3xl blur-2xl" />

              {/* Dashboard */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-secondary-100/80">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-secondary-500">Welcome back</p>
                    <p className="text-lg font-bold text-secondary-900">John Doe</p>
                  </div>
                  <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    JD
                  </div>
                </div>

                {/* Balance card */}
                <div className="bg-linear-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white mb-5">
                  <p className="text-sm opacity-80 mb-1">Total Balance</p>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight">$24,563.00</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-300" />
                    <span className="text-sm text-green-300">+12.5%</span>
                    <span className="text-xs opacity-60 ml-1">this month</span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
                  {[
                    { icon: DollarSign, label: 'Send', color: 'bg-blue-100 text-blue-600' },
                    { icon: CreditCard, label: 'Cards', color: 'bg-purple-100 text-purple-600' },
                    { icon: TrendingUp, label: 'Invest', color: 'bg-green-100 text-green-600' },
                    { icon: Shield, label: 'Secure', color: 'bg-amber-100 text-amber-600' },
                  ].map((action) => (
                    <div key={action.label} className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-secondary-50 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-secondary-600 font-medium">{action.label}</span>
                    </div>
                  ))}
                </div>

                {/* Recent transactions */}
                <div>
                  <p className="text-sm font-semibold text-secondary-900 mb-3">Recent Transactions</p>
                  <div className="space-y-3">
                    {[
                      { name: 'Netflix Subscription', amount: '-$14.99', color: 'bg-red-100 text-red-600', icon: '🎬' },
                      { name: 'Salary Deposit', amount: '+$5,200.00', color: 'bg-green-100 text-green-600', icon: '💰' },
                      { name: 'Grocery Store', amount: '-$85.20', color: 'bg-orange-100 text-orange-600', icon: '🛒' },
                    ].map((tx) => (
                      <div key={tx.name} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg ${tx.color} flex items-center justify-center text-sm`}>
                            {tx.icon}
                          </div>
                          <span className="text-sm font-medium text-secondary-700">{tx.name}</span>
                        </div>
                        <span className={`text-sm font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-secondary-900'}`}>
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating card — top right */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-6 bg-white rounded-xl shadow-lg p-3 border border-secondary-100 animate-bounce hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-900">Instant Transfer</p>
                  <p className="text-[10px] text-green-600">Completed</p>
                </div>
              </div>

              {/* Floating card — bottom left */}
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-8 bg-white rounded-xl shadow-lg p-3 border border-secondary-100 hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-900">500K+ Users</p>
                  <p className="text-[10px] text-primary-600">Growing daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;