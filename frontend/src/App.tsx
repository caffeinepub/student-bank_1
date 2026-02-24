import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Student from './pages/Student';
import Account from './pages/Account';
import Transaction from './pages/Transaction';
import History from './pages/History';
import PassbookPrint from './pages/PassbookPrint';
import BankDetails from './pages/BankDetails';
import { getAuthSession, clearAuthSession } from './utils/localStorage';

type Page = 'home' | 'student' | 'account' | 'transaction' | 'history' | 'passbook' | 'bank-details';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      setIsAuthenticated(true);
      // Set default page based on role
      if (session.role === 'user') {
        setCurrentPage('passbook');
      } else {
        setCurrentPage('home');
      }
    }
  }, []);

  const handleLogin = () => {
    const session = getAuthSession();
    setIsAuthenticated(true);
    if (session?.role === 'user') {
      setCurrentPage('passbook');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  const handleNavigate = (page: Page) => {
    const session = getAuthSession();
    const adminOnlyPages: Page[] = ['home', 'student', 'account', 'transaction', 'history'];
    if (session?.role !== 'admin' && adminOnlyPages.includes(page)) {
      return; // Block non-admin access
    }
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home />;
      case 'student': return <Student />;
      case 'account': return <Account />;
      case 'transaction': return <Transaction />;
      case 'history': return <History />;
      case 'passbook': return <PassbookPrint />;
      case 'bank-details': return <BankDetails />;
      default: return <Home />;
    }
  };

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </DashboardLayout>
  );
}
