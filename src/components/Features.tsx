import { TrendingUp, Briefcase, LineChart, PiggyBank, ShieldCheck, Smartphone, ArrowRight } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: TrendingUp,
    title: 'Fixed Returns with Peace of Mind',
    description: 'Secure your future with guaranteed fixed-rate deposits that protect and grow your savings steadily.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    icon: Briefcase,
    title: 'Current Account',
    description: 'Powerful business banking solutions with zero-fee transactions and smart cash management tools.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    icon: LineChart,
    title: 'Mutual Funds',
    description: 'Diversify your portfolio with expertly managed mutual funds tailored to your risk appetite.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 4,
    icon: PiggyBank,
    title: 'Smart Savings',
    description: 'AI-powered savings plans that automatically set aside money and help you hit your financial goals faster.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 5,
    icon: ShieldCheck,
    title: 'Insurance & Protection',
    description: 'Comprehensive coverage plans that protect you, your family, and your assets against life\'s uncertainties.',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 6,
    icon: Smartphone,
    title: 'Mobile Banking',
    description: 'Full-featured mobile app with biometric login, instant payments, and real-time notifications on every transaction.',
    color: 'from-indigo-500 to-violet-500',
  },
];

const Features = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white" id="features">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-primary-100">
            Our Features
          </div>
          <h2 className="section-title">Bank for a Better Tomorrow</h2>
          <p className="section-subtitle">
            Committed to helping our customers succeed with innovative financial solutions.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-secondary-100/60 hover:border-primary-200"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-0 group-hover:opacity-[0.04] rounded-2xl transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-secondary-600 text-sm sm:text-base mb-5 leading-relaxed">
                  {feature.description}
                </p>

                <a
                  href="#"
                  className="inline-flex items-center text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;