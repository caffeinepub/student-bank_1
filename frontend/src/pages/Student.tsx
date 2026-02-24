import React, { useState, useEffect } from 'react';
import {
  getStudents, addStudent, updateStudent, deleteStudent,
  type StudentRecord
} from '../utils/localStorage';
import { Plus, Pencil, Trash2, X, Search, Users } from 'lucide-react';

interface StudentForm {
  name: string;
  dob: string;
  className: string;
  attendanceNumber: string;
  schoolName: string;
  taluka: string;
  district: string;
}

const emptyForm: StudentForm = {
  name: '', dob: '', className: '', attendanceNumber: '',
  schoolName: '', taluka: '', district: '',
};

export default function Student() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<StudentForm>>({});
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = () => setStudents(getStudents());

  useEffect(() => { load(); }, []);

  const validate = (): boolean => {
    const e: Partial<StudentForm> = {};
    if (!form.name.trim()) e.name = 'नाव आवश्यक आहे';
    if (!form.dob) e.dob = 'जन्म दिनांक आवश्यक आहे';
    if (!form.className.trim()) e.className = 'इयत्ता आवश्यक आहे';
    if (!form.attendanceNumber.trim()) e.attendanceNumber = 'हजेरी नंबर आवश्यक आहे';
    if (!form.schoolName.trim()) e.schoolName = 'शाळेचे नाव आवश्यक आहे';
    if (!form.taluka.trim()) e.taluka = 'तालुका आवश्यक आहे';
    if (!form.district.trim()) e.district = 'जिल्हा आवश्यक आहे';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      updateStudent(editId, form);
    } else {
      addStudent(form);
    }
    load();
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleEdit = (s: StudentRecord) => {
    setForm({
      name: s.name, dob: s.dob, className: s.className,
      attendanceNumber: s.attendanceNumber, schoolName: s.schoolName,
      taluka: s.taluka, district: s.district,
    });
    setEditId(s.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    load();
    setDeleteConfirm(null);
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    s.className.toLowerCase().includes(search.toLowerCase())
  );

  const InputField = ({ label, field, type = 'text', placeholder = '' }: {
    label: string; field: keyof StudentForm; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm focus:outline-none transition-colors ${
          errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-purple-400 bg-gray-50'
        }`}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">विद्यार्थी यादी</h2>
          <p className="text-xs text-gray-500">{students.length} विद्यार्थी नोंदणीकृत</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setErrors({}); setShowModal(true); }}
          className="flex items-center gap-2 gradient-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-glow hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={16} />
          नवीन विद्यार्थी
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
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-sm bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">कोणतेही विद्यार्थी सापडले नाहीत</p>
            <p className="text-xs mt-1">नवीन विद्यार्थी जोडण्यासाठी वरील बटण दाबा</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="gradient-primary text-white">
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">#</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">नाव</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">इयत्ता</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">हजेरी</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">शाळा</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">तालुका</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold whitespace-nowrap">जिल्हा</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold whitespace-nowrap">क्रिया</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{s.className}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{s.attendanceNumber}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{s.schoolName}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{s.taluka}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{s.district}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s.id)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete"
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
            <div className="gradient-primary px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-white font-bold text-base">
                {editId ? 'विद्यार्थी संपादित करा' : 'नवीन विद्यार्थी'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <InputField label="विद्यार्थी नाव *" field="name" placeholder="पूर्ण नाव टाका" />
              <InputField label="जन्म दिनांक *" field="dob" type="date" />
              <InputField label="इयत्ता *" field="className" placeholder="उदा: 5वी, 8वी" />
              <InputField label="हजेरी नंबर *" field="attendanceNumber" placeholder="हजेरी क्रमांक" />
              <InputField label="शाळेचे नाव *" field="schoolName" placeholder="शाळेचे नाव" />
              <InputField label="तालुका *" field="taluka" placeholder="तालुका" />
              <InputField label="जिल्हा *" field="district" placeholder="जिल्हा" />
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
                  className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold text-sm shadow-glow hover:opacity-90"
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
            <h3 className="font-bold text-gray-800 text-base mb-2">विद्यार्थी हटवायचा?</h3>
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
