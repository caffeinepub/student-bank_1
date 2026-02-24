import React from 'react';
import { Users, CreditCard, TrendingUp, TrendingDown, Wallet, Building2, RefreshCw } from 'lucide-react';
import { useGetAllStudents, useGetAllAccounts, useGetAllTransactions, useGetAllBankDetails } from '../hooks/useQueries';
import { TransactionType } from '../backend';

export default function Home() {
  const { data: students = [], isLoading: studentsLoading } = useGetAllStudents();
  const { data: accounts = [], isLoading: accountsLoading } = useGetAllAccounts();
  const { data: transactions = [], isLoading: txLoading } = useGetAllTransactions();
  const { data: bankDetails = [], isLoading: bankLoading } = useGetAllBankDetails();

  const isLoading = studentsLoading || accountsLoading || txLoading || bankLoading;

  const totalDeposit = transactions
    .filter(t => t.transactionType === TransactionType.deposit || (t.transactionType as any).__kind__ === 'deposit' || JSON.stringify(t.transactionType).includes('deposit'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawal = transactions
    .filter(t => t.transactionType === TransactionType.withdrawal || (t.transactionType as any).__kind__ === 'withdrawal' || JSON.stringify(t.transactionType).includes('withdrawal'))
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalDeposit - totalWithdrawal;

  const cards = [
    {
      label: 'एकूण विद्यार्थी',
      sublabel: 'Total Students',
      value: students.length,
      icon: <Users size={28} />,
      gradient: 'from-teal-400 to-cyan-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
    },
    {
      label: 'एकूण Account',
      sublabel: 'Total Accounts',
      value: accounts.length,
      icon: <CreditCard size={28} />,
      gradient: 'from-violet-400 to-purple-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
    },
    {
      label: 'एकूण Deposit',
      sublabel: 'Total Deposits',
      value: `₹${totalDeposit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp size={28} />,
      gradient: 'from-green-400 to-emerald-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      label: 'एकूण Withdrawal',
      sublabel: 'Total Withdrawals',
      value: `₹${totalWithdrawal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <TrendingDown size={28} />,
      gradient: 'from-orange-400 to-red-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      label: 'शिल्लक रक्कम',
      sublabel: 'Current Balance',
      value: `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <Wallet size={28} />,
      gradient: 'from-pink-400 to-rose-600',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
    },
    {
      label: 'बँक तपशील',
      sublabel: 'Bank Details',
      value: bankDetails.length,
      icon: <Building2 size={28} />,
      gradient: 'from-yellow-400 to-amber-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw size={40} className="animate-spin text-teal-500 mx-auto mb-3" />
          <p className="text-gray-500 font-poppins">डेटा लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-5 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #7c3aed 100%)' }}
      >
        <h2 className="text-xl font-bold font-poppins">🏦 Student Bank Dashboard</h2>
        <p className="text-white/80 text-sm mt-1 font-poppins">विद्यार्थी बँक व्यवस्थापन प्रणाली</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="bg-white/20 rounded-lg px-3 py-1 font-poppins">
            📊 {transactions.length} व्यवहार
          </span>
          <span className="bg-white/20 rounded-lg px-3 py-1 font-poppins">
            🏦 {bankDetails.length} बँका
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h3 className="text-sm font-bold text-gray-600 font-poppins uppercase tracking-wide mb-3">
          📈 सारांश
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-4 border ${card.bg} ${card.border} shadow-sm`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center mb-3 shadow-md`}>
                {card.icon}
              </div>
              <p className="text-xs text-gray-500 font-poppins">{card.sublabel}</p>
              <p className="text-sm font-semibold text-gray-600 font-poppins">{card.label}</p>
              <p className="text-xl font-bold text-gray-800 font-poppins mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-600 font-poppins uppercase tracking-wide mb-3">
            🕐 अलीकडील व्यवहार
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {transactions.slice(-5).reverse().map((tx, idx) => {
              const isDeposit = JSON.stringify(tx.transactionType).includes('deposit');
              return (
                <div key={idx} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isDeposit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isDeposit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 font-poppins truncate">{tx.studentName}</p>
                    <p className="text-xs text-gray-500 font-poppins">{tx.accountNumber} • {tx.date}</p>
                  </div>
                  <span className={`text-sm font-bold font-poppins ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                    {isDeposit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
