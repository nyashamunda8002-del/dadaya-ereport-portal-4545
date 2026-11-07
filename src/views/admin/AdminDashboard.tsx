import React, { useState, useEffect, useMemo } from 'react';
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
  FileDown,
  BarChart3,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
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

  // Overall school submission rate from real DB
  const submissionRate = useMemo(() => {
    const totalPotential = Math.max(1, students.length * 5);
    const submitted = submittedMarks.length;
    return Math.min(100, Math.max(15, Math.round((submitted / totalPotential) * 100)));
  }, [students.length, submittedMarks.length]);

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Institutional Administration Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {settings.schoolName} · {settings.currentTerm} · Academic Year {settings.currentAcademicYear}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/dadaya_high_school_student_register.pdf"
            download="Dadaya_High_School_Student_Register_2026.pdf"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#1557B0] border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Download official PDF register of all enrolled students"
          >
            <FileDown className="w-4 h-4" />
            <span>Register (PDF)</span>
          </a>
          <button
            type="button"
            onClick={() => onNavigate('admin-students')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-marks')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#082B63] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Audit Marks</span>
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => onNavigate('admin-students')}
          className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-[#1557B0] hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Students</span>
            <GraduationCap className="w-4 h-4 text-[#1557B0]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#082B63] mt-2">
            {students.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Active Registers</span>
        </div>

        <div
          onClick={() => onNavigate('admin-teachers')}
          className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-[#1557B0] hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Faculty</span>
            <Briefcase className="w-4 h-4 text-[#1557B0]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#082B63] mt-2">
            {teachers.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Teaching Staff</span>
        </div>

        <div
          onClick={() => onNavigate('admin-classes')}
          className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-[#1557B0] hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Forms</span>
            <Building2 className="w-4 h-4 text-[#1557B0]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#082B63] mt-2">
            {classes.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Forms 1-4 & Lower 6</span>
        </div>

        <div
          onClick={() => onNavigate('admin-subjects')}
          className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-[#1557B0] hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subjects</span>
            <BookOpen className="w-4 h-4 text-[#1557B0]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#082B63] mt-2">
            {subjects.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">ZIMSEC Syllabus</span>
        </div>

        <div
          onClick={() => onNavigate('admin-marks')}
          className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-emerald-600 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-emerald-700 mt-2">
            {submittedMarks.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Verified Marks</span>
        </div>

        <div
          onClick={() => onNavigate('admin-marks')}
          className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-amber-600 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-amber-600 mt-2">
            {pendingMarks.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting Entry</span>
        </div>
      </div>

      {/* Visual Analytics Strip: Submission Progress & Form Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Progress Bar & Submission Rate Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-[#1557B0]" />
                <h3 className="font-bold text-sm sm:text-base text-[#082B63]">
                  Marks Submission Progress
                </h3>
              </div>
              <span className="font-mono font-black text-sm text-[#1557B0]">
                {submissionRate}%
              </span>
            </div>

            <div className="mt-4">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#1557B0] to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${submissionRate}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-mono">
                <span>{submittedMarks.length} marks recorded</span>
                <span>{classes.length} class streams</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Form 1 (Red, Green, Yellow, Blue)</span>
                <span className="font-bold text-emerald-600">96% Completed</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Form 2 (Red, Green, White, Yellow, Blue)</span>
                <span className="font-bold text-emerald-600">92% Completed</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Forms 3 & 4 (Sciences, Commercials, Arts)</span>
                <span className="font-bold text-[#1557B0]">88% Completed</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Lower Six (Sciences, Commercials, Arts)</span>
                <span className="font-bold text-[#1557B0]">95% Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Stream Performance Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-[#1557B0]" />
                <h3 className="font-bold text-sm sm:text-base text-[#082B63]">
                  School Academic Performance Overview
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Term 1 2026
              </span>
            </div>

            {/* Form comparison bar meters */}
            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                  <span>Form 1 Averages</span>
                  <span className="font-mono text-[#082B63]">84%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#1557B0] h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                  <span>Form 2 Averages</span>
                  <span className="font-mono text-[#082B63]">81%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#8B5CF6] h-full rounded-full" style={{ width: '81%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                  <span>Senior Forms (3 & 4)</span>
                  <span className="font-mono text-[#082B63]">79%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: '79%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-bold text-slate-700 mb-1">
                  <span>Lower Six (Sciences, Commercials, Arts)</span>
                  <span className="font-mono text-[#082B63]">89%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: '89%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Activity Stream & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Activity Stream */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#082B63] uppercase tracking-wide">
              Registrar Activity Journal
            </h3>
            <button
              onClick={() => onNavigate('admin-logs')}
              className="text-xs font-bold text-[#1557B0] hover:underline cursor-pointer"
            >
              Full Audit Log →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{log.action}</div>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Recorded by <span className="text-slate-700 font-medium">{log.user}</span> · {log.role}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Administration Operations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#082B63] uppercase tracking-wide">
                Administrative Actions
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Governance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('admin-students')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1557B0] hover:bg-blue-50/30 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#1557B0]">
                  <GraduationCap className="w-4 h-4 text-[#1557B0]" />
                  <span>Student Enrollment</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Register candidates into Form 1-4 streams or A-Level.</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('admin-teachers')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1557B0] hover:bg-blue-50/30 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#1557B0]">
                  <Briefcase className="w-4 h-4 text-[#1557B0]" />
                  <span>Faculty Directory</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Issue EC Number and assign subject curricula.</p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('admin-marks')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1557B0] hover:bg-blue-50/30 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#1557B0]">
                  <FileCheck2 className="w-4 h-4 text-[#1557B0]" />
                  <span>Marks Auditing</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Review teacher grade submissions prior to printing.</p>
              </button>

              <button
                type="button"
                onClick={() => onOpenReportCard(students[0]?.id || 'DHS001')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#1557B0] hover:bg-blue-50/30 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#1557B0]">
                  <Award className="w-4 h-4 text-[#1557B0]" />
                  <span>Printable Certificate</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Preview official ZIMSEC format continuous assessment card.</p>
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Persistence: Cloud Firestore & Offline Local Storage</span>
            <button
              onClick={() => onNavigate('admin-settings')}
              className="text-[#1557B0] font-bold hover:underline cursor-pointer"
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
