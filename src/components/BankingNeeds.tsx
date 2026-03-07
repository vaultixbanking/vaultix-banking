import { ArrowRight, Building2, User } from 'lucide-react';

const BankingNeeds = () => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Background image simulation with gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-900 via-primary-800 to-secondary-900" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="container-custom relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Banking For Your Needs
          </h2>
          <p className="text-lg text-primary-200 max-w-xl mx-auto">
            The bank that builds better relationships — for individuals and businesses alike.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
          {/* Individuals */}
          <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-white" />
            </div>
            <p className="text-primary-200 text-sm mb-1">Banking for</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-5">Individuals</h3>
            <button className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-sm sm:text-base">
              Learn More
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Companies */}
          <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <p className="text-primary-200 text-sm mb-1">Banking for</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-5">Companies</h3>
            <button className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-sm sm:text-base">
              Learn More
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankingNeeds;
