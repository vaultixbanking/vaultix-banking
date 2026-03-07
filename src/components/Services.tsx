import { Globe, CreditCard, TrendingUp, Shield, ArrowRight, Wifi, PieChart, Landmark } from 'lucide-react';

const services = [
  {
    id: 1,
    icon: Globe,
    title: 'Online Banking',
    description: 'Access your account anywhere, anytime with secure online banking.',
    progress: 75,
  },
  {
    id: 2,
    icon: CreditCard,
    title: 'Personal Loans',
    description: 'Get quick and easy loans tailored to your needs at competitive rates.',
    progress: 90,
  },
  {
    id: 3,
    icon: TrendingUp,
    title: 'Investment Plans',
    description: 'Grow your wealth with smart investment options curated for you.',
    progress: 85,
  },
  {
    id: 4,
    icon: Shield,
    title: 'Advanced Security',
    description: 'Bank with peace of mind using cutting-edge security technologies.',
    progress: 95,
  },
  {
    id: 5,
    icon: Wifi,
    title: 'Contactless Payments',
    description: 'Tap and pay anywhere with fast, secure contactless technology.',
    progress: 88,
  },
  {
    id: 6,
    icon: PieChart,
    title: 'Budget Planner',
    description: 'Smart tools to track your spending and manage budgets effortlessly.',
    progress: 82,
  },
  {
    id: 7,
    icon: Landmark,
    title: 'Wealth Management',
    description: 'Expert financial advisors to help grow and protect your wealth.',
    progress: 78,
  },
  {
    id: 8,
    icon: CreditCard,
    title: 'Virtual Cards',
    description: 'Instant virtual cards for safe and secure online shopping.',
    progress: 92,
  },
];

const Services = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white" id="services">
      <div className="container-custom">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-primary-100">
            What We Offer
          </div>
          <h2 className="section-title">Our Features & Services</h2>
          <p className="section-subtitle">
            Discover what makes Vaultix your trusted financial partner.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-xl p-5 sm:p-6 shadow-md hover:shadow-2xl border border-secondary-100/60 hover:border-primary-200 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-primary-100 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors duration-300">
                <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 group-hover:text-white transition-colors duration-300" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                {service.title}
              </h3>

              <p className="text-secondary-600 text-sm mb-4 leading-relaxed">
                {service.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-500 group-hover:bg-primary-500"
                    style={{ width: `${service.progress}%` }}
                  />
                </div>
                <span className="text-xs text-secondary-500 mt-1 block">
                  {service.progress}% satisfaction
                </span>
              </div>

              <a
                href="#"
                className="inline-flex items-center text-primary-600 font-semibold text-sm hover:text-primary-700 transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;