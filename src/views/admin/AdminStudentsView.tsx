import React, { useState } from 'react';
import dataService from '../../services/dataService';
import { Student, SchoolClass } from '../../types';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Award,
  AlertTriangle,
  FileDown,
} from 'lucide-react';

interface AdminStudentsViewProps {
  onOpenReportCard: (studentId: string) => void;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({ onOpenReportCard }) => {
  const classes = dataService.getClasses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    surname: '',
    classId: classes[0]?.id || 'form-1-red',
    dob: '2010-01-01',
    gender: 'Male' as 'Male' | 'Female',
    guardianName: '',
    guardianPhone: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Transferred',
  });

  const students = dataService.getStudents({
    classId: selectedClassFilter,
    status: selectedStatusFilter,
    search: searchTerm,
  });

  const handleOpenAdd = () => {
    setFormData({
      id: `DHS${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      surname: '',
      classId: classes[0]?.id || 'form-1-red',
      dob: '2010-01-01',
      gender: 'Male',
      guardianName: '',
      guardianPhone: '',
      status: 'Active',
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFormData({
      id: st.id,
      name: st.name,
      surname: st.surname,
      classId: st.classId,
      dob: st.dob || '2008-01-01',
      gender: st.gender || 'Male',
      guardianName: st.guardianName || '',
      guardianPhone: st.guardianPhone || '',
      status: st.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.surname.trim()) {
      alert('Please provide student name and surname.');
      return;
    }

    const selectedCls = classes.find((c) => c.id === formData.classId);
    const className = selectedCls ? selectedCls.name : 'Form 1 Red';

    if (editingStudent) {
      dataService.updateStudent(editingStudent.id, {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        classId: formData.classId,
        className,
        dob: formData.dob,
        gender: formData.gender,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        status: formData.status,
      });
    } else {
      dataService.addStudent({
        id: formData.id.trim(),
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        classId: formData.classId,
        className,
        dob: formData.dob,
        gender: formData.gender,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        status: formData.status,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = (soft = true) => {
    if (!deletingStudent) return;
    dataService.deleteStudent(deletingStudent.id, soft);
    setDeletingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official candidate academic enrollment, form streams, and registry records.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="/dadaya_high_school_student_register.pdf"
            download="Dadaya_High_School_Student_Register_2026.pdf"
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#082B63] border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Download official PDF register of all enrolled students"
          >
            <FileDown className="w-4 h-4 text-[#1557B0]" />
            <span>Download Register (PDF)</span>
          </a>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, surname, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          />
        </div>

        <div>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.formLevel})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#082B63] font-bold">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Assigned Stream</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {students.length > 0 ? (
                students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 tabular-nums">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-[#082B63]">{st.id}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      {st.name} {st.surname}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{st.className}</td>
                    <td className="py-2.5 px-4 text-slate-500 tabular-nums">{st.dob}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600">{st.gender}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          st.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            st.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        {st.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 font-mono">
                        <button
                          type="button"
                          onClick={() => onOpenReportCard(st.id)}
                          className="text-xs font-semibold text-[#1557B0] hover:text-[#082B63] hover:underline cursor-pointer"
                          title="Generate Report Card"
                        >
                          Report
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(st)}
                          className="text-xs text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                          title="Edit Student"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={() => setDeletingStudent(st)}
                          className="text-xs text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                          title="Deactivate / Delete Student"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans italic">
                    No student records found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 text-xs font-mono text-slate-500 flex justify-between items-center">
          <span>Total Records: {students.length} candidates</span>
          <a
            href="/dadaya_high_school_student_register.pdf"
            download="Dadaya_High_School_Student_Register_2026.pdf"
            className="flex items-center gap-1.5 text-[#1557B0] hover:text-[#082B63] font-semibold hover:underline"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Official Register (PDF)</span>
          </a>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200">
            <div className="bg-gradient-to-r from-[#082B63] to-[#1557B0] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-semibold uppercase focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. P. Chikomba"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    placeholder="+263 77..."
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Transferred">Transferred</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl font-bold shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-slate-900">Manage Student Record</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to modify{' '}
              <span className="font-bold text-slate-900">
                {deletingStudent.name} {deletingStudent.surname} ({deletingStudent.id})
              </span>
              ? As per school policy, soft deactivation is recommended to preserve past marks and term report cards.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Deactivate (Recommended)
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsView;
