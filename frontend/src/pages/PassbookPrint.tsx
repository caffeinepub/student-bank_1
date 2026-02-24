import React, { useState } from 'react';
import { Printer, RefreshCw, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { useGetPassbook, useGetAllAccounts } from '../hooks/useQueries';

interface PassbookPrintProps {
  userAccountNumber: string;
  isAdmin: boolean;
}

export default function PassbookPrint({ userAccountNumber, isAdmin }: PassbookPrintProps) {
  const [selectedAccount, setSelectedAccount] = useState(isAdmin ? '' : userAccountNumber);
  const [queryAccount, setQueryAccount] = useState(isAdmin ? '' : userAccountNumber);

  const { data: accounts = [] } = useGetAllAccounts();
  const { data: passbookData, isLoading, error, refetch } = useGetPassbook(queryAccount);

  const isDeposit = (t: any) => JSON.stringify(t.transactionType).includes('deposit');

  const handleSearch = () => {
    setQueryAccount(selectedAccount);
  };

  const handlePrint = () => window.print();

  const account = passbookData?.[0];
  const transactions = passbookData?.[1] || [];
  const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800 font-poppins">📖 Passbook Print</h2>
        <p className="text-xs text-gray-500 font-poppins">विद्यार्थी passbook पाहा आणि print करा</p>
      </div>

      {/* Account Selection (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">Account Number निवडा</label>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-sm font-poppins bg-white"
            >
              <option value="">Account निवडा</option>
              {accounts.map(a => (
                <option key={a.id} value={a.accountNumber}>{a.accountNumber} - {a.studentName}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={!selectedAccount}
            className="w-full py-3 rounded-xl text-white font-bold font-poppins text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <BookOpen size={16} /> Passbook पाहा
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && queryAccount && (
        <div className="flex justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Error */}
      {error && queryAccount && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-600 font-poppins text-sm">⚠️ Account सापडले नाही किंवा access नाही</p>
        </div>
      )}

      {/* Passbook Content */}
      {account && !isLoading && (
        <div id="passbook-print" className="space-y-4">
          {/* Print Header */}
          <div
            className="rounded-2xl p-5 text-white shadow-lg print:shadow-none"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img src="/assets/generated/bank-logo.dim_256x256.png" alt="Bank" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-poppins">🏦 Student Bank</h3>
                <p className="text-white/80 text-xs font-poppins">विद्यार्थी बँक पासबुक</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-white/70 text-xs font-poppins">बँक नाव</p>
                <p className="font-bold font-poppins">{account.bankName}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs font-poppins">IFSC Code</p>
                <p className="font-bold font-mono text-xs">{account.ifscCode}</p>
              </div>
            </div>
          </div>

          {/* Student & Account Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h4 className="font-bold text-gray-700 font-poppins text-sm mb-3">👨‍🎓 विद्यार्थी माहिती</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-teal-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">विद्यार्थी नाव</p>
                <p className="font-bold text-gray-800 font-poppins">{account.studentName}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">इयत्ता</p>
                <p className="font-bold text-gray-800 font-poppins">{account.studentClass}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">Account Number</p>
                <p className="font-bold text-gray-800 font-poppins font-mono text-xs">{account.accountNumber}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-2">
                <p className="text-xs text-gray-500 font-poppins">प्रारंभिक रक्कम</p>
                <p className="font-bold text-gray-800 font-poppins">₹{account.initialAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-700 font-poppins text-sm">💳 व्यवहार इतिहास</h4>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-poppins text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
              >
                <Printer size={12} /> Print
              </button>
            </div>
            {sortedTx.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 font-poppins text-sm">कोणतेही व्यवहार नाहीत</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['दिनांक', 'प्रकार', 'रक्कम', 'शिल्लक', 'कारण'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-gray-600 text-xs font-bold font-poppins whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTx.map((t, idx) => {
                      const dep = isDeposit(t);
                      return (
                        <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2.5 text-gray-600 font-poppins whitespace-nowrap text-xs">{t.date}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-poppins ${dep ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {dep ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                              {dep ? 'Deposit' : 'Withdrawal'}
                            </span>
                          </td>
                          <td className={`px-3 py-2.5 font-bold font-poppins text-xs ${dep ? 'text-green-600' : 'text-red-600'}`}>
                            {dep ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-gray-800 font-poppins text-xs">₹{t.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2.5 text-gray-500 font-poppins text-xs">{t.reason}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!queryAccount && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={56} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-poppins text-sm">Account निवडा आणि passbook पाहा</p>
        </div>
      )}
    </div>
  );
}
