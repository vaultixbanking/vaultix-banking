import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: 'Vaultix has transformed the way I manage my finances. Their services are top-notch!',
    author: 'Emily R.',
    role: 'Business Owner',
    rating: 5,
    initials: 'ER',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    quote: 'Fast transactions and excellent customer support. I couldn\'t ask for more!',
    author: 'James L.',
    role: 'Freelancer',
    rating: 5,
    initials: 'JL',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    quote: 'Secure and reliable banking at its best. Highly recommended for anyone!',
    author: 'Sophia W.',
    role: 'Entrepreneur',
    rating: 5,
    initials: 'SW',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 4,
    quote: 'Vaultix provides unmatched convenience and trust. I love how easy it is to use their platform!',
    author: 'Michael T.',
    role: 'Software Developer',
    rating: 5,
    initials: 'MT',
    color: 'from-amber-500 to-orange-500',
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-linear-to-b from-primary-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-primary-100">
            Testimonials
          </div>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Don't just take our word for it — hear from our satisfied customers
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl border border-secondary-100/60 hover:border-primary-200 transition-all duration-300 hover:-translate-y-2 relative"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-primary-100 absolute top-4 right-4" />

              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-secondary-700 text-sm sm:text-base mb-5 italic leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-3 border-t border-secondary-100 pt-4">
                <div className={`w-10 h-10 rounded-full bg-linear-to-br ${testimonial.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-secondary-900 text-sm">{testimonial.author}</p>
                  <p className="text-xs text-secondary-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;