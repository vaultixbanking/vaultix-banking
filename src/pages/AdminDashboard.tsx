import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowRightLeft,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  DollarSign,
  ArrowDownToLine,
} from 'lucide-react';

import AdminHome from '../components/admin/AdminHome';
import AdminUsers from '../components/admin/AdminUsers';
import AdminDeposit from '../components/admin/AdminDeposit';
import AdminDepositRequests from '../components/admin/AdminDepositRequests';
import AdminBLC from '../components/admin/AdminBLC';
import AdminTransactions from '../components/admin/AdminTransactions';
import AdminSettings from '../components/admin/AdminSettings';


type Section = 'home' | 'users' | 'deposit' | 'deposit-requests' | 'blc' | 'transactions' | 'settings';

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'deposit', label: 'Deposit Methods', icon: <Wallet className="w-5 h-5" /> },
  { id: 'deposit-requests', label: 'Deposit Requests', icon: <ArrowDownToLine className="w-5 h-5" /> },
  { id: 'blc', label: 'Account Funding', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'transactions', label: 'Transactions', icon: <ArrowRightLeft className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('vaultix_admin_token');
    if (!token) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Hash-based section nav
  useEffect(() => {
    const hash = location.hash.replace('#', '') as Section;
    if (hash && navItems.some(n => n.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const handleNav = (section: Section) => {
    setActiveSection(section);
    window.location.hash = section;
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('vaultix_admin_token');
    localStorage.removeItem('vaultix_admin');
    navigate('/admin', { replace: true });
  };

  const adminStr = localStorage.getItem('vaultix_admin');
  const admin = adminStr ? JSON.parse(adminStr) : null;

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <AdminHome />;
      case 'users': return <AdminUsers />;
      case 'deposit': return <AdminDeposit />;
      case 'deposit-requests': return <AdminDepositRequests />;
      case 'blc': return <AdminBLC />;
      case 'transactions': return <AdminTransactions />;
      case 'settings': return <AdminSettings onLogout={handleLogout} />;
      default: return <AdminHome />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Vaultix Admin</h1>
              <p className="text-[10px] text-slate-400">Control Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {activeSection === item.id && <ChevronRight className="w-4 h-4 opacity-60" />}
            </button>
          ))}
        </nav>

        {/* Admin Info + Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-400">{admin?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.username || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">{admin?.email || 'admin@vaultix.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm sm:text-base">
                {navItems.find(n => n.id === activeSection)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">Manage your banking platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Online</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
