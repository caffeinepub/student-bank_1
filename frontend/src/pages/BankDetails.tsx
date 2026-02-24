import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Building2, RefreshCw, Search } from 'lucide-react';
import {
  useGetAllBankDetails,
  useCreateBankDetail,
  useUpdateBankDetail,
  useDeleteBankDetail,
} from '../hooks/useQueries';
import type { BankDetail } from '../backend';

interface BankDetailsProps {
  isAdmin: boolean;
}

const emptyForm = { bankName: '', taluka: '', district: '', ifscCode: '' };

export default function BankDetails({ isAdmin }: BankDetailsProps) {
  const { data: bankDetails = [], isLoading } = useGetAllBankDetails();
  const createBankDetail = useCreateBankDetail();
  const updateBankDetail = useUpdateBankDetail();
  const deleteBankDetail = useDeleteBankDetail();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const filtered = bankDetails.filter(b =>
    b.bankName.toLowerCase().includes(search.toLowerCase()) ||
    b.taluka.toLowerCase().includes(search.toLowerCase()) ||
    b.district.toLowerCase().includes(search.toLowerCase()) ||
    b.ifscCode.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (b: BankDetail) => {
    setForm({
      bankName: b.bankName,
      taluka: b.taluka,
      district: b.district,
      ifscCode: b.ifscCode,
    });
    setEditingId(b.id);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bankName || !form.ifscCode) {
      setFormError('कृपया बँक नाव आणि IFSC Code भरा');
      return;
    }
    try {
      if (editingId) {
        await updateBankDetail.mutateAsync({ id: editingId, ...form });
      } else {
        await createBankDetail.mutateAsync(form);
      }
      setShowModal(false);
      setForm(emptyForm);
    } catch (err: any) {
      setFormError(err.message || 'Error saving bank detail');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBankDetail.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting bank detail');
    }
  };

  const isSaving = createBankDetail.isPending || updateBankDetail.isPending;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 font-poppins">🏦 Bank Details</h2>
          <p className="text-xs text-gray-500 font-poppins">{bankDetails.length} बँका नोंदणीकृत</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold font-poppins shadow-md"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
          >
            <Plus size={16} /> नवीन बँक
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
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-poppins focus:outline-none focus:border-yellow-400"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-yellow-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-poppins text-sm">कोणतीही बँक माहिती सापडली नाही</p>
          {isAdmin && (
            <button onClick={openAdd} className="mt-3 text-yellow-600 text-sm font-poppins underline">
              नवीन बँक जोडा
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}>
                  {['बँक नाव', 'तालुका', 'जिल्हा', 'IFSC Code', ...(isAdmin ? ['क्रिया'] : [])].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-white text-xs font-bold font-poppins whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, idx) => (
                  <tr key={b.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 font-poppins whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 flex-shrink-0">
                          <Building2 size={14} />
                        </span>
                        {b.bankName}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">{b.taluka || '-'}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">{b.district || '-'}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins font-mono text-xs">{b.ifscCode}</td>
                    {isAdmin && (
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(b.id)}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
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
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
            >
              <h3 className="text-white font-bold font-poppins">
                {editingId ? '✏️ बँक माहिती संपादित करा' : '➕ नवीन बँक माहिती'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {[
                { key: 'bankName', label: 'बँक नाव *', placeholder: 'बँकेचे नाव' },
                { key: 'taluka', label: 'तालुका', placeholder: 'तालुका' },
                { key: 'district', label: 'जिल्हा', placeholder: 'जिल्हा' },
                { key: 'ifscCode', label: 'IFSC Code *', placeholder: 'IFSC Code' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-yellow-400 focus:outline-none text-sm font-poppins"
                  />
                </div>
              ))}

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2 font-poppins">
                  ⚠️ {formError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold font-poppins hover:bg-gray-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold font-poppins disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)' }}
                >
                  {isSaving ? (
                    <><RefreshCw size={14} className="animate-spin" /> सेव्ह होत आहे...</>
                  ) : '💾 सेव्ह करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && isAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-poppins mb-2">बँक माहिती हटवायची?</h3>
            <p className="text-sm text-gray-500 font-poppins mb-4">हे कायमचे हटवले जाईल.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold font-poppins"
              >
                रद्द करा
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteBankDetail.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold font-poppins disabled:opacity-60"
              >
                {deleteBankDetail.isPending ? 'हटवत आहे...' : '🗑️ हटवा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
