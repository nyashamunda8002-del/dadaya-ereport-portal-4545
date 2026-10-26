import React, { useState } from 'react';
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
            Marks Audit & Approval
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Centrally verify, edit, and approve teacher marks before report card publication.
          </p>
        </div>
        <button
          type="button"
          onClick={handleBatchApproveAll}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Batch Approve Filtered Marks</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
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
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
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
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
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
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Saved">Saved</option>
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
              placeholder="Student name/ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Marks Table - Continuous Assessment Ledger */}
      <div className="bg-white rounded-md border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] font-mono tracking-wider">
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
            <tbody className="divide-y divide-stone-100 font-mono">
              {marks.length > 0 ? (
                marks.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center text-stone-400 tabular-nums">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-stone-900">
                      {m.studentName} {m.surname}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium text-emerald-950">{m.studentId}</td>
                    <td className="py-2.5 px-4 font-sans text-stone-700">{m.subjectName}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-stone-900 tabular-nums">
                      {editingMark?.id === m.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-14 px-1 py-0.5 text-center border border-emerald-700 rounded-sm font-bold"
                        />
                      ) : (
                        `${m.percentage}%`
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold">{m.grade}</td>
                    <td className="py-2.5 px-4 font-sans text-stone-500 text-xs">{m.teacherName}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-mono ${
                          m.status === 'Approved'
                            ? 'text-emerald-800 font-semibold'
                            : m.status === 'Submitted'
                            ? 'text-teal-800 font-medium'
                            : 'text-amber-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            m.status === 'Approved'
                              ? 'bg-emerald-600'
                              : m.status === 'Submitted'
                              ? 'bg-teal-600'
                              : 'bg-amber-600'
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
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Save correction"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMark(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
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
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit/Correct Mark"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {m.status !== 'Approved' && (
                              <button
                                type="button"
                                onClick={() => handleApprove(m.id)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs border border-emerald-200 transition-colors"
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
