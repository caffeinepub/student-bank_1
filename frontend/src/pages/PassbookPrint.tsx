import React, { useState, useEffect } from 'react';
import {
  getAccounts, getStudents, getTransactions, getBankDetails,
  getAuthSession, computeCurrentBalance,
  type AccountRecord, type StudentRecord, type TransactionRecord, type BankDetailRecord
} from '../utils/localStorage';
import { Printer, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';

export default function PassbookPrint() {
  const session = getAuthSession();
  const isUser = session?.role === 'user';

  const [accountNumber, setAccountNumber] = useState(isUser ? (session?.accountNumber || '') : '');
  const [account, setAccount] = useState<AccountRecord | null>(null);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [bankDetail, setBankDetail] = useState<BankDetailRecord | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [error, setError] = useState('');

  const loadData = (accNum: string) => {
    setError('');
    const accounts = getAccounts();
    const acc = accounts.find(a => a.accountNumber === accNum);
    if (!acc) {
      setAccount(null);
      setStudent(null);
      setBankDetail(null);
      setTransactions([]);
      if (accNum) setError('हे खाते क्रमांक सापडले नाही');
      return;
    }

    const students = getStudents();
    const stu = students.find(s => s.id === acc.studentId) || null;

    const bankDetails = getBankDetails();
    const bank = bankDetails.find(b => b.bankName === acc.bankName) || null;

    const txns = getTransactions()
      .filter(t => t.accountId === acc.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    const bal = computeCurrentBalance(acc.id, acc.initialAmount);

    setAccount(acc);
    setStudent(stu);
    setBankDetail(bank);
    setTransactions(txns);
    setCurrentBalance(bal);
  };

  useEffect(() => {
    if (isUser && session?.accountNumber) {
      loadData(session.accountNumber);
    }
  }, []);

  const handleSearch = () => {
    if (!accountNumber.trim()) {
      setError('खाते क्रमांक टाका');
      return;
    }
    loadData(accountNumber.trim());
  };

  const handlePrint = () => {
    window.print();
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-800">पासबुक प्रिंट</h2>
        <p className="text-xs text-gray-500">खाते क्रमांकानुसार पासबुक पहा</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-4 no-print">
        <div className="flex gap-2">
          <input
            type="text"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            placeholder="खाते क्रमांक टाका"
            readOnly={isUser}
            className={`flex-1 px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none ${
              isUser
                ? 'border-gray-200 bg-gray-100 text-gray-500'
                : 'border-gray-200 focus:border-purple-400 bg-gray-50'
            }`}
          />
          {!isUser && (
            <button
              onClick={handleSearch}
              className="gradient-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-glow hover:opacity-90"
            >
              शोधा
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {/* Passbook */}
      {account && (
        <div id="passbook-print-area">
          {/* Print Button */}
          <div className="flex justify-end mb-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 gradient-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-glow hover:opacity-90"
            >
              <Printer size={16} />
              प्रिंट करा
            </button>
          </div>

          {/* Passbook Header */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="gradient-primary px-5 py-4 text-center">
              <div className="flex justify-center mb-2">
                <img
                  src="/assets/generated/bank-logo.dim_256x256.png"
                  alt="Bank Logo"
                  className="w-12 h-12 rounded-xl object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <h2 className="text-white font-bold text-lg">Student Bank</h2>
              <p className="text-purple-200 text-xs">विद्यार्थी बँक पासबुक</p>
            </div>

            {/* Student & Account Info */}
            <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-100">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider">विद्यार्थी माहिती</h4>
                <div>
                  <p className="text-xs text-gray-400">नाव</p>
                  <p className="text-sm font-bold text-gray-800">{student?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">इयत्ता</p>
                  <p className="text-sm font-semibold text-gray-700">{student?.className || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">शाळा</p>
                  <p className="text-sm font-semibold text-gray-700">{student?.schoolName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">तालुका / जिल्हा</p>
                  <p className="text-sm font-semibold text-gray-700">{student?.taluka}, {student?.district}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider">खाते माहिती</h4>
                <div>
                  <p className="text-xs text-gray-400">खाते क्रमांक</p>
                  <p className="text-sm font-bold text-gray-800 font-mono">{account.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">बँक</p>
                  <p className="text-sm font-semibold text-gray-700">{account.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">IFSC</p>
                  <p className="text-sm font-semibold text-gray-700 font-mono">{account.ifscCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">शिल्लक रक्कम</p>
                  <p className="text-base font-extrabold text-green-600">{formatAmount(currentBalance)}</p>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="p-4">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                व्यवहार इतिहास ({transactions.length})
              </h4>
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">कोणतेही व्यवहार नाहीत</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-purple-50 text-purple-800">
                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">दिनांक</th>
                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">प्रकार</th>
                        <th className="px-2 py-2 text-right font-semibold whitespace-nowrap">जमा</th>
                        <th className="px-2 py-2 text-right font-semibold whitespace-nowrap">काढणे</th>
                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">कारण</th>
                        <th className="px-2 py-2 text-right font-semibold whitespace-nowrap">शिल्लक</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Opening balance row */}
                      <tr className="bg-blue-50">
                        <td className="px-2 py-2 text-gray-500 whitespace-nowrap">-</td>
                        <td className="px-2 py-2 text-blue-700 font-semibold whitespace-nowrap">प्रारंभिक</td>
                        <td className="px-2 py-2 text-right text-green-600 font-semibold whitespace-nowrap">{formatAmount(account.initialAmount)}</td>
                        <td className="px-2 py-2 text-right text-gray-400 whitespace-nowrap">-</td>
                        <td className="px-2 py-2 text-gray-500 whitespace-nowrap">Opening Balance</td>
                        <td className="px-2 py-2 text-right font-bold text-gray-800 whitespace-nowrap">{formatAmount(account.initialAmount)}</td>
                      </tr>
                      {transactions.map((t, idx) => (
                        <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{t.date}</td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                              t.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {t.type === 'deposit' ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                              {t.type === 'deposit' ? 'जमा' : 'काढणे'}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right text-green-600 font-semibold whitespace-nowrap">
                            {t.type === 'deposit' ? formatAmount(t.amount) : '-'}
                          </td>
                          <td className="px-2 py-2 text-right text-red-600 font-semibold whitespace-nowrap">
                            {t.type === 'withdrawal' ? formatAmount(t.amount) : '-'}
                          </td>
                          <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{t.reason}</td>
                          <td className="px-2 py-2 text-right font-bold text-gray-800 whitespace-nowrap">{formatAmount(t.balanceAfter)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-purple-50 border-t-2 border-purple-200">
                        <td colSpan={5} className="px-2 py-2 font-bold text-purple-800 text-right">एकूण शिल्लक:</td>
                        <td className="px-2 py-2 text-right font-extrabold text-purple-800">{formatAmount(currentBalance)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!account && !error && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">पासबुक पाहण्यासाठी खाते क्रमांक टाका</p>
        </div>
      )}
    </div>
  );
}
