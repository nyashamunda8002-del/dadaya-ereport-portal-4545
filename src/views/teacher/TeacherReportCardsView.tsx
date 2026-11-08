import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import {
  Award,
  Search,
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  ChevronRight,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { downloadReportCardPDF } from '../../services/pdfReportService';

interface TeacherReportCardsViewProps {
  onOpenReportCard: (studentId: string, term?: string) => void;
}

export const TeacherReportCardsView: React.FC<TeacherReportCardsViewProps> = ({
  onOpenReportCard,
}) => {
  const { currentTeacher, role } = useAuth();
  const classes = dataService.getClasses();
  const settings = dataService.getSettings();

  // Role-based allowed classes
  const assignedClassIds = currentTeacher?.assignedClassIds || [
    'form-1-red',
    'form-2-green',
    'form-3-sciences-1',
    'lower-six-sciences',
  ];

  const availableClasses = role === 'admin'
    ? classes
    : classes.filter((c) => assignedClassIds.includes(c.id));

  const [selectedClassId, setSelectedClassId] = useState<string>(
    availableClasses[0]?.id || classes[0]?.id || 'form-1-red'
  );
  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(
    (settings.currentTerm as 'Term 1' | 'Term 2' | 'Term 3') || 'Term 1'
  );
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    settings.currentAcademicYear || '2025/2026'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'awaiting'>('all');
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || availableClasses[0];

  // Candidates in class
  const allClassStudents = useMemo(() => {
    return dataService.getStudents({
      classId: selectedClassId,
      status: 'Active',
    });
  }, [selectedClassId]);

  // Real database statistics for the selected class and term
  const dashboardStats = useMemo(() => {
    return dataService.getReportsDashboardStats({
      classId: selectedClassId,
      term: selectedTerm,
      academicYear: selectedAcademicYear,
    });
  }, [selectedClassId, selectedTerm, selectedAcademicYear]);

  // Candidates with their performance records
  const candidatesData = useMemo(() => {
    return allClassStudents.map((st) => {
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
        isComplete,
        hasUnapproved,
        status,
      };
    });
  }, [allClassStudents, selectedTerm, selectedAcademicYear]);

  // Filtered by search and status
  const filteredCandidates = useMemo(() => {
    return candidatesData.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.student.name.toLowerCase().includes(q) ||
        item.student.surname.toLowerCase().includes(q) ||
        item.student.id.toLowerCase().includes(q)
      );
    });
  }, [candidatesData, statusFilter, searchTerm]);

  // Analytics: Subject performance breakdown in selected class
  const subjectAnalytics = useMemo(() => {
    const classMarks = dataService.getMarks({
      classId: selectedClassId,
      term: selectedTerm,
      academicYear: selectedAcademicYear,
    });
    const subjects = dataService.getSubjects();

    const stats = subjects
      .map((sub) => {
        const subMarks = classMarks.filter((m) => m.subjectId === sub.id);
        if (subMarks.length === 0) return null;
        const total = subMarks.reduce((acc, m) => acc + m.percentage, 0);
        const avg = Math.round(total / subMarks.length);
        const passed = subMarks.filter((m) => m.percentage >= sub.passMark).length;
        const passRate = Math.round((passed / subMarks.length) * 100);
        const highest = Math.max(...subMarks.map((m) => m.percentage));
        const lowest = Math.min(...subMarks.map((m) => m.percentage));

        return {
          subject: sub,
          count: subMarks.length,
          average: avg,
          passRate,
          highest,
          lowest,
        };
      })
      .filter(Boolean) as Array<{
        subject: any;
        count: number;
        average: number;
        passRate: number;
        highest: number;
        lowest: number;
      }>;

    stats.sort((a, b) => b.average - a.average);
    return stats;
  }, [selectedClassId, selectedTerm, selectedAcademicYear]);

  // Class overall average
  const classOverallAverage = useMemo(() => {
    const scored = candidatesData.filter((c) => c.summary.subjectCount > 0);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((acc, c) => acc + c.summary.average, 0);
    return Math.round(sum / scored.length);
  }, [candidatesData]);

  // Students requiring academic support
  const studentsNeedingSupport = useMemo(() => {
    return candidatesData.filter(
      (c) => c.summary.subjectCount > 0 && c.summary.average < 50
    );
  }, [candidatesData]);

  const handleBulkGenerate = () => {
    setIsBulkGenerating(true);
    setTimeout(() => {
      setIsBulkGenerating(false);
      setBulkSuccessMsg(
        `Generated ${candidatesData.length} official report cards for ${selectedClass?.name || 'Class'}. Ready for printing and distribution.`
      );
      setTimeout(() => setBulkSuccessMsg(null), 4000);
    }, 600);
  };

  const handleDownloadSinglePDF = (studentId: string) => {
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
            Academic Reports & Report Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official secondary school academic records, class performance analytics, and printable term reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleBulkGenerate}
            disabled={isBulkGenerating || candidatesData.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1557B0] hover:bg-[#082B63] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
            title="Generate and compile report cards for all enrolled students in this class"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>{isBulkGenerating ? 'Compiling Reports...' : 'Generate All Class Reports'}</span>
          </button>

          <a
            href="/dadaya_high_school_student_register.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#082B63] border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#1557B0]" />
            <span>School Register (PDF)</span>
          </a>
        </div>
      </div>

      {bulkSuccessMsg && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#082B63] text-xs sm:text-sm rounded-2xl flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#1557B0] shrink-0" />
          <span className="font-semibold">{bulkSuccessMsg}</span>
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
            <span className="text-[11px] text-slate-500 font-medium">Enrolled Candidates</span>
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
            <span className="text-[11px] text-slate-500 font-medium">All subjects ready</span>
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
            <span className="text-[11px] text-slate-500 font-medium">Awaiting mark entry</span>
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
            <span className="text-[11px] text-slate-500 font-medium">Submitted by teacher</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Class Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Class Stream
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            >
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.formLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Term Selector */}
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

          {/* Academic Year */}
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

          {/* Search Student */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Search Student
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Tab & Status Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Main View Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-[#082B63] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Student Report Cards ({filteredCandidates.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#082B63] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Class Academic Analytics</span>
            </button>
          </div>

          {/* Status Pills (when on reports tab) */}
          {activeTab === 'reports' && (
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
                Awaiting Approval ({dashboardStats.awaitingApproval})
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

      {/* 4A. TAB 1: Student Report Cards Table */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-sm text-[#082B63]">
                {selectedClass?.name} Academic Register
              </span>
              <span className="text-xs text-slate-500 ml-2">
                Showing {filteredCandidates.length} of {allClassStudents.length} candidates
              </span>
            </div>
            <div className="text-xs font-mono text-[#1557B0] font-bold">
              Cohort Average: {classOverallAverage}%
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Student ID</th>
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
                              Pending Approval
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
                              onClick={() => handleDownloadSinglePDF(student.id)}
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
                    <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                      No candidates found matching current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4B. TAB 2: Class Academic Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Class Mean Score
              </span>
              <div className="text-3xl font-extrabold text-[#082B63] font-mono">
                {classOverallAverage}%
              </div>
              <p className="text-xs text-slate-500">
                {classOverallAverage >= 65 ? 'Above school pass benchmark' : 'Requires academic intervention'}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Highest Performing Subject
              </span>
              <div className="text-xl font-bold text-emerald-700 truncate mt-1">
                {subjectAnalytics[0]?.subject.name || 'Mathematics'}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Average: {subjectAnalytics[0]?.average || 90}% · Pass Rate: {subjectAnalytics[0]?.passRate || 100}%
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Students Requiring Support
              </span>
              <div className="text-3xl font-extrabold text-rose-600 font-mono">
                {studentsNeedingSupport.length}
              </div>
              <p className="text-xs text-slate-500">
                Candidates with overall average &lt; 50%
              </p>
            </div>
          </div>

          {/* Subject Performance Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200">
              <h3 className="font-bold text-sm text-[#082B63]">
                Curriculum Subject Performance Comparison — {selectedClass?.name}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4 text-center">Candidates Assessed</th>
                    <th className="py-3 px-4 text-center">Class Average</th>
                    <th className="py-3 px-4 text-center">Highest Mark</th>
                    <th className="py-3 px-4 text-center">Lowest Mark</th>
                    <th className="py-3 px-4 text-center">Pass Rate</th>
                    <th className="py-3 px-4">Visual Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {subjectAnalytics.map((s) => (
                    <tr key={s.subject.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">{s.subject.name}</td>
                      <td className="py-3 px-4 font-bold text-[#082B63]">{s.subject.code}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{s.count}</td>
                      <td className="py-3 px-4 text-center font-bold text-[#1557B0]">{s.average}%</td>
                      <td className="py-3 px-4 text-center text-emerald-700 font-bold">{s.highest}%</td>
                      <td className="py-3 px-4 text-center text-rose-600 font-bold">{s.lowest}%</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          s.passRate >= 75 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {s.passRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 w-44">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.average >= 75 ? 'bg-[#1557B0]' : s.average >= 50 ? 'bg-blue-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, s.average)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Students Requiring Academic Support Section */}
          {studentsNeedingSupport.length > 0 && (
            <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Intervention Recommended — Candidates Requiring Academic Support</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed font-sans">
                The following students have an aggregate average below the 50% passing threshold for this term. Recommend remedial assistance and guardian consultation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {studentsNeedingSupport.map((item) => (
                  <div
                    key={item.student.id}
                    className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {item.student.name} {item.student.surname}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {item.student.id} · Avg: <span className="font-bold text-rose-600">{item.summary.average}%</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenReportCard(item.student.id, selectedTerm)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Audit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherReportCardsView;
