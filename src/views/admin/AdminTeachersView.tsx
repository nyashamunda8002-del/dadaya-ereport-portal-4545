import React, { useState } from 'react';
import dataService from '../../services/dataService';
import { Teacher, SchoolClass, Subject } from '../../types';
import {
  Plus,
  Search,
  Briefcase,
  Edit2,
  CheckCircle,
  X,
  Mail,
  Phone,
} from 'lucide-react';

export const AdminTeachersView: React.FC = () => {
  const classes = dataService.getClasses();
  const subjects = dataService.getSubjects();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    title: '',
    email: '',
    ecNumber: '',
    phone: '',
    assignedClassIds: [] as string[],
    assignedSubjectIds: [] as string[],
    status: 'Active' as 'Active' | 'On Leave',
  });

  const teachers = dataService.getTeachers().filter((t) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.surname.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.ecNumber.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      surname: '',
      title: 'Mr. / Mrs.',
      email: '',
      ecNumber: `EC${Math.floor(10000 + Math.random() * 90000)}`,
      phone: '+263 77 ',
      assignedClassIds: [classes[0]?.id || 'form-1-red'],
      assignedSubjectIds: [subjects[0]?.id || 'maths'],
      status: 'Active',
    });
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tch: Teacher) => {
    setEditingTeacher(tch);
    setFormData({
      name: tch.name,
      surname: tch.surname,
      title: tch.title,
      email: tch.email,
      ecNumber: tch.ecNumber,
      phone: tch.phone || '',
      assignedClassIds: [...tch.assignedClassIds],
      assignedSubjectIds: [...tch.assignedSubjectIds],
      status: tch.status,
    });
    setIsModalOpen(true);
  };

  const toggleClassAssignment = (classId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedClassIds.includes(classId);
      return {
        ...prev,
        assignedClassIds: exists
          ? prev.assignedClassIds.filter((id) => id !== classId)
          : [...prev.assignedClassIds, classId],
      };
    });
  };

  const toggleSubjectAssignment = (subjectId: string) => {
    setFormData((prev) => {
      const exists = prev.assignedSubjectIds.includes(subjectId);
      return {
        ...prev,
        assignedSubjectIds: exists
          ? prev.assignedSubjectIds.filter((id) => id !== subjectId)
          : [...prev.assignedSubjectIds, subjectId],
      };
    });
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.surname.trim() || !formData.email.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editingTeacher) {
      dataService.updateTeacher(editingTeacher.id, {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        title: formData.title.trim() || `${formData.name} ${formData.surname}`,
        email: formData.email.trim(),
        ecNumber: formData.ecNumber.trim(),
        phone: formData.phone.trim(),
        assignedClassIds: formData.assignedClassIds,
        assignedSubjectIds: formData.assignedSubjectIds,
        status: formData.status,
      });
    } else {
      dataService.addTeacher({
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        title: formData.title.trim() || `${formData.name} ${formData.surname}`,
        email: formData.email.trim(),
        ecNumber: formData.ecNumber.trim(),
        phone: formData.phone.trim(),
        assignedClassIds: formData.assignedClassIds,
        assignedSubjectIds: formData.assignedSubjectIds,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Teacher Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage faculty staff, EC numbers, and assign classes & subjects.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by teacher name, title, EC number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teachers.map((tch) => {
          const assignedClasses = classes.filter((c) => tch.assignedClassIds.includes(c.id));
          const assignedSubjects = subjects.filter((s) => tch.assignedSubjectIds.includes(s.id));

          return (
            <div
              key={tch.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1557B0] border border-blue-200/60 flex items-center justify-center font-bold font-serif-school text-lg shadow-xs">
                      {tch.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#082B63] text-base">{tch.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                          {tch.ecNumber}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{tch.status}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(tch)}
                    className="p-2 text-slate-400 hover:text-[#1557B0] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Teacher"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tch.email}</span>
                  </div>
                  {tch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tch.phone}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Classes */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Classes ({assignedClasses.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedClasses.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-md bg-blue-50 text-[#082B63] text-[11px] font-semibold border border-blue-200/80"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Subjects */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Assigned Subjects ({assignedSubjects.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedSubjects.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-800 text-[11px] font-semibold border border-slate-200"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="bg-gradient-to-r from-[#082B63] to-[#1557B0] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingTeacher ? `Edit Faculty: ${editingTeacher.title}` : 'Add New Faculty Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Mr. Gunda"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Surname</label>
                  <input
                    type="text"
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@dadaya.ac.zw"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">EC Number</label>
                  <input
                    type="text"
                    required
                    value={formData.ecNumber}
                    onChange={(e) => setFormData({ ...formData, ecNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Multi-assign Classes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign Classes ({formData.assignedClassIds.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {classes.map((c) => {
                    const isSelected = formData.assignedClassIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                          isSelected
                            ? 'bg-[#1557B0] text-white border-[#082B63] font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleClassAssignment(c.id)}
                          className="hidden"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Multi-assign Subjects */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign Subjects ({formData.assignedSubjectIds.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {subjects.map((s) => {
                    const isSelected = formData.assignedSubjectIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                          isSelected
                            ? 'bg-[#082B63] text-white border-blue-900 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSubjectAssignment(s.id)}
                          className="hidden"
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
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
                  {editingTeacher ? 'Save Changes' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachersView;
