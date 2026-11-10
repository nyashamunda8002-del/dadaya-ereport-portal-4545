import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService';
import { Mark, MarkStatus } from '../../types';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Edit2,
  Check,
  X,
} from 'lucide-react';

export const AdminMarksView: React.FC = () => {
  const classes = dataService.getClasses();
  const subjects = dataService.getSubjects();

  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const availableSubjects = selectedClass === 'all'
    ? dataService.getSubjects()
    : dataService.getSubjectsForClass(selectedClass);

  useEffect(() => {
    if (selectedSubject !== 'all' && !availableSubjects.some((s) => s.id === selectedSubject)) {
      setSelectedSubject('all');
    }
  }, [selectedClass, availableSubjects, selectedSubject]);

  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const marks = dataService.getMarks({
    classId: selectedClass,
    subjectId: selectedSubject,
    term: selectedTerm,
  }).filter((m) => {
    if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.studentName.toLowerCase().includes(q) ||
        m.surname.toLowerCase().includes(q) ||
        m.studentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (markId: string) => {
    dataService.updateMarkStatus(markId, 'Approved', 'Administrator');
    setNotification('Mark approved and verified.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBatchApproveAll = () => {
    marks.forEach((m) => {
      if (m.status !== 'Approved') {
        dataService.updateMarkStatus(m.id, 'Approved', 'Administrator');
      }
    });
    setNotification(`All ${marks.length} filtered marks approved successfully.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStartEdit = (m: Mark) => {
    setEditingMark(m);
    setEditValue(String(m.percentage));
  };

  const handleSaveEdit = () => {
    if (!editingMark) return;
    const num = Number(editValue);
    if (isNaN(num) || num < 0 || num > 100) {
      alert('Mark must be between 0 and 100.');
      return;
    }

    const { grade, remark } = dataService.calculateGrade(num);
    const existing = dataService.getMarks().find((m) => m.id === editingMark.id);
    if (existing) {
      existing.mark = Math.round(num);
      existing.percentage = Math.round(num);
      existing.grade = grade;
      existing.remark = remark;
      existing.status = 'Approved';
      existing.updatedAt = new Date().toISOString();
      dataService.logActivity({
        user: 'Administrator',
        role: 'admin',
        action: `Mark corrected - ${existing.studentName} ${existing.surname}`,
        details: `${existing.subjectName} updated to ${num}% (${grade})`,
      });
    }

    setEditingMark(null);
    setNotification('Mark corrected and updated.');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Marks Audit & Approval
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Centrally verify, edit, and approve teacher marks before report card publication.
          </p>
        </div>
        <button
          type="button"
          onClick={handleBatchApproveAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] self-start sm:self-auto cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Batch Approve Filtered Marks</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-[#082B63] text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#1557B0]" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          >
            <option value="all">All Subjects</option>
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#082B63] font-bold text-xs">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Candidate ID</th>
                <th className="py-3 px-4">Curriculum Subject</th>
                <th className="py-3 px-4 text-center">Score (%)</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4 text-center">Audit Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {marks.length > 0 ? (
                marks.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 tabular-nums">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      {m.studentName} {m.surname}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#082B63]">{m.studentId}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{m.subjectName}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-900 tabular-nums">
                      {editingMark?.id === m.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-14 px-1 py-0.5 text-center border-2 border-[#1557B0] rounded-md font-bold focus:outline-hidden"
                        />
                      ) : (
                        `${m.percentage}%`
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold">{m.grade}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500 text-xs">{m.teacherName}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-mono ${
                          m.status === 'Approved'
                            ? 'text-emerald-700 font-semibold'
                            : m.status === 'Submitted'
                            ? 'text-blue-700 font-medium'
                            : 'text-amber-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            m.status === 'Approved'
                              ? 'bg-emerald-500'
                              : m.status === 'Submitted'
                              ? 'bg-[#1557B0]'
                              : 'bg-amber-500'
                          }`}
                        />
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {editingMark?.id === m.id ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="p-1 bg-[#1557B0] text-white rounded hover:bg-[#082B63] cursor-pointer"
                              title="Save correction"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMark(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(m)}
                              className="p-1.5 text-slate-400 hover:text-[#1557B0] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit/Correct Mark"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {m.status !== 'Approved' && (
                              <button
                                type="button"
                                onClick={() => handleApprove(m.id)}
                                className="px-2 py-1 bg-blue-50 text-[#1557B0] hover:bg-blue-100 rounded-lg font-bold text-xs border border-blue-200 transition-colors cursor-pointer"
                                title="Approve Mark"
                              >
                                Approve
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 italic">
                    No marks records found for this filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMarksView;
