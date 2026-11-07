import React, { useState } from 'react';
import dataService from '../../services/dataService';
import {
  BarChart3,
  Download,
  Printer,
} from 'lucide-react';

export const AdminReportsView: React.FC<{ onOpenReportCard: (id: string) => void }> = () => {
  const classes = dataService.getClasses();
  const subjects = dataService.getSubjects();
  const students = dataService.getStudents();
  const marks = dataService.getMarks();

  const [activeReportTab, setActiveReportTab] = useState<'subject' | 'class' | 'roster'>('subject');

  const subjectStats = subjects.map((sub) => {
    const subMarks = marks.filter((m) => m.subjectId === sub.id);
    const count = subMarks.length;
    const avg = count > 0 ? Math.round(subMarks.reduce((a, b) => a + b.percentage, 0) / count) : 0;
    const passed = subMarks.filter((m) => m.percentage >= sub.passMark).length;
    const passRate = count > 0 ? Math.round((passed / count) * 100) : 0;

    return {
      ...sub,
      count,
      average: avg,
      passRate,
    };
  });

  const classStats = classes.map((cls) => {
    const clsStudents = students.filter((s) => s.classId === cls.id && s.status === 'Active');
    const clsMarks = marks.filter((m) => m.classId === cls.id);
    const avg =
      clsMarks.length > 0
        ? Math.round(clsMarks.reduce((a, b) => a + b.percentage, 0) / clsMarks.length)
        : 0;

    return {
      ...cls,
      studentCount: clsStudents.length,
      average: avg,
      marksEntered: clsMarks.length,
    };
  });

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReportTab === 'subject') {
      csvContent += 'Course Code,Subject Name,Department,Pass Mark,Assessed Count,Average Score,Pass Rate\n';
      subjectStats.forEach((s) => {
        csvContent += `"${s.code}","${s.name}","${s.department}",${s.passMark}%,${s.count},${s.average}%,${s.passRate}%\n`;
      });
    } else {
      csvContent += 'Class Name,Form Level,Stream,Enrolled Students,Average Performance,Marks Count\n';
      classStats.forEach((c) => {
        csvContent += `"${c.name}","${c.formLevel}","${c.stream}",${c.studentCount},${c.average}%,${c.marksEntered}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dadaya_academic_report_${activeReportTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Academic Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Statistical performance indicators across subjects, classes, and terms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#082B63] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveReportTab('subject')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeReportTab === 'subject'
              ? 'bg-[#1557B0] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Subject Pass Rates & Averages
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('class')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeReportTab === 'class'
              ? 'bg-[#1557B0] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Class Stream Performance
        </button>
      </div>

      {activeReportTab === 'subject' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Assessed Count</th>
                <th className="py-3 px-4 text-center">Class Average</th>
                <th className="py-3 px-4 text-center">Pass Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectStats.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#082B63]">{s.code}</td>
                  <td className="py-3.5 px-4 text-slate-500">{s.department}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">{s.count}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#082B63]">
                    {s.average}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-mono font-bold ${
                        s.passRate >= 75
                          ? 'text-emerald-700'
                          : s.passRate >= 50
                          ? 'text-blue-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {s.passRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Standard Met
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReportTab === 'class' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold">
                <th className="py-3 px-4">Class Stream</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4 text-center">Enrolled Students</th>
                <th className="py-3 px-4 text-center">Marks Entered</th>
                <th className="py-3 px-4 text-center">Cohort Average</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStats.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.formLevel}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {c.studentCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                    {c.marksEntered}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#082B63]">
                    {c.average > 0 ? `${c.average}%` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Cohort
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReportsView;
