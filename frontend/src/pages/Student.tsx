import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, Users, RefreshCw } from 'lucide-react';
import { useGetAllStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../hooks/useQueries';
import type { Student } from '../backend';

const emptyForm = {
  name: '', dateOfBirth: '', studentClass: '', rollNumber: '',
  schoolName: '', taluka: '', district: '',
};

export default function StudentPage() {
  const { data: students = [], isLoading } = useGetAllStudents();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentClass.toLowerCase().includes(search.toLowerCase()) ||
    s.schoolName.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setForm({
      name: s.name, dateOfBirth: s.dateOfBirth, studentClass: s.studentClass,
      rollNumber: s.rollNumber, schoolName: s.schoolName, taluka: s.taluka, district: s.district,
    });
    setEditingId(s.id);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.studentClass || !form.rollNumber || !form.schoolName) {
      setFormError('कृपया सर्व आवश्यक फील्ड भरा');
      return;
    }
    try {
      if (editingId) {
        await updateStudent.mutateAsync({ id: editingId, ...form });
      } else {
        await createStudent.mutateAsync(form);
      }
      setShowModal(false);
      setForm(emptyForm);
    } catch (err: any) {
      setFormError(err.message || 'Error saving student');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Error deleting student');
    }
  };

  const isSaving = createStudent.isPending || updateStudent.isPending;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 font-poppins">👨‍🎓 Students</h2>
          <p className="text-xs text-gray-500 font-poppins">{students.length} विद्यार्थी नोंदणीकृत</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold font-poppins shadow-md transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #0f766e, #7c3aed)' }}
        >
          <Plus size={16} /> नवीन विद्यार्थी
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="विद्यार्थी शोधा..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-poppins focus:outline-none focus:border-teal-400"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-teal-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-poppins text-sm">कोणतेही विद्यार्थी सापडले नाहीत</p>
          <button onClick={openAdd} className="mt-3 text-teal-600 text-sm font-poppins underline">
            नवीन विद्यार्थी जोडा
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #0f766e, #7c3aed)' }}>
                  {['नाव', 'इयत्ता', 'हजेरी नं.', 'शाळा', 'तालुका', 'जिल्हा', 'क्रिया'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-white text-xs font-bold font-poppins whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 font-poppins whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">{s.studentClass}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">{s.rollNumber}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins whitespace-nowrap">{s.schoolName}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">{s.taluka}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-poppins">{s.district}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s.id)}
                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
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
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b" style={{ background: 'linear-gradient(135deg, #0f766e, #7c3aed)' }}>
              <h3 className="text-white font-bold font-poppins">
                {editingId ? '✏️ विद्यार्थी संपादित करा' : '➕ नवीन विद्यार्थी'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {[
                { key: 'name', label: 'विद्यार्थी नाव *', type: 'text', placeholder: 'पूर्ण नाव' },
                { key: 'dateOfBirth', label: 'जन्म दिनांक', type: 'date', placeholder: '' },
                { key: 'studentClass', label: 'इयत्ता *', type: 'text', placeholder: 'उदा. 5वी' },
                { key: 'rollNumber', label: 'हजेरी नंबर *', type: 'text', placeholder: 'हजेरी नंबर' },
                { key: 'schoolName', label: 'शाळेचे नाव *', type: 'text', placeholder: 'शाळेचे नाव' },
                { key: 'taluka', label: 'तालुका', type: 'text', placeholder: 'तालुका' },
                { key: 'district', label: 'जिल्हा', type: 'text', placeholder: 'जिल्हा' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 font-poppins">{field.label}</label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:outline-none text-sm font-poppins"
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
                  style={{ background: 'linear-gradient(135deg, #0f766e, #7c3aed)' }}
                >
                  {isSaving ? <><RefreshCw size={14} className="animate-spin" /> सेव्ह होत आहे...</> : '💾 सेव्ह करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-poppins mb-2">विद्यार्थी हटवायचा?</h3>
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
                disabled={deleteStudent.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold font-poppins disabled:opacity-60"
              >
                {deleteStudent.isPending ? 'हटवत आहे...' : '🗑️ हटवा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
