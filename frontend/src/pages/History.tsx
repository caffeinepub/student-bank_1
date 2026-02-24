import React, { useState } from 'react';
import { Search, Download, Printer, RefreshCw, TrendingUp, TrendingDown, History as HistoryIcon } from 'lucide-react';
import { useSearchTransactions } from '../hooks/useQueries';
import type { Transaction } from '../backend';

export default function History() {
  const [accountNumber, setAccountNumber] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState<{
    studentName: string; bankName: string; ifscCode: string; transactions: Transaction[];
  } | null>(null);

  const searchMutation = useSearchTransactions();

  const isDeposit = (t: Transaction) => JSON.stringify(t.transactionType).includes('deposit');

  const handleSearch = async () => {
    if (!accountNumber) return;
    try {
      const data = await searchMutation.mutateAsync({ accountNumber, dateFrom, dateTo });
      setResults(data);
    } catch (err: any) {
      alert(err.message || 'Search failed');
    }
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!results) return;
    const headers = ['दिनांक', 'Account नं.', 'विद्यार्थी', 'प्रकार', 'रक्कम', 'एकूण रक्कम', 'कारण'];
    const rows = results.transactions.map(t => [
      t.date, t.accountNumber, t.studentName,
      isDeposit(t) ? 'Deposit' : 'Withdrawal',
      t.amount, t.totalAmount, t.reason
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${accountNumber}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalDeposit = results?.transactions.filter(isDeposit).reduce((s, t) => s + t.amount, 0) || 0;
  const totalWithdrawal = results?.transactions.filter(t => !isDeposit(t)).reduce((s, t) => s + t.amount, 0) || 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800 font-poppins">📋 History</h2>
        <p className="text-xs text-gray-500 font-poppins">व्यवहार इतिहास शोधा</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">Account Number *</label>
          <input
            type="text"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            placeholder="Account Number टाका"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none text-sm font-poppins"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">दिनांक पासून</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none text-sm font-poppins"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">दिनांक पर्यंत</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none text-sm font-poppins"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={!accountNumber || searchMutation.isPending}
          className="w-full py-3 rounded-xl text-white font-bold font-poppins text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ec4899, #f97316)' }}
        >
          {searchMutation.isPending ? (
            <><RefreshCw size={16} className="animate-spin" /> शोधत आहे...</>
          ) : (
            <><Search size={16} /> व्यवहार शोधा</>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div id="print-section" className="space-y-4">
          {/* Student/Bank Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 font-poppins text-sm">📄 माहिती</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-poppins text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #0f766e)' }}
                >
                  <Printer size={12} /> Print
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-poppins text-white"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0f766e)' }}
                >
                  <Download size={12} /> CSV
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-teal-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">विद्यार्थी नाव</p>
                <p className="font-bold text-gray-800 font-poppins">{results.studentName || '-'}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">Account Number</p>
                <p className="font-bold text-gray-800 font-poppins font-mono">{accountNumber}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">बँक नाव</p>
                <p className="font-bold text-gray-800 font-poppins">{results.bankName || '-'}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">IFSC Code</p>
                <p className="font-bold text-gray-800 font-poppins font-mono text-xs">{results.ifscCode || '-'}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <TrendingUp size={16} className="mx-auto text-green-600 mb-1" />
              <p className="text-xs text-gray-500 font-poppins">Deposit</p>
              <p className="font-bold text-green-700 font-poppins text-sm">₹{totalDeposit.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <TrendingDown size={16} className="mx-auto text-red-600 mb-1" />
              <p className="text-xs text-gray-500 font-poppins">Withdrawal</p>
              <p className="font-bold text-red-700 font-poppins text-sm">₹{totalWithdrawal.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-poppins">शिल्लक</p>
              <p className="font-bold text-teal-700 font-poppins text-sm">₹{(totalDeposit - totalWithdrawal).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Transactions Table */}
          {results.transactions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
              <HistoryIcon size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 font-poppins text-sm">या कालावधीत कोणतेही व्यवहार नाहीत</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #ec4899, #f97316)' }}>
                      {['दिनांक', 'प्रकार', 'रक्कम', 'एकूण रक्कम', 'कारण'].map(h => (
                        <th key={h} className="px-3 py-3 text-left text-white text-xs font-bold font-poppins whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.transactions.map((t, idx) => {
                      const dep = isDeposit(t);
                      return (
                        <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2.5 text-gray-600 font-poppins whitespace-nowrap">{t.date}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-poppins ${dep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {dep ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {dep ? 'Deposit' : 'Withdrawal'}
                            </span>
                          </td>
                          <td className={`px-3 py-2.5 font-bold font-poppins ${dep ? 'text-green-600' : 'text-red-600'}`}>
                            {dep ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-gray-800 font-poppins">₹{t.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2.5 text-gray-500 font-poppins text-xs">{t.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
