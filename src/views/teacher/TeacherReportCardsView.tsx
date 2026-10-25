import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { Award, Search, FileText } from 'lucide-react';

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
    'lower-six-sciences',
    'lower-six-commercials',
    'lower-six-arts',
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
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
          Report Cards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Generate and review official Dadaya High School student report cards.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Students List for Report Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
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
                <tr key={st.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">{index + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {st.name} {st.surname}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-emerald-950">{st.id}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {summary.subjectCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-950">
                    {summary.subjectCount > 0 ? `${summary.average}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {summary.subjectCount > 0 ? (
                      <span className="font-extrabold text-emerald-950 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-300">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Generate Report Card</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherReportCardsView;
