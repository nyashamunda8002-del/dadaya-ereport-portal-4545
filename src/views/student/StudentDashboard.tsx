import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { Mark, Student } from '../../types';
import {
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileText,
  Printer,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenReportCard: (studentId: string, term?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenReportCard }) => {
  const { currentStudent, currentUser } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => setRefreshCount((c) => c + 1));
  }, []);

  const studentId = currentStudent?.id || currentUser?.associatedId || 'DHS001';
  const student = currentStudent || dataService.getStudentById(studentId) || dataService.getStudents()[0];
  const settings = dataService.getSettings();

  if (!student) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto mt-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#064e3b] mx-auto flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Welcome to Dadaya High School</h3>
        <p className="text-sm text-slate-500 mt-2">
          The database currently has no students enrolled. Please enroll in Lower Six (Sciences, Commercials, or Arts) on the student enrollment page.
        </p>
      </div>
    );
  }

  const summary = dataService.getStudentPerformanceSummary(
    student.id,
    selectedTerm,
    settings.currentAcademicYear
  );

  const marks = summary.marks;
  const average = summary.average;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (average / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif-school text-xl sm:text-2xl font-black text-[#064e3b] tracking-wide uppercase">
            Candidate Academic Record
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            {student.name} {student.surname} · Candidate ID: {student.id} · Form: {student.className}
          </p>
        </div>

        {/* Term Dropdown & View Report Card Button */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-mono font-semibold rounded-md border border-stone-300 bg-white text-stone-900 focus:outline-hidden cursor-pointer"
          >
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>

          <button
            type="button"
            onClick={() => onOpenReportCard(student.id, selectedTerm)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4 text-emerald-300" />
            <span>Official Report Card</span>
          </button>
        </div>
      </div>

      {/* Top 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Performance Card */}
        <div className="lg:col-span-5 bg-white rounded-md p-5 border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-serif-school text-sm font-bold text-stone-900 tracking-wide uppercase">
              Term Standing
            </h3>
            <span className="text-[10px] font-mono text-stone-400">Continuous Assessment</span>
          </div>

          <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Circular Gauge / Donut in Emerald Green */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="text-slate-100"
                  strokeWidth="14"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="text-emerald-500 transition-all duration-700 ease-out"
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {average}%
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Average
                </span>
              </div>
            </div>

            {/* Legend / Category breakdown */}
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Excellent</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{summary.categories.excellent}</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <span>Good</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{summary.categories.good}</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Fair</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{summary.categories.fair}</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Needs Improvement</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {summary.categories.needsImprovement}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluated Subjects: {marks.length}</span>
            <span className="font-semibold text-emerald-800">Class: {student.className}</span>
          </div>
        </div>

        {/* Right: Subject Performance Bars */}
        <div className="lg:col-span-7 bg-white rounded-md p-5 border border-stone-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
            <h3 className="font-serif-school text-sm font-bold text-stone-900 tracking-wide uppercase">
              Curriculum Mark Breakdown
            </h3>
            <span className="text-[10px] font-mono text-stone-400">{marks.length} Subjects Evaluated</span>
          </div>

          <div className="space-y-3 font-mono">
            {marks.length > 0 ? (
              marks.map((m, idx) => (
                <div key={m.id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-medium text-stone-800 flex items-center gap-2">
                      <span className="text-stone-400 font-mono text-[11px]">{idx + 1}.</span>
                      {m.subjectName}
                    </span>
                    <span className="font-bold font-mono text-stone-900 tabular-nums">{m.percentage}%</span>
                  </div>
                  {/* Clean hairline bar */}
                  <div className="w-full h-1.5 bg-stone-100 rounded-xs overflow-hidden">
                    <div
                      className={`h-full rounded-xs transition-all duration-500 ${
                        m.percentage >= 80
                          ? 'bg-emerald-800'
                          : m.percentage >= 70
                          ? 'bg-teal-700'
                          : m.percentage >= 50
                          ? 'bg-amber-700'
                          : 'bg-rose-700'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, m.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-stone-400 italic font-sans text-xs">
                No marks recorded for {selectedTerm} yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Results Table */}
      <div className="bg-white rounded-md border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-serif-school text-sm font-bold text-stone-900 tracking-wide uppercase">
            Official Continuous Assessment Summary
          </h3>
          <button
            type="button"
            onClick={() => onOpenReportCard(student.id, selectedTerm)}
            className="flex items-center gap-1 text-xs font-mono text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
          >
            <span>Full Printable Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] font-mono tracking-wider">
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4 text-center">Percentage</th>
                <th className="py-2.5 px-4">Term</th>
                <th className="py-2.5 px-4">Performance Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {marks.slice(0, 5).map((m) => {
                const gradeInfo = dataService.calculateGrade(m.percentage);
                return (
                  <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-stone-900">{m.subjectName}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-950 tabular-nums">
                      {m.percentage}%
                    </td>
                    <td className="py-2.5 px-4 text-stone-600">{m.term}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            gradeInfo.category === 'Excellent'
                              ? 'bg-emerald-700'
                              : gradeInfo.category === 'Good'
                              ? 'bg-teal-700'
                              : gradeInfo.category === 'Fair'
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                        />
                        <span className="text-stone-700">{gradeInfo.category}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
