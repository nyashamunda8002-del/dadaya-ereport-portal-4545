import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService';
import { SchoolClass } from '../../types';
import { Plus, Users, X, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AdminClassesView: React.FC = () => {
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => setRefreshCount((c) => c + 1));
  }, []);

  const classes = dataService.getClasses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: 'Lower 6 Sciences',
    formLevel: 'Lower 6' as SchoolClass['formLevel'],
    stream: 'Sciences',
    academicYear: '2025/2026',
  });

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    dataService.addClass(
      {
        name: formData.name.trim(),
        formLevel: formData.formLevel,
        stream: formData.stream.trim(),
        academicYear: formData.academicYear,
      },
      'Administrator'
    );

    setIsModalOpen(false);
    setNotification(`Class "${formData.name.trim()}" created successfully.`);
    setTimeout(() => setNotification(null), 3000);

    setFormData({
      name: 'Lower 6 Arts',
      formLevel: 'Lower 6',
      stream: 'Arts',
      academicYear: '2025/2026',
    });
  };

  const handleConfirmDelete = () => {
    if (!classToDelete) return;
    const name = classToDelete.name;
    dataService.deleteClass(classToDelete.id, 'Administrator');
    setIsDeleteModalOpen(false);
    setClassToDelete(null);
    setNotification(`Class "${name}" has been deleted.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const forms: Array<SchoolClass['formLevel']> = [
    'Form 1',
    'Form 2',
    'Form 3',
    'Form 4',
    'Lower 6',
    'Upper 6',
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Class Stream Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Form 1 through A-Level class streams and enrollment quotas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-[#082B63] text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#1557B0]" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {forms.map((formLevel) => {
        const formClasses = classes.filter((c) => c.formLevel === formLevel);
        if (formClasses.length === 0) return null;

        return (
          <div key={formLevel} className="space-y-3">
            <h2 className="text-base font-bold text-[#082B63] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1557B0]"></span>
              <span>{formLevel} Streams</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {formClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#1557B0] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-sm font-bold text-slate-900">{cls.name}</span>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#1557B0] tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        {cls.stream}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#1557B0]" />
                        <span className="font-bold text-slate-900 tabular-nums">{cls.studentCount ?? 0}</span>
                        <span>Candidates</span>
                      </div>
                      <span className="text-emerald-700 font-semibold">{cls.status}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setClassToDelete(cls);
                        setIsDeleteModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      title={`Delete ${cls.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Modal: Create Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="bg-gradient-to-r from-[#082B63] to-[#1557B0] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Create Class Stream</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Form Level</label>
                <select
                  value={formData.formLevel}
                  onChange={(e) => {
                    const fl = e.target.value as SchoolClass['formLevel'];
                    setFormData({
                      ...formData,
                      formLevel: fl,
                      name: `${fl} ${formData.stream}`,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                >
                  {forms.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stream Name</label>
                <input
                  type="text"
                  placeholder="e.g. Red, Green, Sciences 1, Commercials"
                  required
                  value={formData.stream}
                  onChange={(e) => {
                    const st = e.target.value;
                    setFormData({
                      ...formData,
                      stream: st,
                      name: `${formData.formLevel} ${st}`,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Class Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl font-bold shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {isDeleteModalOpen && classToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-base">Delete Class Stream</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-rose-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <p className="text-slate-700">
                Are you sure you want to delete <strong className="text-slate-900">{classToDelete.name}</strong>?
              </p>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                Deleting this class will remove it from all timetables and Firestore records.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClassesView;
