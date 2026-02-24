import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { AppRole } from '../App';

interface LoginProps {
  onLogin: (role: AppRole, accountNumber?: string) => void;
  pendingLogin: { type: 'admin' | 'user'; accountNumber?: string } | null;
  onTriggerLogin: (
    type: 'admin' | 'user' | null,
    accountNumber?: string,
    adminUsername?: string,
    adminPassword?: string
  ) => void;
  loginError?: string;
}

export default function Login({ pendingLogin, onTriggerLogin, loginError }: LoginProps) {
  const { login, loginStatus } = useInternetIdentity();

  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in' || loading || !!pendingLogin;
  const displayError = loginError || localError;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim()) {
      setLocalError('Username भरा');
      return;
    }
    if (!password.trim()) {
      setLocalError('Password भरा');
      return;
    }

    setLoading(true);
    try {
      // Signal pending login type with credentials BEFORE calling login
      // so App.tsx can call adminLogin() on the backend after actor reinitializes
      onTriggerLogin('admin', undefined, username.trim(), password.trim());
      await login();
    } catch (err: any) {
      setLocalError('Internet Identity login अयशस्वी. पुन्हा प्रयत्न करा.');
      onTriggerLogin(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!username) {
      setLocalError('Account number भरा');
      return;
    }
    if (username !== password) {
      setLocalError('User login साठी username आणि password दोन्ही account number असावे');
      return;
    }
    setLoading(true);
    try {
      // Signal pending login type with account number BEFORE calling login
      onTriggerLogin('user', username);
      await login();
    } catch (err: any) {
      setLocalError('Internet Identity login अयशस्वी. पुन्हा प्रयत्न करा.');
      onTriggerLogin(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #7c3aed 50%, #ea580c 100%)',
      }}
    >
      {/* Background decorative circles */}
      <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-20 bg-white" />
      <div className="absolute bottom-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-20 bg-white" />
      <div className="absolute top-1/2 left-[-40px] w-32 h-32 rounded-full opacity-10 bg-yellow-300" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden">
            <img src="/assets/generated/bank-logo.dim_256x256.png" alt="Bank Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white font-poppins tracking-wide drop-shadow">
            🏦 Student Bank
          </h1>
          <p className="text-white/80 text-sm mt-1 font-poppins">विद्यार्थी बँक व्यवस्थापन प्रणाली</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setActiveTab('admin'); setLocalError(''); setUsername(''); setPassword(''); }}
              className={`flex-1 py-4 text-sm font-bold font-poppins transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-teal-500 to-violet-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              👨‍💼 Admin Login
            </button>
            <button
              onClick={() => { setActiveTab('user'); setLocalError(''); setUsername(''); setPassword(''); }}
              className={`flex-1 py-4 text-sm font-bold font-poppins transition-all ${
                activeTab === 'user'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              👨‍🎓 User Login
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 text-xs text-teal-700 font-poppins">
                  💡 Admin username: <strong>admin</strong> | Password: <strong>admin</strong>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins uppercase tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none font-poppins text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none font-poppins text-sm transition-colors"
                  />
                </div>
                {displayError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2 font-poppins">
                    ⚠️ {displayError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl font-bold text-white font-poppins text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #0f766e, #7c3aed)' }}
                >
                  {isLoggingIn ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> लोड होत आहे...</>
                  ) : '🔐 Admin Login'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-700 font-poppins">
                  💡 Account number हेच username आणि password आहे
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins uppercase tracking-wide">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Account Number टाका"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none font-poppins text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins uppercase tracking-wide">
                    Password (Account Number)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Account Number टाका"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none font-poppins text-sm transition-colors"
                  />
                </div>
                {displayError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2 font-poppins">
                    ⚠️ {displayError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl font-bold text-white font-poppins text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #ec4899)' }}
                >
                  {isLoggingIn ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> लोड होत आहे...</>
                  ) : '🎓 User Login'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-4 font-poppins">
          © {new Date().getFullYear()} Student Bank • सर्व हक्क राखीव
        </p>
      </div>
    </div>
  );
}
