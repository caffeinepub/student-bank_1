import React, { useState } from 'react';
import type { Page, AppRole } from '../App';
import {
  Home, Users, CreditCard, ArrowLeftRight, History,
  BookOpen, Building2, Menu, X, LogOut, ChevronRight
} from 'lucide-react';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  adminOnly: boolean;
  gradient: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={18} />, adminOnly: true, gradient: 'from-teal-400 to-cyan-500' },
  { id: 'students', label: 'Students', icon: <Users size={18} />, adminOnly: true, gradient: 'from-violet-400 to-purple-600' },
  { id: 'accounts', label: 'Accounts', icon: <CreditCard size={18} />, adminOnly: true, gradient: 'from-orange-400 to-amber-500' },
  { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} />, adminOnly: true, gradient: 'from-green-400 to-emerald-600' },
  { id: 'history', label: 'History', icon: <History size={18} />, adminOnly: true, gradient: 'from-pink-400 to-rose-500' },
  { id: 'passbook', label: 'Passbook Print', icon: <BookOpen size={18} />, adminOnly: false, gradient: 'from-blue-400 to-indigo-600' },
  { id: 'bankdetails', label: 'Bank Details', icon: <Building2 size={18} />, adminOnly: false, gradient: 'from-yellow-400 to-orange-500' },
];

interface DashboardLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  role: AppRole;
  children: React.ReactNode;
}

export default function DashboardLayout({ currentPage, onNavigate, onLogout, role, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNavItems = navItems.filter(item => !item.adminOnly || role === 'admin');

  const pageTitles: Record<Page, string> = {
    home: '🏠 Home',
    students: '👨‍🎓 Students',
    accounts: '💳 Accounts',
    transactions: '💸 Transactions',
    history: '📋 History',
    passbook: '📖 Passbook Print',
    bankdetails: '🏦 Bank Details',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex lg:flex-col
          w-64 flex flex-col`}
        style={{ background: 'linear-gradient(180deg, #0f766e 0%, #7c3aed 60%, #1e1b4b 100%)' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
              <img src="/assets/generated/bank-logo.dim_256x256.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm font-poppins leading-tight">Student Bank</h1>
              <p className="text-white/60 text-xs font-poppins">
                {role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 User'}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto text-white/70 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-poppins transition-all duration-200
                  ${isActive
                    ? 'bg-white text-gray-800 shadow-lg'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.gradient} text-white shadow-sm`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-gray-400" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-poppins text-white/80 hover:bg-red-500/30 hover:text-white transition-all"
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/30 text-red-300">
              <LogOut size={16} />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800 font-poppins">
                {pageTitles[currentPage]}
              </h2>
              <p className="text-xs text-gray-500 font-poppins">Student Bank Management System</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-bold font-poppins ${
                role === 'admin'
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {role === 'admin' ? '👨‍💼 Admin' : '👨‍🎓 User'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 px-4 py-2 text-center">
          <p className="text-xs text-gray-400 font-poppins">
            © {new Date().getFullYear()} Student Bank • Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
