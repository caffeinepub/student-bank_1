import React, { useState, useEffect } from 'react';
import {
  getAccounts, addAccount, updateAccount, deleteAccount,
  getStudents, type AccountRecord, type StudentRecord
} from '../utils/localStorage';
import { Plus, Pencil, Trash2, X, Search, CreditCard } from 'lucide-react';

interface AccountForm {
  studentId: string;
  studentName: string;
  className: string;
  bankName: string;
  accountNumber: string;
  initialAmount: string;
  ifscCode: string;
}

const emptyForm: AccountForm = {
  studentId: '', studentName: '', className: '',
  bankName: '', accountNumber: '', initialAmount: '', ifscCode: '',
};

export default function Account() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<AccountForm>>({});
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = () => {
    setAccounts(getAccounts());
    setStudents(getStudents());
  };

  useEffect(() => { load(); }, []);

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setForm(prev => ({
      ...prev,
      studentId,
      studentName: student?.name || '',
      className: student?.className || '',
    }));
  };

  const validate = (): boolean => {
    const e: Partial<AccountForm> = {};
    if (!form.studentId) e.studentId = 'विद्यार्थी निवडा';
    if (!form.bankName.trim()) e.bankName = 'बँकेचे नाव आवश्यक आहे';
    if (!form.accountNumber.trim()) e.accountNumber = 'खाते क्रमांक आवश्यक आहे';
    if (!form.initialAmount || isNaN(Number(form.initialAmount)) || Number(form.initialAmount) < 0)
      e.initialAmount = 'वैध रक्कम टाका';
    if (!form.ifscCode.trim()) e.ifscCode = 'IFSC कोड आवश्यक आहे';

    // Check unique account number
    if (!e.accountNumber && !editId) {
      const existing = getAccounts().find(a => a.accountNumber === form.accountNumber);
      if (existing) e.accountNumber = 'हा खाते क्रमांक आधीच अस्तित्वात आहे';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const amount = Number(form.initialAmount);
    if (editId) {
      updateAccount(editId, {
        studentId: form.studentId,
        studentName: form.studentName,
        className: form.className,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        initialAmount: amount,
        ifscCode: form.ifscCode,
        currentBalance: amount,
      });
    } else {
      addAccount({
        studentId: form.studentId,
        studentName: form.studentName,
        className: form.className,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        initialAmount: amount,
        ifscCode: form.ifscCode,
        currentBalance: amount,
      });
    }
    load();
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleEdit = (a: AccountRecord) => {
    setForm({
      studentId: a.studentId,
      studentName: a.studentName,
      className: a.className,
      bankName: a.bankName,
      accountNumber: a.accountNumber,
      initialAmount: a.initialAmount.toString(),
      ifscCode: a.ifscCode,
    });
    setEditId(a.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteAccount(id);
    load();
    setDeleteConfirm(null);
  };

  const filtered = accounts.filter(a =>
    a.studentName.toLowerCase().includes(search.toLowerCase()) ||
    a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.bankName.toLowerCase().includes(search.toLowerCase())
  );

  const formatAmount = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">खाते यादी</h2>
          <p className="text-xs text-gray-500">{accounts.length} खाते नोंदणीकृत</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setErrors({}); setShowModal(true); }}
          className="flex items-center gap-2 gradient-green text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-card hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={16} />
          नवीन खाते
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="खाते शोधा..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none text-sm bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">कोणतेही खाते सापडले नाही</p>
            <p className="text-xs mt-1">नवीन खाते जोडण्यासाठी वरील बटण दाबा</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="gradient-green text-white">
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">विद्यार्थी</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">इयत्ता</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">बँक</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">खाते क्र.</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">प्रारंभिक</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">IFSC</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">क्रिया</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, idx) => (
                  <tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-green-50/30'}>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">{a.studentName}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{a.className}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{a.bankName}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-mono whitespace-nowrap">{a.accountNumber}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{formatAmount(a.initialAmount)}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-mono whitespace-nowrap">{a.ifscCode}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(a)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(a.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-card-lg">
            <div className="gradient-green px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-white font-bold text-base">
                {editId ? 'खाते संपादित करा' : 'नवीन खाते'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">विद्यार्थी नाव *</label>
                <select
                  value={form.studentId}
                  onChange={e => handleStudentChange(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition-colors ${
                    errors.studentId ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-400 bg-gray-50'
                  }`}
                >
                  <option value="">-- विद्यार्थी निवडा --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                  ))}
                </select>
                {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">इयत्ता (स्वयंचलित)</label>
                <input
                  type="text"
                  value={form.className}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-100 text-sm text-gray-500"
                  placeholder="विद्यार्थी निवडल्यावर भरेल"
                />
              </div>

              {[
                { label: 'बँकेचे नाव *', field: 'bankName' as keyof AccountForm, placeholder: 'बँकेचे नाव' },
                { label: 'खाते क्रमांक *', field: 'accountNumber' as keyof AccountForm, placeholder: 'खाते क्रमांक' },
                { label: 'प्रारंभिक रक्कम *', field: 'initialAmount' as keyof AccountForm, placeholder: '0', type: 'number' },
                { label: 'IFSC कोड *', field: 'ifscCode' as keyof AccountForm, placeholder: 'IFSC कोड' },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input
                    type={type || 'text'}
                    value={form[field]}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition-colors ${
                      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-green-400 bg-gray-50'
                    }`}
                  />
                  {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl gradient-green text-white font-semibold text-sm shadow-card hover:opacity-90"
                >
                  {editId ? 'अपडेट करा' : 'जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-card-lg">
            <h3 className="font-bold text-gray-800 text-base mb-2">खाते हटवायचे?</h3>
            <p className="text-gray-500 text-sm mb-5">हे कायमचे हटवले जाईल. खात्री आहे का?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">नाही</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm">हो, हटवा</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
