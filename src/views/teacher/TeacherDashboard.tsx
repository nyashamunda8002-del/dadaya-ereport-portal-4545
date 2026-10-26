import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { SchoolClass, ActivityLog } from '../../types';
import {
  Users,
  Clock,
  BookOpen,
  Edit3,
  FileText,
  Settings,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Plus,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: string, context?: { classId?: string }) => void;
  onOpenReportCard: (studentId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onOpenReportCard,
}) => {
  const { currentTeacher, currentUser } = useAuth();
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => setRefreshCount((c) => c + 1));
  }, []);

  const teacherName = currentTeacher?.title || currentUser?.displayName || 'Mr. Moyo';
  const assignedClassIds = currentTeacher?.assignedClassIds || [
    'lower-six-sciences',
    'lower-six-commercials',
    'lower-six-arts',
  ];

  const allClasses = dataService.getClasses();
  const myClasses = allClasses.filter((c) => assignedClassIds.includes(c.id)).length > 0
    ? allClasses.filter((c) => assignedClassIds.includes(c.id))
    : allClasses;

  const allStudents = dataService.getStudents();
  const myStudents = allStudents.filter((s) => assignedClassIds.includes(s.classId) && s.status === 'Active');

  const recentLogs = dataService.getActivityLogs(6);

  const formattedToday = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif-school text-xl sm:text-2xl font-black text-[#064e3b] tracking-wide uppercase">
            Faculty Console · {teacherName}
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Dadaya High School Continuous Assessment Feeding System
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-600 bg-white px-3 py-1.5 rounded-md border border-stone-200 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-emerald-800" />
          <span>{formattedToday}</span>
        </div>
      </div>

      {/* Top Row: Metrics + Faculty Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Cards (8 cols on lg) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Assigned Classes */}
          <div className="bg-white rounded-md p-4 border border-stone-200">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Assigned Forms
              </span>
              <BookOpen className="w-4 h-4 text-emerald-800" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                {myClasses.length}
              </span>
              <p className="text-[11px] text-stone-500 font-mono mt-1">Teaching streams</p>
            </div>
          </div>

          {/* Card 2: Total Candidates */}
          <div className="bg-white rounded-md p-4 border border-stone-200">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Active Candidates
              </span>
              <Users className="w-4 h-4 text-emerald-800" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                {myStudents.length || 98}
              </span>
              <p className="text-[11px] text-stone-500 font-mono mt-1">Enrolled students</p>
            </div>
          </div>

          {/* Card 3: Recent Activity Entries */}
          <div className="bg-white rounded-md p-4 border border-stone-200">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-[10px] font-mono uppercase tracking-wider">
                Journal Entries
              </span>
              <Clock className="w-4 h-4 text-emerald-800" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                {recentLogs.length}
              </span>
              <p className="text-[11px] text-stone-500 font-mono mt-1">Logged sessions</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-white rounded-md p-4 border border-stone-200 flex flex-col justify-between">
          <h3 className="text-[11px] font-mono font-bold text-stone-700 uppercase tracking-wider mb-2">
            Faculty Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => onNavigate('feed-marks')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-semibold transition-colors text-left cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Enter Marks Roster</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('classes')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium transition-colors text-left border border-stone-200 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Review Class Registers</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenReportCard('DHS001')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium transition-colors text-left border border-stone-200 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Print Candidate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white rounded-md p-5 border border-stone-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
            <h3 className="font-serif-school text-sm font-bold text-stone-900 tracking-wide uppercase">
              Recent Activity Journal
            </h3>
            <span className="text-[11px] font-mono text-stone-400">
              Audit Stream
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {recentLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="py-2.5 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-semibold text-stone-800 leading-tight">
                    {log.action}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] font-mono text-stone-400 shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Classes List Card */}
        <div className="bg-white rounded-md p-5 border border-stone-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
            <div>
              <h3 className="font-serif-school text-sm font-bold text-stone-900 tracking-wide uppercase">
                Allocated Forms
              </h3>
              <span className="text-[10px] font-mono text-stone-400">Curriculum teaching assignments</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('classes')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors border border-emerald-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage</span>
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {myClasses.map((cls) => (
              <div
                key={cls.id}
                className="py-2.5 flex items-center justify-between hover:bg-stone-50/60 px-1 rounded transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-emerald-900 text-white flex items-center justify-center font-mono font-bold text-xs">
                    {cls.stream.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900 group-hover:text-emerald-900 transition-colors">
                      {cls.name}
                    </h4>
                    <p className="text-[11px] font-mono text-stone-500">
                      {cls.studentCount || 24} candidates enrolled
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('classes', { classId: cls.id })}
                  className="flex items-center gap-1 text-xs font-mono text-emerald-800 hover:text-emerald-950 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  <span>Register</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
