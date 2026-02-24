import React, { useState, useEffect } from 'react';
import {
  getAccounts, getStudents, addTransaction, getTransactionsByAccount,
  computeCurrentBalance, type AccountRecord, type TransactionRecord
} from '../utils/localStorage';
import { ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';

export default function Transaction() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<AccountRecord | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setAccounts(getAccounts());
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      const acc = accounts.find(a => a.id === selectedAccountId) || null;
      setSelectedAccount(acc);
      if (acc) {
        const bal = computeCurrentBalance(acc.id, acc.initialAmount);
        setCurrentBalance(bal);
        setTransactions(getTransactionsByAccount(acc.id));
      }
    } else {
      setSelectedAccount(null);
      setCurrentBalance(0);
      setTransactions([]);
    }
  }, [selectedAccountId, accounts]);

  useEffect(() => {
    const amt = Number(form.amount) || 0;
    if (form.type === 'deposit') {
      setTotalAmount(currentBalance + amt);
    } else {
      setTotalAmount(currentBalance - amt);
    }
  }, [form.amount, form.type, currentBalance]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedAccountId) e.account = 'खाते निवडा';
    if (!form.date) e.date = 'दिनांक आवश्यक आहे';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'वैध रक्कम टाका';
    if (form.type === 'withdrawal' && Number(form.amount) > currentBalance)
      e.amount = `शिल्लक रक्कम (₹${currentBalance.toFixed(0)}) पेक्षा जास्त काढता येणार नाही`;
    if (!form.reason.trim()) e.reason = 'कारण आवश्यक आहे';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedAccount) return;

    const amt = Number(form.amount);
    const newBalance = form.type === 'deposit' ? currentBalance + amt : currentBalance - amt;

    addTransaction({
      accountId: selectedAccount.id,
      accountNumber: selectedAccount.accountNumber,
      studentName: selectedAccount.studentName,
      date: form.date,
      type: form.type,
      amount: amt,
      reason: form.reason,
      balanceAfter: newBalance,
    });

    // Refresh
    const bal = computeCurrentBalance(selectedAccount.id, selectedAccount.initialAmount);
    setCurrentBalance(bal);
    setTransactions(getTransactionsByAccount(selectedAccount.id));
    setForm({ date: new Date().toISOString().split('T')[0], type: 'deposit', amount: '', reason: '' });
    setErrors({});
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-gray-800">व्यवहार</h2>
        <p className="text-xs text-gray-500">पैसे भरणे / काढणे</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="gradient-orange px-5 py-3">
          <h3 className="text-white font-bold text-sm">नवीन व्यवहार</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Account Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">खाते क्रमांक *</label>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none ${
                errors.account ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-orange-400 bg-gray-50'
              }`}
            >
              <option value="">-- खाते निवडा --</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.accountNumber} - {a.studentName}</option>
              ))}
            </select>
            {errors.account && <p className="text-red-500 text-xs mt-1">{errors.account}</p>}
          </div>

          {/* Auto-filled fields */}
          {selectedAccount && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">विद्यार्थी नाव</label>
                <input
                  type="text"
                  value={selectedAccount.studentName}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-100 text-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">शिल्लक रक्कम</label>
                <input
                  type="text"
                  value={formatAmount(currentBalance)}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-green-50 text-sm text-green-700 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">दिनांक *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none ${
                errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-orange-400 bg-gray-50'
              }`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">व्यवहार प्रकार *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, type: 'deposit' }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  form.type === 'deposit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-green-300'
                }`}
              >
                <TrendingUp size={16} />
                पैसे भरणे
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, type: 'withdrawal' }))}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  form.type === 'withdrawal'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-red-300'
                }`}
              >
                <TrendingDown size={16} />
                पैसे काढणे
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">रक्कम *</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="रक्कम टाका"
              min="1"
              className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none ${
                errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-orange-400 bg-gray-50'
              }`}
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">कारण *</label>
            <input
              type="text"
              value={form.reason}
              onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="व्यवहाराचे कारण"
              className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none ${
                errors.reason ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-orange-400 bg-gray-50'
              }`}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Total Amount Preview */}
          {form.amount && selectedAccount && (
            <div className={`rounded-xl p-3 flex items-center justify-between ${
              totalAmount >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <span className="text-xs font-semibold text-gray-600">एकूण रक्कम (नंतर):</span>
              <span className={`font-bold text-base ${totalAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatAmount(totalAmount)}
              </span>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl font-medium">
              ✅ व्यवहार यशस्वीरित्या जतन झाला!
            </div>
          )}

          <button
            type="submit"
            className="w-full gradient-orange text-white font-bold py-3.5 rounded-xl shadow-card hover:opacity-90 active:scale-95 transition-all"
          >
            व्यवहार जतन करा
          </button>
        </form>
      </div>

      {/* Transaction History for selected account */}
      {selectedAccount && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 text-sm">
              {selectedAccount.accountNumber} - व्यवहार इतिहास
            </h3>
            <span className="text-xs text-gray-400">{transactions.length} व्यवहार</span>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">कोणतेही व्यवहार नाहीत</p>
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
                  {transactions.map((t, idx) => (
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
      )}
    </div>
  );
}
