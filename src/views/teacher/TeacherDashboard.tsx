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
  Sparkles,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
            Welcome back, {teacherName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here's what's happening with your classes today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{formattedToday}</span>
        </div>
      </div>

      {/* Top Row: Metrics + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric Cards (8 cols on lg) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: My Classes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                My Classes
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {myClasses.length}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Assigned Classes</p>
            </div>
          </div>

          {/* Card 2: Total Students */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {myStudents.length || 98}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Across all classes</p>
            </div>
          </div>

          {/* Card 3: Recent Activity */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Recent Activity
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {recentLogs.length}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">Today's entries</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => onNavigate('feed-marks')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 text-xs font-semibold transition-colors text-left border border-emerald-200/80"
            >
              <Edit3 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enter Feed Marks</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('classes')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors text-left border border-slate-200"
            >
              <Users className="w-4 h-4 text-teal-600 shrink-0" />
              <span>View My Classes</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenReportCard('DHS001')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors text-left border border-slate-200"
            >
              <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Generate Report Card</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors text-left border border-slate-200"
            >
              <Settings className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Activity</h3>
            <span className="text-xs text-emerald-700 font-semibold cursor-pointer hover:underline">
              Live Feed
            </span>
          </div>

          <div className="space-y-3.5">
            {recentLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-600 mt-0.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
                    {log.action}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{log.details}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Classes List Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">My Classes</h3>
              <span className="text-xs text-slate-400 font-medium">Form Classes assigned to you</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('classes')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Manage</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {myClasses.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {cls.stream.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {cls.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {cls.studentCount || 24} students
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('classes', { classId: cls.id })}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-3 py-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors"
                >
                  <span>View</span>
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
