import { Shield, Zap, Clock, Users, Home, GraduationCap, Car, ArrowRight } from 'lucide-react';

const loanTypes = [
  { icon: Home, label: 'Home Loan', rate: '3.5%', desc: 'Make your dream home a reality' },
  { icon: GraduationCap, label: 'Education', rate: '4.2%', desc: 'Invest in your future' },
  { icon: Car, label: 'Auto Loan', rate: '3.8%', desc: 'Drive your dream car today' },
];

const LoanSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-linear-to-br from-primary-50 via-white to-blue-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-100/60 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-primary-200/50">
              Take a look at our
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Our Loans
            </h2>
            <p className="text-base sm:text-lg text-secondary-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Mortgage Loans, Home Equity Lines, Personal Lines and Loans,
              Student Loans, Auto Loans — all with competitive rates.
            </p>

            <button className="btn-primary inline-flex items-center gap-2 mb-10 sm:mb-12">
              Discover All Options
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
                <div className="bg-primary-100 p-3 rounded-lg shrink-0">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-secondary-900 text-sm">Approval in 24h</div>
                  <div className="text-xs text-secondary-500">Fast processing</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-secondary-100">
                <div className="bg-primary-100 p-3 rounded-lg shrink-0">
                  <Zap className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-secondary-900 text-sm">No Documents</div>
                  <div className="text-xs text-secondary-500">Digital process</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Loan type cards */}
          <div className="space-y-4 sm:space-y-5">
            {loanTypes.map((loan) => (
              <div
                key={loan.label}
                className="group flex items-center gap-4 sm:gap-5 bg-white rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl border border-secondary-100/70 hover:border-primary-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="bg-primary-100 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors duration-300">
                  <loan.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-secondary-900 text-base sm:text-lg group-hover:text-primary-600 transition-colors">{loan.label}</h3>
                  <p className="text-sm text-secondary-500">{loan.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl sm:text-2xl font-bold text-primary-600">{loan.rate}</p>
                  <p className="text-xs text-secondary-500">APR</p>
                </div>
              </div>
            ))}

            {/* Bottom info cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-secondary-100 text-center">
                <div className="bg-primary-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-sm font-semibold text-secondary-900">We take care of you</p>
                <p className="text-xs text-secondary-500">Personalized service</p>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-secondary-100 text-center">
                <div className="bg-primary-100 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-sm font-semibold text-secondary-900">Fast & easy loans</p>
                <p className="text-xs text-secondary-500">Quick disbursement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoanSection;