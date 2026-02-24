import React, { useState, useEffect } from 'react';
import {
  getBankDetails, addBankDetail, updateBankDetail, deleteBankDetail,
  getAuthSession, type BankDetailRecord
} from '../utils/localStorage';
import { Plus, Pencil, Trash2, X, Building2, Search } from 'lucide-react';

interface BankForm {
  bankName: string;
  taluka: string;
  district: string;
  ifscCode: string;
}

const emptyForm: BankForm = { bankName: '', taluka: '', district: '', ifscCode: '' };

export default function BankDetails() {
  const session = getAuthSession();
  const isAdmin = session?.role === 'admin';

  const [details, setDetails] = useState<BankDetailRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BankForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<BankForm>>({});
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = () => setDetails(getBankDetails());

  useEffect(() => { load(); }, []);

  const validate = (): boolean => {
    const e: Partial<BankForm> = {};
    if (!form.bankName.trim()) e.bankName = 'बँकेचे नाव आवश्यक आहे';
    if (!form.taluka.trim()) e.taluka = 'तालुका आवश्यक आहे';
    if (!form.district.trim()) e.district = 'जिल्हा आवश्यक आहे';
    if (!form.ifscCode.trim()) e.ifscCode = 'IFSC कोड आवश्यक आहे';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      updateBankDetail(editId, form);
    } else {
      addBankDetail(form);
    }
    load();
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleEdit = (d: BankDetailRecord) => {
    setForm({
      bankName: d.bankName,
      taluka: d.taluka,
      district: d.district,
      ifscCode: d.ifscCode,
    });
    setEditId(d.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteBankDetail(id);
    load();
    setDeleteConfirm(null);
  };

  const filtered = details.filter(d =>
    d.bankName.toLowerCase().includes(search.toLowerCase()) ||
    d.taluka.toLowerCase().includes(search.toLowerCase()) ||
    d.district.toLowerCase().includes(search.toLowerCase()) ||
    d.ifscCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">बँक माहिती</h2>
          <p className="text-xs text-gray-500">{details.length} बँक नोंदणीकृत</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setForm(emptyForm); setEditId(null); setErrors({}); setShowModal(true); }}
            className="flex items-center gap-2 gradient-teal text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-card hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={16} />
            बँक जोडा
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="बँक शोधा..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-400 focus:outline-none text-sm bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">कोणतीही बँक माहिती सापडली नाही</p>
            {isAdmin && (
              <p className="text-xs mt-1">नवीन बँक जोडण्यासाठी वरील बटण दाबा</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="gradient-teal text-white">
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">बँकेचे नाव</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">तालुका</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">जिल्हा</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">IFSC कोड</th>
                  {isAdmin && (
                    <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">क्रिया</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => (
                  <tr key={d.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-teal-50/30'}>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">{d.bankName}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{d.taluka}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{d.district}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-mono whitespace-nowrap">{d.ifscCode}</td>
                    {isAdmin && (
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(d.id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-400">
        <p>
          Built with{' '}
          <span className="text-red-400">♥</span>
          {' '}using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'student-bank')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-500 font-semibold hover:underline"
          >
            caffeine.ai
          </a>
          {' '}· © {new Date().getFullYear()} Student Bank
        </p>
      </div>

      {/* Modal */}
      {isAdmin && showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-card-lg">
            <div className="gradient-teal px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-white font-bold text-base">
                {editId ? 'बँक माहिती संपादित करा' : 'नवीन बँक जोडा'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {[
                { label: 'बँकेचे नाव *', field: 'bankName' as keyof BankForm, placeholder: 'बँकेचे पूर्ण नाव' },
                { label: 'तालुका *', field: 'taluka' as keyof BankForm, placeholder: 'तालुका' },
                { label: 'जिल्हा *', field: 'district' as keyof BankForm, placeholder: 'जिल्हा' },
                { label: 'IFSC कोड *', field: 'ifscCode' as keyof BankForm, placeholder: 'IFSC कोड' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[field]}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition-colors ${
                      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-400 bg-gray-50'
                    }`}
                  />
                  {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl gradient-teal text-white font-semibold text-sm shadow-card hover:opacity-90"
                >
                  {editId ? 'अपडेट करा' : 'जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-card-lg">
            <h3 className="font-bold text-gray-800 text-base mb-2">बँक माहिती हटवायची?</h3>
            <p className="text-gray-500 text-sm mb-5">हे कायमचे हटवले जाईल. खात्री आहे का?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
              >
                नाही
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600"
              >
                हो, हटवा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
