import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, CreditCard, RefreshCw } from 'lucide-react';
import {
  useGetAllAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount,
  useGetAllStudents
} from '../hooks/useQueries';
import type { Account } from '../backend';

const emptyForm = {
  studentName: '', studentClass: '', bankName: '',
  accountNumber: '', initialAmount: '', ifscCode: '',
};

export default function AccountPage() {
  const { data: accounts = [], isLoading } = useGetAllAccounts();
  const { data: students = [] } = useGetAllStudents();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const filtered = accounts.filter(a =>
    a.studentName.toLowerCase().includes(search.toLowerCase()) ||
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.bankName.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (a: Account) => {
    setForm({
      studentName: a.studentName, studentClass: a.studentClass, bankName: a.bankName,
      accountNumber: a.accountNumber, initialAmount: String(a.initialAmount), ifscCode: a.ifscCode,
    });
    setEditingId(a.id);
    setFormError('');
    setShowModal(true);
  };

  const handleStudentSelect = (name: string) => {
    const student = students.find(s => s.name === name);
    setForm(prev => ({
      ...prev,
      studentName: name,
      studentClass: student?.studentClass || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.bankName || !form.accountNumber || !form.ifscCode) {
      setFormError('कृपया सर्व आवश्यक फील्ड भरा');
      return;
    }
    try {
      const data = {
        studentName: form.studentName,
        studentClass: form.studentClass,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        initialAmount: parseFloat(form.initialAmount) || 0,
        ifscCode: form.ifscCode,
      };
      if (editingId) {
        await updateAccount.mutateAsync({ id: editingId, ...data });
      } else {
        await createAccount.mutateAsync(data);
      }
      setShowModal(false);
      setForm(emptyForm);
    } catch (err: any) {
      setFormError(err.message || 'Error saving account');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting account');
    }
  };

  const isSaving = createAccount.isPending || updateAccount.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 font-poppins">💳 Accounts</h2>
          <p className="text-xs text-gray-500 font-poppins">{accounts.length} खाती नोंदणीकृत</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold font-poppins shadow-md"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ea580c)' }}
        >
          <Plus size={16} /> नवीन Account
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Account शोधा..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-poppins focus:outline-none focus:border-violet-400"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-violet-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-poppins text-sm">कोणतेही account सापडले नाही</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #7c3aed, #ea580c)' }}>
                  {['विद्यार्थी', 'इयत्ता', 'बँक', 'Account नं.', 'प्रारंभिक रक्कम', 'IFSC', 'क्रिया'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-white text-xs font-bold font-poppins whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, idx) => (
                  <tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 font-poppins whitespace-nowrap">{a.studentName}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">{a.studentClass}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins whitespace-nowrap">{a.bankName}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins font-mono">{a.accountNumber}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">₹{a.initialAmount.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins font-mono text-xs">{a.ifscCode}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm(a.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b" style={{ background: 'linear-gradient(135deg, #7c3aed, #ea580c)' }}>
              <h3 className="text-white font-bold font-poppins">
                {editingId ? '✏️ Account संपादित करा' : '➕ नवीन Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">विद्यार्थी नाव *</label>
                <select
                  value={form.studentName}
                  onChange={e => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:outline-none text-sm font-poppins bg-white"
                >
                  <option value="">विद्यार्थी निवडा</option>
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">इयत्ता (Automatic)</label>
                <input
                  type="text"
                  value={form.studentClass}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-poppins text-gray-500"
                  placeholder="विद्यार्थी निवडल्यावर automatic"
                />
              </div>
              {[
                { key: 'bankName', label: 'Bank नाव *', type: 'text', placeholder: 'बँकेचे नाव' },
                { key: 'accountNumber', label: 'Account Number *', type: 'text', placeholder: 'Account Number' },
                { key: 'initialAmount', label: 'Initial Amount', type: 'number', placeholder: '0.00' },
                { key: 'ifscCode', label: 'IFSC Code *', type: 'text', placeholder: 'IFSC Code' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">{field.label}</label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:outline-none text-sm font-poppins"
                  />
                </div>
              ))}
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
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ea580c)' }}
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
            <h3 className="text-lg font-bold text-gray-800 font-poppins mb-2">Account हटवायचे?</h3>
            <p className="text-sm text-gray-500 font-poppins mb-4">हे कायमचे हटवले जाईल.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold font-poppins">रद्द करा</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteAccount.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold font-poppins disabled:opacity-60"
              >
                {deleteAccount.isPending ? 'हटवत आहे...' : '🗑️ हटवा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
