import { Lock, Zap, Users, Globe, Headphones, BarChart3 } from 'lucide-react';

const benefits = [
  {
    icon: Lock,
    title: 'Secure Banking',
    description: 'Advanced encryption and multi-layered security to protect your finances around the clock.',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: Zap,
    title: 'Fast Transactions',
    description: 'Experience seamless and instant transfers anytime, anywhere, 24/7 without delays.',
    color: 'text-amber-600 bg-amber-100',
  },
  {
    icon: Users,
    title: 'Customer-Centric',
    description: 'Dedicated support and personalized solutions crafted for every customer\'s unique needs.',
    color: 'text-green-600 bg-green-100',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Manage your accounts from anywhere in the world with our user-friendly platform.',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support via chat, phone, and email whenever you need us.',
    color: 'text-rose-600 bg-rose-100',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Intelligent insights and spending analytics that help you make better financial decisions.',
    color: 'text-cyan-600 bg-cyan-100',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-linear-to-b from-secondary-50 to-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-primary-100">
            Why Vaultix?
          </div>
          <h2 className="section-title">Why Choose Vaultix Bank?</h2>
          <p className="section-subtitle">
            Discover the advantages that set us apart from traditional banking.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, i) => (
            <div
              key={benefit.title}
              className="group flex gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-secondary-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${benefit.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-1.5 group-hover:text-primary-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-14">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-linear-to-r from-primary-600 to-primary-700 px-8 py-6 rounded-2xl text-white shadow-xl">
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold">Ready to get started?</p>
              <p className="text-sm text-primary-200">Join 500,000+ customers banking smarter with Vaultix.</p>
            </div>
            <button className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors whitespace-nowrap">
              Open Account
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
