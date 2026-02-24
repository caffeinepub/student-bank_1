import React, { useState, useEffect } from 'react';
import { getStudents, getAccounts, getTransactions } from '../utils/localStorage';
import { Users, CreditCard, TrendingUp, TrendingDown, Wallet, RefreshCw } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAccounts: 0,
    totalDeposit: 0,
    totalWithdrawal: 0,
    balance: 0,
  });

  const loadStats = () => {
    const students = getStudents();
    const accounts = getAccounts();
    const transactions = getTransactions();

    const totalDeposit = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawal = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const initialAmounts = accounts.reduce((sum, a) => sum + a.initialAmount, 0);

    setStats({
      totalStudents: students.length,
      totalAccounts: accounts.length,
      totalDeposit: totalDeposit + initialAmounts,
      totalWithdrawal,
      balance: initialAmounts + totalDeposit - totalWithdrawal,
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const cards = [
    {
      title: 'एकूण विद्यार्थी',
      subtitle: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: <Users size={28} />,
      gradient: 'gradient-blue',
      bg: 'from-blue-500 to-cyan-400',
    },
    {
      title: 'एकूण खाते',
      subtitle: 'Total Accounts',
      value: stats.totalAccounts.toString(),
      icon: <CreditCard size={28} />,
      gradient: 'gradient-purple',
      bg: 'from-purple-500 to-violet-400',
    },
    {
      title: 'एकूण जमा',
      subtitle: 'Total Deposit',
      value: formatAmount(stats.totalDeposit),
      icon: <TrendingUp size={28} />,
      gradient: 'gradient-green',
      bg: 'from-emerald-500 to-green-400',
    },
    {
      title: 'एकूण काढणे',
      subtitle: 'Total Withdrawal',
      value: formatAmount(stats.totalWithdrawal),
      icon: <TrendingDown size={28} />,
      gradient: 'gradient-orange',
      bg: 'from-orange-500 to-amber-400',
    },
    {
      title: 'शिल्लक रक्कम',
      subtitle: 'Current Balance',
      value: formatAmount(stats.balance),
      icon: <Wallet size={28} />,
      gradient: 'gradient-pink',
      bg: 'from-pink-500 to-rose-400',
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Welcome Banner */}
      <div className="gradient-primary rounded-2xl p-5 text-white shadow-card-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">नमस्कार! 👋</h2>
            <p className="text-purple-200 text-sm mt-0.5">Student Bank Dashboard</p>
          </div>
          <button
            onClick={loadStats}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="mt-3 text-xs text-purple-200">
          {new Date().toLocaleDateString('mr-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-r ${card.bg} rounded-2xl p-5 text-white shadow-card-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{card.subtitle}</p>
                <h3 className="text-white font-bold text-lg mt-0.5">{card.title}</h3>
                <p className="text-white font-extrabold text-2xl mt-2">{card.value}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info */}
      <div className="bg-white rounded-2xl p-4 shadow-card">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">त्वरित माहिती</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-blue-600">{stats.totalStudents}</p>
            <p className="text-xs text-blue-500 font-medium">विद्यार्थी</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-purple-600">{stats.totalAccounts}</p>
            <p className="text-xs text-purple-500 font-medium">खाते</p>
          </div>
        </div>
      </div>
    </div>
  );
}
