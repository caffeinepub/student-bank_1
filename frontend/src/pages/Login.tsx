import React, { useState } from 'react';
import { getAccounts, setAuthSession } from '../utils/localStorage';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));

    if (username === 'admin' && password === 'admin') {
      setAuthSession({ role: 'admin' });
      onLogin();
    } else {
      // User login: username = account number, password = account number
      const accounts = getAccounts();
      const account = accounts.find(a => a.accountNumber === username);
      if (account && password === username) {
        setAuthSession({ role: 'user', accountNumber: username });
        onLogin();
      } else {
        setError('चुकीचे username किंवा password. पुन्हा प्रयत्न करा.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/generated/login-bg.dim_800x600.png')" }}
      />
      <div className="absolute inset-0 gradient-login opacity-85" />

      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white opacity-10" />
      <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-white opacity-10" />
      <div className="absolute top-1/3 left-[-40px] w-32 h-32 rounded-full bg-yellow-300 opacity-20" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white rounded-3xl shadow-card-lg overflow-hidden">
          {/* Header */}
          <div className="gradient-primary px-8 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-3">
              <img
                src="/assets/generated/bank-logo.dim_256x256.png"
                alt="Student Bank Logo"
                className="w-20 h-20 rounded-2xl shadow-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Student Bank</h1>
            <p className="text-purple-200 text-sm mt-1">विद्यार्थी बँक व्यवस्थापन</p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-5 text-center">लॉगिन करा</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin किंवा account number"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-100 focus:border-purple-400 focus:outline-none text-gray-700 text-sm bg-purple-50 placeholder-gray-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="password टाका"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-100 focus:border-purple-400 focus:outline-none text-gray-700 text-sm bg-purple-50 placeholder-gray-400 transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white font-bold py-3.5 rounded-xl shadow-glow hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    लॉगिन होत आहे...
                  </span>
                ) : 'लॉगिन करा'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
