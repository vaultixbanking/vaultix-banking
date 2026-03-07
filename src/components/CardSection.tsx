import { Check, CreditCard, Sparkles, Shield } from 'lucide-react';

const CardSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ═══ Card Visual ═══ */}
          <div className="relative flex justify-center">
            {/* Glow */}
            <div className="absolute -inset-6 bg-linear-to-r from-primary-200/40 to-blue-200/40 rounded-[2rem] blur-3xl" />

            {/* Main card */}
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm opacity-80">Vaultix</p>
                    <p className="text-2xl font-bold">Premium</p>
                  </div>
                  <CreditCard className="w-10 h-10 opacity-80" />
                </div>

                {/* Chip + NFC */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-9 bg-yellow-300/30 rounded-md border border-yellow-300/40" />
                  <Sparkles className="w-5 h-5 opacity-50" />
                </div>

                <p className="text-lg sm:text-xl tracking-[0.2em] mb-6 font-mono">**** **** **** 4582</p>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-60 mb-0.5">CARD HOLDER</p>
                    <p className="font-semibold">JOHN DOE</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-60 mb-0.5">VALID THRU</p>
                    <p className="font-semibold">12/28</p>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 bg-white/25 rounded-full" />
                    <div className="w-8 h-8 bg-white/15 rounded-full -ml-3" />
                  </div>
                </div>
              </div>

              {/* Second card behind */}
              <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 -z-10 bg-linear-to-br from-blue-400 to-primary-500 rounded-3xl h-full opacity-30 blur-sm" />

              {/* Floating badge */}
              <div className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-4 bg-white rounded-xl shadow-lg p-3 border border-secondary-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-900">Protected</p>
                  <p className="text-[10px] text-green-600">3D Secure</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Card Details ═══ */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-primary-100">
              Credit Cards
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Personalize Your Card and Stand Out From the Crowd
            </h2>

            <p className="text-base sm:text-lg text-secondary-600 mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Design a card that reflects your personality. Enjoy exclusive perks, 
              cashback rewards, and premium benefits with every transaction.
            </p>

            <ul className="space-y-3 mb-8 inline-block text-left">
              {[
                'Zero annual fee for the first year',
                'Up to 5% cashback on all purchases',
                'Complimentary travel insurance worldwide',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="bg-primary-100 p-1 rounded-full shrink-0">
                    <Check className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-secondary-700 text-sm sm:text-base">{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-secondary-50 p-5 sm:p-6 rounded-2xl max-w-lg mx-auto lg:mx-0">
              <h3 className="font-semibold text-secondary-900 mb-4">Apply for Credit Card</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="flex-1 px-4 py-3 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button className="btn-primary whitespace-nowrap text-sm">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardSection;