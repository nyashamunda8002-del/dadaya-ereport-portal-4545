import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { SchoolClass, Student } from '../../types';
import {
  Users,
  BookOpen,
  Calendar,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  ListFilter,
  GraduationCap,
} from 'lucide-react';

interface TeacherClassesViewProps {
  initialClassId?: string;
  onOpenReportCard: (studentId: string) => void;
}

export const TeacherClassesView: React.FC<TeacherClassesViewProps> = ({
  initialClassId = 'lower-six-sciences',
  onOpenReportCard,
}) => {
  const { currentTeacher, currentUser } = useAuth();
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => setRefreshCount((c) => c + 1));
  }, []);

  const settings = dataService.getSettings();
  const allClasses = dataService.getClasses();
  const subjects = dataService.getSubjects();

  const teacherName = currentTeacher?.title || currentUser?.displayName || 'Mr. Moyo';
  const teacherId = currentTeacher?.id || 'tch-moyo';

  // State
  const [selectedClassId, setSelectedClassId] = useState<string>(
    allClasses.find((c) => c.id === initialClassId)?.id || allClasses[0]?.id || 'lower-six-sciences'
  );

  useEffect(() => {
    if (allClasses.length > 0 && !allClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(allClasses[0].id);
    }
  }, [allClasses, selectedClassId]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'roster' | 'all-classes'>('roster');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Class Form State
  const [formData, setFormData] = useState({
    formLevel: 'Form 2' as SchoolClass['formLevel'],
    stream: 'Green',
    name: 'Form 2 Green',
    academicYear: settings.currentAcademicYear || '2025/2026',
  });

  const pageSize = 6;

  // Ensure selectedClassId is valid
  const currentClass = allClasses.find((c) => c.id === selectedClassId) || allClasses[0];

  useEffect(() => {
    if (!allClasses.find((c) => c.id === selectedClassId) && allClasses.length > 0) {
      setSelectedClassId(allClasses[0].id);
    }
  }, [allClasses, selectedClassId]);

  const classStudents = currentClass
    ? dataService.getStudents({
        classId: currentClass.id,
        search: searchTerm,
      })
    : [];

  const totalStudents = classStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalStudents / pageSize));

  const paginatedStudents = classStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const forms: Array<SchoolClass['formLevel']> = [
    'Form 1',
    'Form 2',
    'Form 3',
    'Form 4',
    'Lower 6',
    'Upper 6',
  ];

  // Handler: Add New Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    if (!cleanName) return;

    if (allClasses.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      setNotification({
        type: 'error',
        message: `Class "${cleanName}" already exists. Please select a different stream name.`,
      });
      return;
    }

    try {
      const newClass = dataService.addClass(
        {
          name: cleanName,
          formLevel: formData.formLevel,
          stream: formData.stream.trim(),
          academicYear: formData.academicYear,
          classTeacherId: teacherId,
          classTeacherName: teacherName,
        },
        teacherName,
        teacherId
      );

      setIsAddModalOpen(false);
      setSelectedClassId(newClass.id);
      setViewMode('roster');
      setNotification({
        type: 'success',
        message: `Class "${newClass.name}" successfully created and added to your teaching schedule.`,
      });

      // Reset form
      setFormData({
        formLevel: 'Form 3',
        stream: 'Gold',
        name: 'Form 3 Gold',
        academicYear: settings.currentAcademicYear || '2025/2026',
      });

      setTimeout(() => setNotification(null), 4000);
    } catch {
      setNotification({
        type: 'error',
        message: 'Could not create class. Please try again.',
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Handler: Open Delete Confirmation Modal
  const handleInitiateDelete = (cls: SchoolClass) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  // Handler: Confirm Class Deletion
  const handleConfirmDelete = () => {
    if (!classToDelete) return;

    const className = classToDelete.name;
    const res = dataService.deleteClass(classToDelete.id, teacherName, teacherId);

    setIsDeleteModalOpen(false);
    setClassToDelete(null);

    if (res.success) {
      setNotification({
        type: 'success',
        message: `Class "${className}" has been permanently deleted from the portal.`,
      });

      // Re-point selectedClassId if the deleted class was currently selected
      const remaining = dataService.getClasses();
      if (remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
    } else {
      setNotification({
        type: 'error',
        message: res.message || 'Failed to delete class.',
      });
    }

    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
            Class Management & Rosters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your teaching classes, enrollments, and student registers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-slate-200/80 p-0.5 border border-slate-300">
            <button
              type="button"
              onClick={() => setViewMode('roster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'roster'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Roster View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all-classes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'all-classes'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Classes ({allClasses.length})</span>
            </button>
          </div>

          {/* Add Class Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* VIEW MODE 1: ALL CLASSES GRID (WITH DELETE ON EACH CARD) */}
      {viewMode === 'all-classes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Dadaya Form Streams Directory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click on any class to view student enrollments or remove an obsolete stream.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Stream</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allClasses.map((cls) => {
              const studentsInThisClass = dataService.getStudents({ classId: cls.id, status: 'Active' });
              const isSelected = cls.id === selectedClassId;

              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                      : 'border-slate-200 shadow-xs hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {cls.formLevel}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1.5">{cls.name}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {cls.academicYear}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-900">
                          {cls.studentCount || studentsInThisClass.length}
                        </span>
                        <span>Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-emerald-700">{cls.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClassId(cls.id);
                        setViewMode('roster');
                      }}
                      className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg transition-colors text-center"
                    >
                      View Roster
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInitiateDelete(cls)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={`Delete ${cls.name}`}
                      aria-label={`Delete ${cls.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CLASS ROSTER WITH SELECTOR & ACTIVE CLASS DELETE */}
      {viewMode === 'roster' && (
        <>
          {/* Class Selector Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="w-full sm:w-auto flex-1 max-w-md">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Class
                </label>
                {currentClass && (
                  <button
                    type="button"
                    onClick={() => handleInitiateDelete(currentClass)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete This Class</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {allClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.formLevel})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="w-full sm:w-64">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Search Student
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentClass?.studentCount || totalStudents || 0}
                </div>
                <div className="text-xs text-slate-500 font-semibold">Enrolled Students</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {subjects.length}
                </div>
                <div className="text-xs text-slate-500 font-semibold">Taught Subjects</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {settings.currentTerm}
                </div>
                <div className="text-xs text-slate-500 font-semibold">{settings.currentAcademicYear}</div>
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {currentClass?.name || 'Class'} Register
                </span>
                <span className="text-xs text-slate-500">
                  ({totalStudents} active students)
                </span>
              </div>

              {currentClass && (
                <button
                  type="button"
                  onClick={() => handleInitiateDelete(currentClass)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Class</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] tracking-wider font-bold">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Surname</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((st, idx) => {
                      const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <tr key={st.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                            {globalIdx}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-3.5 px-4 text-slate-700">{st.surname}</td>
                          <td className="py-3.5 px-4 font-mono font-medium text-emerald-950">
                            {st.id}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{st.className}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              {st.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => onOpenReportCard(st.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Report Card</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                        No students enrolled in this class stream.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing{' '}
                <span className="font-bold text-slate-900">
                  {totalStudents === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{' '}
                -{' '}
                <span className="font-bold text-slate-900">
                  {Math.min(currentPage * pageSize, totalStudents)}
                </span>{' '}
                of <span className="font-bold text-slate-900">{totalStudents}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === pg
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL 1: ADD CLASS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-[#064e3b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Add New Teaching Class</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Form Level</label>
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  {forms.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stream Name</label>
                <input
                  type="text"
                  placeholder="e.g. Red, Green, Blue, Yellow, Sciences 1, Commercials"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Class Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                This class stream will be assigned to <strong>{teacherName}</strong> and immediately synced with the Cloud database.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CLASS CONFIRMATION */}
      {isDeleteModalOpen && classToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-base">Delete Class Stream</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-rose-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <p className="text-slate-700 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-900">{classToDelete.name}</strong>?
              </p>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                <p className="font-bold">Important Notice:</p>
                <p>
                  This class has{' '}
                  <strong>{dataService.getStudents({ classId: classToDelete.id }).length}</strong> enrolled
                  student(s). Deleting will remove this class stream from your timetable and Cloud Firestore.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
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

export default TeacherClassesView;
