import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Send, Globe,
  CreditCard, Landmark, History, UserCog, LogOut, Menu, X,
  Shield, Bell, ChevronRight
} from 'lucide-react';
import { getUser, logout } from '../lib/api';

// Sections
import DashboardHome from '../components/dashboard/DashboardHome';
import OnlineDeposit from '../components/dashboard/OnlineDeposit';
import Withdrawal from '../components/dashboard/Withdrawal';
import WireTransfer from '../components/dashboard/WireTransfer';
import DomesticTransfer from '../components/dashboard/DomesticTransfer';
import VirtualCard from '../components/dashboard/VirtualCard';
import LoanMortgages from '../components/dashboard/LoanMortgages';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import AccountManager from '../components/dashboard/AccountManager';

type Section =
  | 'dashboard'
  | 'deposit'
  | 'withdrawal'
  | 'wire-transfer'
  | 'domestic-transfer'
  | 'virtual-card'
  | 'loan'
  | 'transactions'
  | 'account';

interface NavItem {
  id: Section;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'deposit', label: 'Online Deposit', icon: ArrowDownToLine },
  { id: 'withdrawal', label: 'Withdrawal', icon: ArrowUpFromLine },
  { id: 'wire-transfer', label: 'Wire Transfer', icon: Send },
  { id: 'domestic-transfer', label: 'Domestic Transfer', icon: Globe },
  { id: 'virtual-card', label: 'Virtual Card', icon: CreditCard },
  { id: 'loan', label: 'Loan & Mortgages', icon: Landmark },
  { id: 'transactions', label: 'Transactions', icon: History },
  { id: 'account', label: 'Account Manager', icon: UserCog },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Must have verified PIN this session
    if (sessionStorage.getItem('vaultix_pin_verified') !== 'true') {
      navigate('/welcome');
      return;
    }
  }, [navigate, user]);

  // Parse section from hash or URL
  useEffect(() => {
    const hash = location.hash.replace('#', '') as Section;
    if (hash && navItems.find(n => n.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const handleNavigate = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    window.location.hash = section;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('vaultix_pin_verified');
    logout();
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardHome />;
      case 'deposit': return <OnlineDeposit />;
      case 'withdrawal': return <Withdrawal />;
      case 'wire-transfer': return <WireTransfer />;
      case 'domestic-transfer': return <DomesticTransfer />;
      case 'virtual-card': return <VirtualCard />;
      case 'loan': return <LoanMortgages />;
      case 'transactions': return <TransactionHistory />;
      case 'account': return <AccountManager />;
      default: return <DashboardHome />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-secondary-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-secondary-100">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-r from-primary-600 to-primary-800 p-2 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                Vaultix
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-secondary-100 rounded-lg text-secondary-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-secondary-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-primary-400" />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User info + logout */}
          <div className="border-t border-secondary-100 p-4">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 bg-linear-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.fullName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary-900 truncate">{user.fullName}</p>
                <p className="text-xs text-secondary-500 truncate">{user.accountNumber}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-secondary-200">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-secondary-100 rounded-xl text-secondary-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-secondary-900 capitalize">
                {navItems.find(n => n.id === activeSection)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-linear-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user.fullName?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-secondary-700">{user.fullName?.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Section content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
