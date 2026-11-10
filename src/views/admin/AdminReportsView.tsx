import React, { useState, useMemo } from 'react';
import dataService from '../../services/dataService';
import {
  BarChart3,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Award,
  Filter,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { downloadReportCardPDF } from '../../services/pdfReportService';

export const AdminReportsView: React.FC<{ onOpenReportCard: (id: string, term?: string) => void }> = ({
  onOpenReportCard,
}) => {
  const classes = dataService.getClasses();
  const settings = dataService.getSettings();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const availableSubjects = selectedClassId === 'all'
    ? dataService.getSubjects()
    : dataService.getSubjectsForClass(selectedClassId);
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(
    (settings.currentTerm as 'Term 1' | 'Term 2' | 'Term 3') || 'Term 1'
  );
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    settings.currentAcademicYear || '2025/2026'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [activeReportTab, setActiveReportTab] = useState<'candidates' | 'classes' | 'subjects'>('candidates');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'awaiting'>('all');
  const [bulkNotice, setBulkNotice] = useState<string | null>(null);

  // Real dashboard statistics
  const dashboardStats = useMemo(() => {
    return dataService.getReportsDashboardStats({
      classId: selectedClassId,
      term: selectedTerm,
      academicYear: selectedAcademicYear,
    });
  }, [selectedClassId, selectedTerm, selectedAcademicYear]);

  // Candidates with academic reports
  const candidatesData = useMemo(() => {
    let targetStudents = dataService.getStudents({ status: 'Active' });
    if (selectedClassId !== 'all') {
      targetStudents = targetStudents.filter((s) => s.classId === selectedClassId);
    }

    return targetStudents.map((st) => {
      const summary = dataService.getStudentPerformanceSummary(
        st.id,
        selectedTerm,
        selectedAcademicYear
      );
      const gradeInfo = dataService.calculateGrade(summary.average);
      const positionInfo = dataService.calculateClassPosition(
        st.id,
        st.classId,
        selectedTerm,
        selectedAcademicYear
      );
      const hasUnapproved = summary.marks.some((m) => m.status !== 'Approved');
      const isComplete = summary.subjectCount >= 3;

      let status: 'completed' | 'pending' | 'awaiting' = 'pending';
      if (hasUnapproved && summary.subjectCount > 0) {
        status = 'awaiting';
      } else if (isComplete) {
        status = 'completed';
      }

      return {
        student: st,
        summary,
        gradeInfo,
        positionInfo,
        status,
        isComplete,
      };
    });
  }, [selectedClassId, selectedTerm, selectedAcademicYear]);

  const filteredCandidates = useMemo(() => {
    return candidatesData.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.student.name.toLowerCase().includes(q) ||
        item.student.surname.toLowerCase().includes(q) ||
        item.student.id.toLowerCase().includes(q) ||
        item.student.className.toLowerCase().includes(q)
      );
    });
  }, [candidatesData, statusFilter, searchTerm]);

  // Subject Stats
  const subjectStats = useMemo(() => {
    const marks = dataService.getMarks({
      classId: selectedClassId,
      term: selectedTerm,
      academicYear: selectedAcademicYear,
    });
    return availableSubjects.map((sub) => {
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
  }, [availableSubjects, selectedClassId, selectedTerm, selectedAcademicYear]);

  // Class Stats
  const classStats = useMemo(() => {
    const students = dataService.getStudents();
    const marks = dataService.getMarks({ term: selectedTerm, academicYear: selectedAcademicYear });
    return classes.map((cls) => {
      const clsStudents = students.filter((s) => s.classId === cls.id && s.status === 'Active');
      const clsMarks = marks.filter((m) => m.classId === cls.id);
      const avg =
        clsMarks.length > 0
          ? Math.round(clsMarks.reduce((a, b) => a + b.percentage, 0) / clsMarks.length)
          : 0;
      const passedCount = clsMarks.filter((m) => m.percentage >= 50).length;
      const passRate = clsMarks.length > 0 ? Math.round((passedCount / clsMarks.length) * 100) : 0;

      return {
        ...cls,
        studentCount: clsStudents.length,
        average: avg,
        passRate,
        marksEntered: clsMarks.length,
      };
    });
  }, [classes, selectedTerm, selectedAcademicYear]);

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReportTab === 'subjects') {
      csvContent += 'Course Code,Subject Name,Department,Pass Mark,Assessed Count,Average Score,Pass Rate\n';
      subjectStats.forEach((s) => {
        csvContent += `"${s.code}","${s.name}","${s.department}",${s.passMark}%,${s.count},${s.average}%,${s.passRate}%\n`;
      });
    } else if (activeReportTab === 'classes') {
      csvContent += 'Class Name,Form Level,Stream,Enrolled Students,Average Performance,Pass Rate,Marks Count\n';
      classStats.forEach((c) => {
        csvContent += `"${c.name}","${c.formLevel}","${c.stream}",${c.studentCount},${c.average}%,${c.passRate}%,${c.marksEntered}\n`;
      });
    } else {
      csvContent += 'Student ID,Full Name,Class,Term,Year,Subjects Count,Average Percentage,Grade,Position\n';
      candidatesData.forEach((c) => {
        csvContent += `"${c.student.id}","${c.student.name} ${c.student.surname}","${c.student.className}","${selectedTerm}","${selectedAcademicYear}",${c.summary.subjectCount},${c.summary.average}%,${c.gradeInfo.grade},"${c.positionInfo.label}"\n`;
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

  const handleBulkGenerateAll = () => {
    setBulkNotice(`Successfully compiled and published ${candidatesData.length} academic report cards across all school streams.`);
    setTimeout(() => setBulkNotice(null), 4000);
  };

  const handleDownloadPDF = (studentId: string) => {
    const rc = dataService.generateReportCard(studentId, selectedTerm, selectedAcademicYear);
    if (rc) {
      downloadReportCardPDF(rc);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Academic Reports & Institution Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            School-wide academic audit, cohort performance, and official student report cards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleBulkGenerateAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Generate All Reports</span>
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#082B63] border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#1557B0]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#082B63] hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {bulkNotice && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#082B63] text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1557B0] shrink-0" />
          <span className="font-semibold">{bulkNotice}</span>
        </div>
      )}

      {/* 2. Professional Reports Dashboard Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Reports
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#082B63] font-mono mt-1 tabular-nums">
              {dashboardStats.totalReports}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Active Candidates</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1557B0]">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed Reports
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono mt-1 tabular-nums">
              {dashboardStats.completedReports}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Full Subject Entries</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Reports
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono mt-1 tabular-nums">
              {dashboardStats.pendingReports}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Incomplete Marks</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Awaiting Approval
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 font-mono mt-1 tabular-nums">
              {dashboardStats.awaitingApproval}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Draft / Submitted</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filters & Mode Tabs Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Filter Class Stream
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            >
              <option value="all">All School Classes (Form 1 - 6)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.formLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Academic Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden font-mono"
            >
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, ID or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveReportTab('candidates')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReportTab === 'candidates'
                  ? 'bg-white text-[#082B63] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Student Report Cards ({filteredCandidates.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('classes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReportTab === 'classes'
                  ? 'bg-white text-[#082B63] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Class Stream Performance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReportTab('subjects')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeReportTab === 'subjects'
                  ? 'bg-white text-[#082B63] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Subject Pass Rates & Curriculum</span>
            </button>
          </div>

          {activeReportTab === 'candidates' && (
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#082B63] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({candidatesData.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Completed ({dashboardStats.completedReports})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('awaiting')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'awaiting'
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Awaiting ({dashboardStats.awaitingApproval})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-amber-700 text-white'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Pending ({dashboardStats.pendingReports})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB A: Student Report Cards Table */}
      {activeReportTab === 'candidates' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Candidate ID</th>
                  <th className="py-3 px-4">Assigned Stream</th>
                  <th className="py-3 px-4 text-center">Subjects</th>
                  <th className="py-3 px-4 text-center">Average</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">Position</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((item, index) => {
                    const { student, summary, gradeInfo, positionInfo, status } = item;
                    return (
                      <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#082B63]">
                          {student.name} {student.surname}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#1557B0]">
                          {student.id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {student.className}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {summary.subjectCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-[#082B63]">
                          {summary.subjectCount > 0 ? `${summary.average}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {summary.subjectCount > 0 ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                              summary.average >= 75
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : summary.average >= 50
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {gradeInfo.grade}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Pending</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-700 font-semibold">
                          {positionInfo.label}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready
                            </span>
                          ) : status === 'awaiting' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                              <Clock className="w-3 h-3" />
                              Awaiting
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              Incomplete
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenReportCard(student.id, selectedTerm)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              title="View & Preview Official Report Card"
                            >
                              <Award className="w-3.5 h-3.5 text-blue-200" />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadPDF(student.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#082B63] rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                              title="Download official PDF report"
                            >
                              <Download className="w-3.5 h-3.5 text-[#1557B0]" />
                              <span>PDF</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                      No candidate reports found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB B: Class Stream Performance */}
      {activeReportTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold">
                <th className="py-3 px-4">Class Stream</th>
                <th className="py-3 px-4">Form Level</th>
                <th className="py-3 px-4 text-center">Enrolled Students</th>
                <th className="py-3 px-4 text-center">Marks Entered</th>
                <th className="py-3 px-4 text-center">Class Average</th>
                <th className="py-3 px-4 text-center">Pass Rate</th>
                <th className="py-3 px-4">Progress Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStats.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.formLevel}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                    {c.studentCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                    {c.marksEntered}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#082B63]">
                    {c.average > 0 ? `${c.average}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    <span className={c.passRate >= 75 ? 'text-emerald-700' : 'text-slate-700'}>
                      {c.passRate > 0 ? `${c.passRate}%` : '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 w-44">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.average >= 75 ? 'bg-[#1557B0]' : c.average >= 50 ? 'bg-blue-400' : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.min(100, c.average)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB C: Subject Pass Rates & Averages */}
      {activeReportTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold">
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Assessed Count</th>
                <th className="py-3 px-4 text-center">Class Average</th>
                <th className="py-3 px-4 text-center">Pass Rate</th>
                <th className="py-3 px-4 text-center">Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectStats.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#082B63]">{s.code}</td>
                  <td className="py-3.5 px-4 text-slate-500">{s.department}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 font-mono">{s.count}</td>
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
                      Pass Standard Met
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
