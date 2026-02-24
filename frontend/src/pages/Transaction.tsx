import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, ArrowLeftRight, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import {
  useGetAllTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  useGetAllAccounts
} from '../hooks/useQueries';
import { TransactionType } from '../backend';
import type { Transaction } from '../backend';

const today = new Date().toISOString().split('T')[0];

const emptyForm = {
  accountNumber: '', studentName: '', initialAmount: 0,
  date: today, transactionType: TransactionType.deposit,
  amount: '', reason: '', totalAmount: 0,
};

export default function TransactionPage() {
  const { data: transactions = [], isLoading } = useGetAllTransactions();
  const { data: accounts = [] } = useGetAllAccounts();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const isDeposit = (t: any) => JSON.stringify(t.transactionType).includes('deposit');

  const handleAccountSelect = (accountNumber: string) => {
    const account = accounts.find(a => a.accountNumber === accountNumber);
    if (account) {
      const accountTxs = transactions.filter(t => t.accountNumber === accountNumber);
      const currentBalance = accountTxs.reduce((bal, t) => {
        return isDeposit(t) ? bal + t.amount : bal - t.amount;
      }, account.initialAmount);
      setForm(prev => ({
        ...prev,
        accountNumber,
        studentName: account.studentName,
        initialAmount: account.initialAmount,
        totalAmount: currentBalance,
      }));
    }
  };

  const handleAmountChange = (amount: string) => {
    const amt = parseFloat(amount) || 0;
    const currentBalance = form.totalAmount;
    const newTotal = form.transactionType === TransactionType.deposit
      ? currentBalance + amt
      : currentBalance - amt;
    setForm(prev => ({ ...prev, amount, totalAmount: newTotal }));
  };

  const handleTypeChange = (type: TransactionType) => {
    const amt = parseFloat(form.amount) || 0;
    const base = form.initialAmount;
    const accountTxs = transactions.filter(t => t.accountNumber === form.accountNumber);
    const currentBalance = accountTxs.reduce((bal, t) => {
      return isDeposit(t) ? bal + t.amount : bal - t.amount;
    }, base);
    const newTotal = type === TransactionType.deposit ? currentBalance + amt : currentBalance - amt;
    setForm(prev => ({ ...prev, transactionType: type, totalAmount: newTotal }));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (t: Transaction) => {
    setForm({
      accountNumber: t.accountNumber,
      studentName: t.studentName,
      initialAmount: t.initialAmount,
      date: t.date,
      transactionType: isDeposit(t) ? TransactionType.deposit : TransactionType.withdrawal,
      amount: String(t.amount),
      reason: t.reason,
      totalAmount: t.totalAmount,
    });
    setEditingId(t.id);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountNumber || !form.amount || !form.date) {
      setFormError('कृपया सर्व आवश्यक फील्ड भरा');
      return;
    }
    try {
      const data = {
        accountNumber: form.accountNumber,
        studentName: form.studentName,
        initialAmount: form.initialAmount,
        date: form.date,
        transactionType: form.transactionType,
        amount: parseFloat(form.amount) || 0,
        reason: form.reason,
        totalAmount: form.totalAmount,
      };
      if (editingId) {
        await updateTransaction.mutateAsync({ id: editingId, ...data });
      } else {
        await createTransaction.mutateAsync(data);
      }
      setShowModal(false);
      setForm(emptyForm);
    } catch (err: any) {
      setFormError(err.message || 'Error saving transaction');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting transaction');
    }
  };

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 font-poppins">💸 Transactions</h2>
          <p className="text-xs text-gray-500 font-poppins">{transactions.length} व्यवहार नोंदणीकृत</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold font-poppins shadow-md"
          style={{ background: 'linear-gradient(135deg, #10b981, #0f766e)' }}
        >
          <Plus size={16} /> नवीन व्यवहार
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-green-500" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <ArrowLeftRight size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-poppins text-sm">कोणतेही व्यवहार सापडले नाहीत</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #10b981, #0f766e)' }}>
                  {['Account नं.', 'विद्यार्थी', 'दिनांक', 'प्रकार', 'रक्कम', 'एकूण', 'कारण', 'क्रिया'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-white text-xs font-bold font-poppins whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => {
                  const dep = isDeposit(t);
                  return (
                    <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-600 font-poppins">{t.accountNumber}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800 font-poppins whitespace-nowrap">{t.studentName}</td>
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
                      <td className="px-3 py-2.5 text-gray-500 font-poppins text-xs max-w-[100px] truncate">{t.reason}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b" style={{ background: 'linear-gradient(135deg, #10b981, #0f766e)' }}>
              <h3 className="text-white font-bold font-poppins">
                {editingId ? '✏️ व्यवहार संपादित करा' : '➕ नवीन व्यवहार'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">Account Number *</label>
                <select
                  value={form.accountNumber}
                  onChange={e => handleAccountSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-400 focus:outline-none text-sm font-poppins bg-white"
                >
                  <option value="">Account निवडा</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.accountNumber}>{a.accountNumber} - {a.studentName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">विद्यार्थी नाव (Automatic)</label>
                <input type="text" value={form.studentName} readOnly className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-poppins text-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">प्रारंभिक रक्कम (Automatic)</label>
                <input type="text" value={`₹${form.initialAmount.toLocaleString('en-IN')}`} readOnly className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-poppins text-gray-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">दिनांक *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-400 focus:outline-none text-sm font-poppins"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">व्यवहार प्रकार *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange(TransactionType.deposit)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-poppins border-2 transition-all flex items-center justify-center gap-2 ${
                      form.transactionType === TransactionType.deposit
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <TrendingUp size={14} /> पैसे भरणे
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange(TransactionType.withdrawal)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-poppins border-2 transition-all flex items-center justify-center gap-2 ${
                      form.transactionType === TransactionType.withdrawal
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-red-300'
                    }`}
                  >
                    <TrendingDown size={14} /> पैसे काढणे
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">रक्कम *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-400 focus:outline-none text-sm font-poppins"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">कारण</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="व्यवहाराचे कारण"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-green-400 focus:outline-none text-sm font-poppins"
                />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-600 font-poppins">एकूण रक्कम (Total Amount)</p>
                <p className="text-xl font-bold text-green-700 font-poppins">₹{form.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2 font-poppins">
                  ⚠️ {formError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold font-poppins">
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold font-poppins disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0f766e)' }}
                >
                  {isSaving ? <><RefreshCw size={14} className="animate-spin" /> सेव्ह होत आहे...</> : '💾 सेव्ह करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-poppins mb-2">व्यवहार हटवायचा?</h3>
            <p className="text-sm text-gray-500 font-poppins mb-4">हे कायमचे हटवले जाईल.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold font-poppins">रद्द करा</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteTransaction.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold font-poppins disabled:opacity-60"
              >
                {deleteTransaction.isPending ? 'हटवत आहे...' : '🗑️ हटवा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
