import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import {
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenReportCard: (studentId: string, term?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenReportCard }) => {
  const { currentStudent, currentUser } = useAuth();
  const studentId = currentStudent?.id || currentUser?.associatedId || 'DHS001';
  const student = currentStudent || dataService.getStudentById(studentId) || dataService.getStudents()[0];
  const settings = dataService.getSettings();

  // Automatically determine the term of the marks entered recently
  const mostRecentTerm = dataService.getMostRecentTerm(student?.id || studentId);
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(mostRecentTerm);
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => {
      setRefreshCount((c) => c + 1);
      // If marks were just entered or updated, sync to that recent term
      const updatedLatest = dataService.getMostRecentTerm(student?.id || studentId);
      setSelectedTerm(updatedLatest);
    });
  }, [student?.id, studentId]);

  useEffect(() => {
    const latest = dataService.getMostRecentTerm(student?.id || studentId);
    setSelectedTerm(latest);
  }, [student?.id, studentId]);

  if (!student) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto mt-8">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1557B0] mx-auto flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#082B63]">Welcome to Dadaya High School</h3>
        <p className="text-sm text-slate-500 mt-2">
          The database currently has no students enrolled. Please enroll in Form 1-4 or Lower Six on the student enrollment page.
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Candidate Academic Record
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {student.name} {student.surname} · Candidate ID: <span className="font-mono text-[#1557B0] font-bold">{student.id}</span> · Form: {student.className}
          </p>
        </div>

        {/* Term Dropdown & View Report Card Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value as any)}
            className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden cursor-pointer"
          >
            <option value="Term 1">{mostRecentTerm === 'Term 1' ? 'Term 1 (Recent Marks)' : 'Term 1'}</option>
            <option value="Term 2">{mostRecentTerm === 'Term 2' ? 'Term 2 (Recent Marks)' : 'Term 2'}</option>
            <option value="Term 3">{mostRecentTerm === 'Term 3' ? 'Term 3 (Recent Marks)' : 'Term 3'}</option>
          </select>

          <button
            type="button"
            onClick={() => onOpenReportCard(student.id, selectedTerm)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs min-h-[44px]"
          >
            <Award className="w-4 h-4 text-blue-200 shrink-0" />
            <span>Official Report Card</span>
          </button>
        </div>
      </div>

      {/* Top 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Performance Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#082B63] uppercase tracking-wide">
              Term Standing
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Continuous Assessment</span>
          </div>

          <div className="my-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Circular Gauge / Donut in Royal Blue */}
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
                  className="text-[#1557B0] transition-all duration-700 ease-out"
                  strokeWidth="14"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-[#082B63] font-mono tracking-tight">
                  {average}%
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Average
                </span>
              </div>
            </div>

            {/* Legend / Category breakdown */}
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1557B0]"></span>
                  <span>Excellent</span>
                </div>
                <span className="font-mono font-bold text-[#082B63]">{summary.categories.excellent}</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span>Good</span>
                </div>
                <span className="font-mono font-bold text-[#082B63]">{summary.categories.good}</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Fair</span>
                </div>
                <span className="font-mono font-bold text-[#082B63]">{summary.categories.fair}</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Needs Improvement</span>
                </div>
                <span className="font-mono font-bold text-[#082B63]">
                  {summary.categories.needsImprovement}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluated Subjects: {marks.length}</span>
            <span className="font-semibold text-[#1557B0]">Class: {student.className}</span>
          </div>
        </div>

        {/* Right: Subject Performance Bars */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-[#082B63] uppercase tracking-wide">
              Curriculum Mark Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">{marks.length} Subjects Evaluated</span>
          </div>

          <div className="space-y-3.5">
            {marks.length > 0 ? (
              marks.map((m, idx) => (
                <div key={m.id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                      {m.subjectName}
                    </span>
                    <span className="font-bold font-mono text-[#082B63] tabular-nums">{m.percentage}%</span>
                  </div>
                  {/* Clean hairline bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.percentage >= 80
                          ? 'bg-[#1557B0]'
                          : m.percentage >= 70
                          ? 'bg-blue-500'
                          : m.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, m.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 italic text-xs">
                No marks recorded for {selectedTerm} yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#082B63] uppercase tracking-wide">
            Official Continuous Assessment Summary
          </h3>
          <button
            type="button"
            onClick={() => onOpenReportCard(student.id, selectedTerm)}
            className="flex items-center gap-1 text-xs font-bold text-[#1557B0] hover:underline cursor-pointer"
          >
            <span>Full Printable Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4">Term</th>
                <th className="py-3 px-4">Performance Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marks.slice(0, 6).map((m) => {
                const gradeInfo = dataService.calculateGrade(m.percentage);
                return (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#082B63]">{m.subjectName}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#1557B0] font-mono tabular-nums">
                      {m.percentage}%
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.term}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            gradeInfo.category === 'Excellent'
                              ? 'bg-[#1557B0]'
                              : gradeInfo.category === 'Good'
                              ? 'bg-blue-400'
                              : gradeInfo.category === 'Fair'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-slate-800 font-semibold">{gradeInfo.category}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {marks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                    No assessments recorded for {selectedTerm}.
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

export default StudentDashboard;
