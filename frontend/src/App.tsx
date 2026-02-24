import React, { useState, useEffect, useRef } from 'react';
import { useActor } from './hooks/useActor';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from './backend';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Student from './pages/Student';
import Account from './pages/Account';
import Transaction from './pages/Transaction';
import History from './pages/History';
import PassbookPrint from './pages/PassbookPrint';
import BankDetails from './pages/BankDetails';

export type Page = 'home' | 'students' | 'accounts' | 'transactions' | 'history' | 'passbook' | 'bankdetails';

export type AppRole = 'admin' | 'user' | null;

type PendingLogin = { type: 'admin' | 'user'; accountNumber?: string; adminUsername?: string; adminPassword?: string } | null;

export default function App() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, clear, loginStatus, isInitializing: identityInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [role, setRole] = useState<AppRole>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [userAccountNumber, setUserAccountNumber] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Tracks what kind of login was initiated from the Login page
  const [pendingLogin, setPendingLogin] = useState<PendingLogin>(null);
  const pendingLoginRef = useRef<PendingLogin>(null);

  // Keep ref in sync with state for use inside async callbacks
  useEffect(() => {
    pendingLoginRef.current = pendingLogin;
  }, [pendingLogin]);

  // Called by Login page when user clicks login button
  const handleTriggerLogin = (
    type: 'admin' | 'user' | null,
    accountNumber?: string,
    adminUsername?: string,
    adminPassword?: string
  ) => {
    if (!type) {
      setPendingLogin(null);
      return;
    }
    setPendingLogin({ type, accountNumber, adminUsername, adminPassword });
    setLoginError('');
  };

  // Main effect: runs when actor becomes available after identity change
  useEffect(() => {
    if (actorFetching || !actor) return;

    const pending = pendingLoginRef.current;

    // If there's a pending login, handle role assignment then detection
    if (pending && identity) {
      setIsCheckingRole(true);
      const doLogin = async () => {
        try {
          if (pending.type === 'admin') {
            const username = pending.adminUsername || 'admin';
            const password = pending.adminPassword || 'admin';

            // Call the backend adminLogin method to grant admin role
            // Only skip the error if the user is already an admin (role already assigned)
            let adminLoginError: string | null = null;
            try {
              await actor.adminLogin(username, password);
            } catch (adminErr: any) {
              const msg: string = adminErr?.message || String(adminErr);
              // Check if already admin — that's fine, continue
              if (msg.toLowerCase().includes('already') && msg.toLowerCase().includes('admin')) {
                // Already admin, proceed to role verification
              } else {
                // Real error: wrong credentials or other issue — surface it
                adminLoginError = msg;
              }
            }

            if (adminLoginError !== null) {
              // Extract a user-friendly message
              let friendlyMsg = 'Admin login अयशस्वी.';
              if (adminLoginError.toLowerCase().includes('username') || adminLoginError.toLowerCase().includes('invalid username')) {
                friendlyMsg = 'चुकीचे username. "admin" वापरा.';
              } else if (adminLoginError.toLowerCase().includes('password') || adminLoginError.toLowerCase().includes('invalid password')) {
                friendlyMsg = 'चुकीचे password. "admin" वापरा.';
              } else if (adminLoginError.toLowerCase().includes('anonymous')) {
                friendlyMsg = 'Internet Identity login आवश्यक आहे. पुन्हा प्रयत्न करा.';
              } else {
                friendlyMsg = 'Admin login अयशस्वी: ' + adminLoginError;
              }
              setLoginError(friendlyMsg);
              setPendingLogin(null);
              setIsCheckingRole(false);
              return;
            }

            // Verify the role was granted
            let verifiedRole: UserRole | null = null;
            try {
              verifiedRole = await actor.getCallerUserRole();
            } catch {
              // ignore
            }

            if (verifiedRole === UserRole.admin) {
              setPendingLogin(null);
              setRole('admin');
              setCurrentPage('home');
            } else {
              setLoginError('Admin role मिळाला नाही. Username "admin" आणि Password "admin" वापरा.');
              setPendingLogin(null);
            }
          } else if (pending.type === 'user') {
            const accountNumber = pending.accountNumber || '';
            // Save user profile with account number
            try {
              await actor.saveCallerUserProfile({ name: accountNumber, accountNumber });
            } catch {
              // Profile may already exist
            }
            // Assign user role
            try {
              await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.user);
            } catch {
              // May already have user role
            }
            // Verify role
            const r = await actor.getCallerUserRole();
            if (r === UserRole.user || r === UserRole.admin) {
              setPendingLogin(null);
              setRole('user');
              setCurrentPage('passbook');
              setUserAccountNumber(accountNumber);
            } else {
              setLoginError('User role assign करता आला नाही. Account number तपासा.');
              setPendingLogin(null);
            }
          }
        } catch (err: any) {
          setLoginError('Login अयशस्वी: ' + (err?.message || 'पुन्हा प्रयत्न करा.'));
          setPendingLogin(null);
        } finally {
          setIsCheckingRole(false);
        }
      };
      doLogin();
      return;
    }

    // No pending login: check existing session on app load
    if (!identity) {
      // Anonymous user - not logged in
      setRole(null);
      setIsCheckingRole(false);
      return;
    }

    // Identity exists but no pending login - check existing role (page refresh / returning user)
    setIsCheckingRole(true);
    actor.getCallerUserRole().then(async (r) => {
      if (r === UserRole.admin) {
        setRole('admin');
        setCurrentPage('home');
      } else if (r === UserRole.user) {
        setRole('user');
        setCurrentPage('passbook');
        try {
          const profile = await actor.getCallerUserProfile();
          if (profile) setUserAccountNumber(profile.accountNumber);
        } catch {
          // ignore
        }
      } else {
        setRole(null);
      }
    }).catch(() => {
      setRole(null);
    }).finally(() => {
      setIsCheckingRole(false);
    });
  }, [actor, actorFetching, identity]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setRole(null);
    setUserAccountNumber('');
    setCurrentPage('home');
    setPendingLogin(null);
    setLoginError('');
  };

  const navigateTo = (page: Page) => {
    const adminOnlyPages: Page[] = ['home', 'students', 'accounts', 'transactions', 'history'];
    if (role === 'user' && adminOnlyPages.includes(page)) {
      setCurrentPage('passbook');
      return;
    }
    setCurrentPage(page);
  };

  // Show loading while identity is initializing, actor is fetching, or role is being checked
  const isLoading = identityInitializing || actorFetching || isCheckingRole || loginStatus === 'logging-in';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 via-violet-500 to-orange-400">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold font-poppins">Student Bank लोड होत आहे...</p>
          {pendingLogin && (
            <p className="text-sm text-white/70 mt-2 font-poppins">
              {pendingLogin.type === 'admin' ? 'Admin' : 'User'} login प्रक्रिया सुरू आहे...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <Login
        onLogin={() => {}}
        pendingLogin={pendingLogin}
        onTriggerLogin={handleTriggerLogin}
        loginError={loginError}
      />
    );
  }

  const renderPage = () => {
    const adminOnlyPages: Page[] = ['home', 'students', 'accounts', 'transactions', 'history'];
    if (role === 'user' && adminOnlyPages.includes(currentPage)) {
      return <PassbookPrint userAccountNumber={userAccountNumber} isAdmin={false} />;
    }

    switch (currentPage) {
      case 'home': return <Home />;
      case 'students': return <Student />;
      case 'accounts': return <Account />;
      case 'transactions': return <Transaction />;
      case 'history': return <History />;
      case 'passbook': return <PassbookPrint userAccountNumber={userAccountNumber} isAdmin={role === 'admin'} />;
      case 'bankdetails': return <BankDetails isAdmin={role === 'admin'} />;
      default: return <Home />;
    }
  };

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={navigateTo}
      onLogout={handleLogout}
      role={role}
    >
      {renderPage()}
    </DashboardLayout>
  );
}
