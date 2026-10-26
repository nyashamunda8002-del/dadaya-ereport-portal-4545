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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif-school text-xl sm:text-2xl font-black text-[#064e3b] tracking-wide uppercase">
            Administrative Control Panel
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            {settings.schoolName} · {settings.currentTerm} · Academic Year {settings.currentAcademicYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('admin-students')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll Student</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-marks')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Audit Marks</span>
          </button>
        </div>
      </div>

      {/* Metric Cards - Institutional Registrar Style */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigate('admin-students')}
          className="bg-white rounded-md p-4 border border-stone-200 hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 mt-2">
            {students.length}
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">Active Registers</span>
        </div>

        <div
          onClick={() => onNavigate('admin-teachers')}
          className="bg-white rounded-md p-4 border border-stone-200 hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Faculty</span>
            <Briefcase className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 mt-2">
            {teachers.length}
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">Teaching Staff</span>
        </div>

        <div
          onClick={() => onNavigate('admin-classes')}
          className="bg-white rounded-md p-4 border border-stone-200 hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Forms</span>
            <Building2 className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 mt-2">
            {classes.length}
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">Lower 6 & O-Level</span>
        </div>

        <div
          onClick={() => onNavigate('admin-subjects')}
          className="bg-white rounded-md p-4 border border-stone-200 hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Subjects</span>
            <BookOpen className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-stone-900 mt-2">
            {subjects.length}
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">ZIMSEC Syllabus</span>
        </div>

        <div
          onClick={() => onNavigate('admin-marks')}
          className="bg-white rounded-md p-4 border border-stone-200 hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 mt-2">
            {submittedMarks.length}
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">Verified Marks</span>
        </div>

        <div
          onClick={() => onNavigate('admin-marks')}
          className="bg-white rounded-md p-4 border border-stone-200 hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[10px] font-mono uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-800 mt-2">
            {pendingMarks.length}
          </div>
          <span className="text-[10px] text-stone-500 font-mono mt-1 block">Awaiting Entry</span>
        </div>
      </div>

      {/* Two Column Layout: Activity Stream & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Activity Stream */}
        <div className="bg-white rounded-md p-5 border border-stone-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
            <h3 className="font-serif-school text-sm font-bold text-stone-900 tracking-wide uppercase">
              Registrar Activity Journal
            </h3>
            <button
              onClick={() => onNavigate('admin-logs')}
              className="text-xs font-mono text-emerald-800 hover:underline"
            >
              Full Audit Log →
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-stone-900">{log.action}</div>
                  <p className="text-stone-600 mt-0.5">{log.details}</p>
                  <div className="text-[11px] text-stone-400 font-mono mt-1">
                    Recorded by <span className="text-stone-700 font-medium">{log.user}</span> · {log.role}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-stone-400 shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Administration Operations */}
        <div className="bg-white rounded-md p-5 border border-stone-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
              <h3 className="font-serif-school text-sm font-bold text-stone-900 tracking-wide uppercase">
                Administrative Actions
              </h3>
              <span className="text-[10px] font-mono text-stone-400">Authorized Personnel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('admin-students')}
                className="p-3 rounded-md border border-stone-200 hover:border-emerald-700 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-stone-900 flex items-center gap-2 group-hover:text-emerald-900">
                  <GraduationCap className="w-4 h-4 text-emerald-800" />
                  <span>Student Enrollment</span>
                </div>
                <p className="text-stone-500 text-[11px] mt-1">Register candidates into Form 6 streams or Form 1-4 classes.</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('admin-teachers')}
                className="p-3 rounded-md border border-stone-200 hover:border-emerald-700 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-stone-900 flex items-center gap-2 group-hover:text-emerald-900">
                  <Briefcase className="w-4 h-4 text-emerald-800" />
                  <span>Faculty Directory</span>
                </div>
                <p className="text-stone-500 text-[11px] mt-1">Issue EC Number and assign subject curricula.</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('admin-marks')}
                className="p-3 rounded-md border border-stone-200 hover:border-emerald-700 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-stone-900 flex items-center gap-2 group-hover:text-emerald-900">
                  <FileCheck2 className="w-4 h-4 text-emerald-800" />
                  <span>Marks Auditing</span>
                </div>
                <p className="text-stone-500 text-[11px] mt-1">Review teacher grade submissions prior to printing.</p>
              </button>

              <button
                type="button"
                onClick={() => onOpenReportCard('DHS001')}
                className="p-3 rounded-md border border-stone-200 hover:border-emerald-700 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-stone-900 flex items-center gap-2 group-hover:text-emerald-900">
                  <Award className="w-4 h-4 text-emerald-800" />
                  <span>Printable Certificate</span>
                </div>
                <p className="text-stone-500 text-[11px] mt-1">Preview official ZIMSEC format continuous assessment card.</p>
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono">
            <span>Persistence: Firestore & Offline IndexedDB Sync</span>
            <button
              onClick={() => onNavigate('admin-settings')}
              className="text-emerald-800 font-semibold hover:underline"
            >
              System Settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
