import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, Wallet } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '#services',
    dropdown: [
      { label: 'About Us', href: '#' },
      { label: 'Savings & CDs', href: '#' },
      { label: 'Online & Mobile', href: '#' },
      { label: 'Consumer Loans', href: '#' },
    ],
  },
  {
    label: 'Apply',
    href: '#',
    dropdown: [
      { label: 'Home Loan', href: '/signup' },
      { label: 'Personal Loan', href: '/signup' },
      { label: 'Education Loan', href: '/signup' },
      { label: 'Vehicle Loan', href: '/signup' },
    ],
  },
  { label: 'Get in Touch', href: '#contact' },
  { label: 'Sign In', href: '/login' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleMobileDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
            : 'bg-white/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Vaultix
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.label} className="relative group">
                    <button className="flex items-center text-secondary-700 hover:text-primary-600 font-medium transition-colors py-2">
                      {link.label}
                      <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-200" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-secondary-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="py-2">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-center px-4 py-2.5 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover:opacity-50 transition-all" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Link 
                to="/signup"
                className="btn-primary flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Open Account
              </Link>
            </div>

            {/* ═══ Animated Hamburger Button ═══ */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary-100 transition-colors z-[60]"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-6 bg-secondary-700 rounded-full transition-all duration-300 origin-center ${
                    isOpen ? 'rotate-45 translate-y-[9px]' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-secondary-700 rounded-full transition-all duration-300 ${
                    isOpen ? 'opacity-0 scale-x-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-secondary-700 rounded-full transition-all duration-300 origin-center ${
                    isOpen ? '-rotate-45 -translate-y-[9px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ Mobile Overlay ═══ */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* ═══ Mobile Slide-in Sidebar ═══ */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-50 lg:hidden shadow-2xl transition-transform duration-300 ease-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-secondary-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="text-lg font-bold text-secondary-900">Vaultix</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <X className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          {/* Sidebar Links */}
          <div className="flex-1 overflow-y-auto py-2">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label}>
                  <button
                    onClick={() => toggleMobileDropdown(link.label)}
                    className="flex items-center justify-between w-full px-5 py-3.5 text-secondary-700 hover:text-primary-600 hover:bg-primary-50/50 font-medium transition-colors"
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdown === link.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 bg-secondary-50/50 ${
                      openDropdown === link.label ? 'max-h-60' : 'max-h-0'
                    }`}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block pl-10 pr-5 py-2.5 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-5 py-3.5 text-secondary-700 hover:text-primary-600 hover:bg-primary-50/50 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          {/* Sidebar Footer CTA */}
          <div className="p-5 border-t border-secondary-100">
            <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
              <Wallet className="w-5 h-5" />
              Open Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;