import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-secondary-900 text-white" id="contact">
      <div className="container-custom py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Vaultix
              </span>
            </div>
            <p className="text-secondary-400 text-sm leading-relaxed">
              Vaultix is your trusted financial partner, offering reliable and
              secure banking services tailored to your needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-4 uppercase tracking-wider text-secondary-300">Quick Links</h3>
            <ul className="space-y-2.5">
              {['Home', 'Services', 'About Us', 'Contact Us'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-secondary-400 hover:text-primary-400 transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-4 uppercase tracking-wider text-secondary-300">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-secondary-400 text-sm">123 Skyline Avenue, City, Country</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span className="text-secondary-400 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span className="text-secondary-400 text-sm">hello@vaultix.com</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-4 uppercase tracking-wider text-secondary-300">Follow Us</h3>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: 'Facebook' },
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Instagram, label: 'Instagram' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="bg-secondary-800 p-2.5 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-800">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-secondary-500 text-sm text-center">
            &copy; {new Date().getFullYear()} Vaultix. All Rights Reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="bg-secondary-800 hover:bg-primary-600 p-2 rounded-lg transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;