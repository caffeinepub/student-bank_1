import React, { useState } from 'react';
import { clearAuthSession, getAuthSession } from '../utils/localStorage';
import {
  Home, Users, CreditCard, ArrowLeftRight, History,
  BookOpen, Building2, Menu, X, LogOut, ChevronRight
} from 'lucide-react';

type Page = 'home' | 'student' | 'account' | 'transaction' | 'history' | 'passbook' | 'bank-details';

interface NavItem {
  id: Page;
  label: string;
  labelMr: string;
  icon: React.ReactNode;
  adminOnly: boolean;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', labelMr: 'होम', icon: <Home size={18} />, adminOnly: true },
  { id: 'student', label: 'Students', labelMr: 'विद्यार्थी', icon: <Users size={18} />, adminOnly: true },
  { id: 'account', label: 'Accounts', labelMr: 'खाते', icon: <CreditCard size={18} />, adminOnly: true },
  { id: 'transaction', label: 'Transactions', labelMr: 'व्यवहार', icon: <ArrowLeftRight size={18} />, adminOnly: true },
  { id: 'history', label: 'History', labelMr: 'इतिहास', icon: <History size={18} />, adminOnly: true },
  { id: 'passbook', label: 'Passbook Print', labelMr: 'पासबुक प्रिंट', icon: <BookOpen size={18} />, adminOnly: false },
  { id: 'bank-details', label: 'Bank Details', labelMr: 'बँक माहिती', icon: <Building2 size={18} />, adminOnly: false },
];

interface DashboardLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ currentPage, onNavigate, onLogout, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = getAuthSession();
  const isAdmin = session?.role === 'admin';

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    clearAuthSession();
    onLogout();
  };

  const currentItem = navItems.find(n => n.id === currentPage);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 gradient-sidebar flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Sidebar Header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/bank-logo.dim_256x256.png"
              alt="Logo"
              className="w-12 h-12 rounded-xl object-cover shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Student Bank</h1>
              <p className="text-purple-300 text-xs">विद्यार्थी बँक</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto text-white/60 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          <div className="mt-4 bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-sm">
              {isAdmin ? 'A' : 'U'}
            </div>
            <div>
              <p className="text-white text-xs font-semibold">
                {isAdmin ? 'Admin' : `Account: ${session?.accountNumber}`}
              </p>
              <p className="text-purple-300 text-xs">{isAdmin ? 'Administrator' : 'User'}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                currentPage === item.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`${currentPage === item.id ? 'text-yellow-300' : 'text-purple-300 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm flex-1">{item.labelMr}</span>
              {currentPage === item.id && (
                <ChevronRight size={14} className="text-yellow-300" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 pt-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">लॉगआउट</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-xs">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-base">
              {currentItem?.labelMr || 'Dashboard'}
            </h2>
            <p className="text-xs text-gray-400">{currentItem?.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs">
              {isAdmin ? 'A' : 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
