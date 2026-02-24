import React, { useState } from 'react';
import {
  getAccounts, getStudents, getTransactions, getBankDetails,
  type AccountRecord, type StudentRecord, type TransactionRecord, type BankDetailRecord
} from '../utils/localStorage';
import { Search, Printer, Download, History as HistoryIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface SearchResult {
  account: AccountRecord;
  student: StudentRecord | undefined;
  bankDetail: BankDetailRecord | undefined;
  transactions: TransactionRecord[];
}

export default function History() {
  const [accountNumber, setAccountNumber] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = () => {
    setError('');
    if (!accountNumber.trim()) {
      setError('खाते क्रमांक टाका');
      return;
    }

    const accounts = getAccounts();
    const account = accounts.find(a => a.accountNumber === accountNumber.trim());

    if (!account) {
      setResult(null);
      setSearched(true);
      setError('हे खाते क्रमांक सापडले नाही');
      return;
    }

    const students = getStudents();
    const student = students.find(s => s.id === account.studentId);

    const bankDetails = getBankDetails();
    const bankDetail = bankDetails.find(b => b.bankName === account.bankName);

    let transactions = getTransactions().filter(t => t.accountId === account.id);

    if (fromDate) {
      transactions = transactions.filter(t => t.date >= fromDate);
    }
    if (toDate) {
      transactions = transactions.filter(t => t.date <= toDate);
    }

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    setResult({ account, student, bankDetail, transactions });
    setSearched(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!result) return;
    const { account, student, transactions } = result;

    const lines: string[] = [];
    lines.push('Student Bank - Transaction History');
    lines.push('='.repeat(50));
    lines.push('');
    lines.push('STUDENT INFORMATION');
    lines.push(`Name: ${student?.name || 'N/A'}`);
    lines.push(`Class: ${student?.className || 'N/A'}`);
    lines.push(`School: ${student?.schoolName || 'N/A'}`);
    lines.push(`Taluka: ${student?.taluka || 'N/A'}`);
    lines.push(`District: ${student?.district || 'N/A'}`);
    lines.push('');
    lines.push('ACCOUNT INFORMATION');
    lines.push(`Account Number: ${account.accountNumber}`);
    lines.push(`Bank: ${account.bankName}`);
    lines.push(`IFSC: ${account.ifscCode}`);
    lines.push(`Initial Amount: ${account.initialAmount}`);
    lines.push('');
    lines.push('TRANSACTIONS');
    lines.push('Date,Type,Amount,Reason,Balance After');
    transactions.forEach(t => {
      lines.push(`${t.date},${t.type === 'deposit' ? 'Deposit' : 'Withdrawal'},${t.amount},${t.reason},${t.balanceAfter}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${account.accountNumber}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-800">व्यवहार इतिहास</h2>
        <p className="text-xs text-gray-500">खाते क्रमांकानुसार इतिहास पहा</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">खाते क्रमांक *</label>
          <input
            type="text"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            placeholder="खाते क्रमांक टाका"
            className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm bg-gray-50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">दिनांक पासून</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">दिनांक पर्यंत</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm bg-gray-50"
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          onClick={handleSearch}
          className="w-full gradient-primary text-white font-bold py-3 rounded-xl shadow-glow hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Search size={16} />
          शोधा
        </button>
      </div>

      {/* Results */}
      {searched && !result && !error && (
        <div className="text-center py-10 text-gray-400">
          <HistoryIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">कोणतेही परिणाम सापडले नाहीत</p>
        </div>
      )}

      {result && (
        <div id="history-print-area" className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 gradient-blue text-white py-2.5 rounded-xl font-semibold text-sm shadow-card hover:opacity-90"
            >
              <Printer size={16} />
              प्रिंट करा
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 gradient-green text-white py-2.5 rounded-xl font-semibold text-sm shadow-card hover:opacity-90"
            >
              <Download size={16} />
              डाऊनलोड
            </button>
          </div>

          {/* Student Info */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="gradient-blue px-4 py-3">
              <h3 className="text-white font-bold text-sm">विद्यार्थी माहिती</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'नाव', value: result.student?.name || 'N/A' },
                { label: 'इयत्ता', value: result.student?.className || 'N/A' },
                { label: 'शाळा', value: result.student?.schoolName || 'N/A' },
                { label: 'तालुका', value: result.student?.taluka || 'N/A' },
                { label: 'जिल्हा', value: result.student?.district || 'N/A' },
                { label: 'जन्म दिनांक', value: result.student?.dob || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="gradient-green px-4 py-3">
              <h3 className="text-white font-bold text-sm">खाते माहिती</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'खाते क्रमांक', value: result.account.accountNumber },
                { label: 'बँक', value: result.account.bankName },
                { label: 'IFSC', value: result.account.ifscCode },
                { label: 'प्रारंभिक रक्कम', value: formatAmount(result.account.initialAmount) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="gradient-orange px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">व्यवहार ({result.transactions.length})</h3>
            </div>
            {result.transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">निवडलेल्या कालावधीत कोणतेही व्यवहार नाहीत</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-orange-50 text-orange-800">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">दिनांक</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">प्रकार</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">रक्कम</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">कारण</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">शिल्लक</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.transactions.map((t, idx) => (
                      <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/20'}>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">{t.date}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            t.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {t.type === 'deposit' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {t.type === 'deposit' ? 'जमा' : 'काढणे'}
                          </span>
                        </td>
                        <td className={`px-3 py-2.5 font-semibold whitespace-nowrap ${
                          t.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {t.type === 'deposit' ? '+' : '-'}{formatAmount(t.amount)}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{t.reason}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">{formatAmount(t.balanceAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
