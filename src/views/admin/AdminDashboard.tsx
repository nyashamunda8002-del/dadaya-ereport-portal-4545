import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService';
import {
  Users,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  FileCheck2,
  Clock,
  Award,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenReportCard: (studentId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenReportCard,
}) => {
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => setRefreshCount((c) => c + 1));
  }, []);

  const students = dataService.getStudents();
  const teachers = dataService.getTeachers();
  const classes = dataService.getClasses();
  const subjects = dataService.getSubjects();
  const marks = dataService.getMarks();
  const logs = dataService.getActivityLogs(6);
  const settings = dataService.getSettings();

  const submittedMarks = marks.filter((m) => m.status === 'Submitted' || m.status === 'Approved');
  const pendingMarks = marks.filter((m) => m.status === 'Saved' || m.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            System overview for {settings.schoolName} • {settings.currentTerm} ({settings.currentAcademicYear})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('admin-students')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-marks')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Review Marks</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <div
          onClick={() => onNavigate('admin-students')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Students</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {students.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Active Rosters</span>
        </div>

        <div
          onClick={() => onNavigate('admin-teachers')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Teachers</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {teachers.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Faculty Staff</span>
        </div>

        <div
          onClick={() => onNavigate('admin-classes')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Classes</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {classes.length}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Form 1 - A Level</span>
        </div>

        <div
          onClick={() => onNavigate('admin-subjects')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Subjects</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {subjects.length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Curriculum</span>
        </div>

        <div
          onClick={() => onNavigate('admin-marks')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Submitted</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {submittedMarks.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Ready / Approved</span>
        </div>

        <div
          onClick={() => onNavigate('admin-marks')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
            {pendingMarks.length}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Saved drafts</span>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Activity Stream */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Real-time Activity Stream</h3>
            <button
              onClick={() => onNavigate('admin-logs')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View Full Audit Log →
            </button>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
              >
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-emerald-950 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    By {log.user} ({log.role})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Administration Operations */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Administrative Operations</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('admin-students')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all"
            >
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Enroll Student</span>
              </div>
              <p className="text-slate-500 mt-1">Register new student and assign to form stream.</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin-teachers')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all"
            >
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span>Create Teacher</span>
              </div>
              <p className="text-slate-500 mt-1">Issue EC Number and assign classes & subjects.</p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin-marks')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all"
            >
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Marks Approvals</span>
              </div>
              <p className="text-slate-500 mt-1">Review and approve teacher term submissions.</p>
            </button>

            <button
              type="button"
              onClick={() => onOpenReportCard('DHS001')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all"
            >
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Sample Report Card</span>
              </div>
              <p className="text-slate-500 mt-1">Inspect official printable A4 report format.</p>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Database Mode: Real Persistent Firestore/Local Sync</span>
            <button
              onClick={() => onNavigate('admin-settings')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Configure Firebase →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
