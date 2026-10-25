import React, { useState } from 'react';
import dataService from '../../services/dataService';
import { Subject } from '../../types';
import { BookOpen, Plus, Edit2, X } from 'lucide-react';

export const AdminSubjectsView: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(dataService.getSubjects());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: 'Languages & Humanities',
    passMark: 50,
  });

  const departments = [
    'Mathematics & Computing',
    'Pure Sciences',
    'Biological Sciences',
    'Languages & Humanities',
    'Commercials',
    'Environmental Studies',
    'Technical & Vocational',
  ];

  const handleOpenAdd = () => {
    setFormData({
      code: 'SUB101',
      name: '',
      department: 'Languages & Humanities',
      passMark: 50,
    });
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({
      code: sub.code,
      name: sub.name,
      department: sub.department,
      passMark: sub.passMark,
    });
    setIsModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingSubject) {
      dataService.updateSubject(editingSubject.id, {
        name: formData.name.trim(),
        code: formData.code.trim(),
        department: formData.department,
        passMark: Number(formData.passMark),
      });
    } else {
      dataService.addSubject({
        name: formData.name.trim(),
        code: formData.code.trim(),
        department: formData.department,
        passMark: Number(formData.passMark),
        status: 'Active',
      });
    }

    setSubjects(dataService.getSubjects());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
            Curriculum & Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage academic subjects, course codes, and passing thresholds.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {sub.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{sub.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(sub)}
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                  title="Edit Subject"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                <span className="block font-semibold text-slate-700">{sub.department}</span>
                <span className="mt-1 block">Pass Mark Threshold: {sub.passMark}%</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold">{sub.status}</span>
              <span className="text-slate-400">Dadaya Curriculum</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-[#064e3b] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Add New Subject'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CSC101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pass Mark (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.passMark}
                    onChange={(e) => setFormData({ ...formData, passMark: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectsView;
