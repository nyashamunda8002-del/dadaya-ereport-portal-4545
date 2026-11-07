import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { Award, Search, FileText, Printer, Download } from 'lucide-react';

interface TeacherReportCardsViewProps {
  onOpenReportCard: (studentId: string) => void;
}

export const TeacherReportCardsView: React.FC<TeacherReportCardsViewProps> = ({
  onOpenReportCard,
}) => {
  const { currentTeacher } = useAuth();
  const classes = dataService.getClasses();
  const settings = dataService.getSettings();

  const assignedClassIds = currentTeacher?.assignedClassIds || [
    'form-1-red',
    'form-2-green',
    'form-3-sciences-1',
    'lower-six-sciences',
  ];
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes.find((c) => assignedClassIds.includes(c.id))?.id || classes[0]?.id || 'lower-six-sciences'
  );
  const [searchTerm, setSearchTerm] = useState('');

  const classStudents = dataService.getStudents({
    classId: selectedClassId,
    search: searchTerm,
    status: 'Active',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Academic Reports & Report Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Generate, review, and print official Dadaya High School student report cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/dadaya_high_school_student_register.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1557B0] border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download School PDF Register</span>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.formLevel})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-72">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Search Student
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Students List for Report Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-sm text-[#082B63]">
            Candidate Performance & Records ({classStudents.length} Students)
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {settings.currentTerm} · {settings.currentAcademicYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4 text-center">Subjects Entered</th>
                <th className="py-3 px-4 text-center">Calculated Average</th>
                <th className="py-3 px-4 text-center">Overall Grade</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((st, index) => {
                const summary = dataService.getStudentPerformanceSummary(
                  st.id,
                  settings.currentTerm,
                  settings.currentAcademicYear
                );
                const grade = dataService.calculateGrade(summary.average);

                return (
                  <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#082B63]">
                      {st.name} {st.surname}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#1557B0]">{st.id}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {summary.subjectCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#082B63]">
                      {summary.subjectCount > 0 ? `${summary.average}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {summary.subjectCount > 0 ? (
                        <span className="font-extrabold text-[#082B63] px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 font-mono">
                          {grade.grade}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenReportCard(st.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-blue-200" />
                        <span>View Report Card</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No active students found in this class stream.
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

export default TeacherReportCardsView;
