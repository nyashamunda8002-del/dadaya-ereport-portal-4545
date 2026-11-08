import React, { useEffect, useState } from 'react';
import { ReportCard } from '../types';
import { DADAYA_REAL_LOGO_URL } from './DadayaLogo';
import { Printer, X, CheckCircle, Award, LogOut, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import dataService from '../services/dataService';
import { downloadReportCardPDF } from '../services/pdfReportService';

interface ReportCardModalProps {
  reportCard: ReportCard | null;
  onClose: () => void;
  isOpen: boolean;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  reportCard,
  onClose,
  isOpen,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !reportCard) return null;

  const settings = dataService.getSettings();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    try {
      downloadReportCardPDF(reportCard);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const passed = reportCard.averagePercentage >= 50;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0"
    >
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none border border-blue-900/20 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Controls Toolbar (Hidden in print) */}
        <div className="no-print bg-[#082B63] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#1557B0]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Award className="w-5 h-5 text-blue-300 shrink-0" />
            <div className="truncate">
              <h3 className="font-bold text-sm sm:text-base text-white truncate">
                Official Report Card — {reportCard.studentName} {reportCard.surname}
              </h3>
              <p className="text-[11px] text-blue-200">
                {reportCard.studentId} • {reportCard.className} • {reportCard.term} ({reportCard.academicYear})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Download official PDF report card"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isDownloading ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1557B0] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Dedicated Exit Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title="Exit Report Card"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 transition-colors cursor-pointer"
              aria-label="Close"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content (A4 structured) */}
        <div className="p-6 sm:p-10 bg-[#ffffff] text-slate-900 print:p-4 relative overflow-hidden font-sans">
          {/* Subtle Background Watermark with Real Dadaya Crest */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
            <img
              src={DADAYA_REAL_LOGO_URL}
              alt=""
              className="w-[28rem] h-[28rem] object-contain mix-blend-multiply filter contrast-125"
            />
          </div>

          {/* Header with Real Crest and School Info */}
          <div className="text-center pb-5 border-b-2 border-[#082B63] relative">
            <div className="flex items-center justify-center gap-4 mb-2.5">
              <span className="h-0.5 w-16 bg-gradient-to-r from-transparent to-[#1557B0]" />
              <div className="w-20 h-24 relative flex items-center justify-center">
                <img
                  src={DADAYA_REAL_LOGO_URL}
                  alt="Dadaya High School Official Crest"
                  className="w-full h-full object-contain filter drop-shadow-xs select-none"
                />
              </div>
              <span className="h-0.5 w-16 bg-gradient-to-l from-transparent to-[#1557B0]" />
            </div>

            <h1 className="font-serif-school text-2xl sm:text-3xl font-black text-[#082B63] tracking-wider uppercase">
              {settings.schoolName || 'DADAYA HIGH SCHOOL'}
            </h1>

            <p className="text-xs sm:text-sm font-bold tracking-[0.18em] text-[#1557B0] uppercase mt-0.5">
              EDUCATION FOR LIFE • IMFUNDO YEMPILO • DZIDZO YOUPENYU
            </p>

            <p className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">
              Church of Christ Mission • P.O. Box 9, Zvishavane, Zimbabwe • Tel: +263 51 2234
            </p>

            <div className="inline-block mt-3 px-6 py-1 bg-[#082B63] text-white font-serif-school text-xs font-bold tracking-widest rounded-xs uppercase shadow-xs">
              OFFICIAL STUDENT ACADEMIC PROGRESS REPORT
            </div>
          </div>

          {/* Student & Term Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 py-4 text-xs border-b border-slate-200 bg-slate-50/60 rounded-xl px-4 my-4 relative">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
              <span className="font-bold text-slate-900 text-sm">{reportCard.studentName} {reportCard.surname}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate ID</span>
              <span className="font-mono font-bold text-[#1557B0] text-sm tracking-wider">{reportCard.studentId}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Stream</span>
              <span className="font-semibold text-slate-900">{reportCard.className}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Term & Year</span>
              <span className="font-semibold text-slate-800">{reportCard.term} • {reportCard.academicYear}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Class Position</span>
              <span className="font-bold text-[#082B63] font-mono text-xs">
                {reportCard.classPosition || '—'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Term Attendance</span>
              <span className="font-semibold text-slate-800 font-mono">
                {reportCard.attendancePresent || 63} / {reportCard.attendanceTotal || 65} Days ({reportCard.attendanceRate || '96.9%'})
              </span>
            </div>
          </div>

          {/* Subjects Table & Remarks Layout */}
          <div className="mt-4 space-y-4 relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#082B63] text-white">
                    <th className="py-2.5 px-3 border border-blue-950 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 border border-blue-950">Curriculum Subject</th>
                    <th className="py-2.5 px-3 border border-blue-950 text-center w-20">Max Mark</th>
                    <th className="py-2.5 px-3 border border-blue-950 text-center w-24">Mark (%)</th>
                    <th className="py-2.5 px-3 border border-blue-950 text-center w-16">Grade</th>
                    <th className="py-2.5 px-3 border border-blue-950">Teacher's Assessment Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {reportCard.subjectRecords.length > 0 ? (
                    reportCard.subjectRecords.map((sub, idx) => (
                      <tr key={sub.subjectId || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-3 border border-slate-300 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                          {sub.subjectName}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center text-slate-500 font-mono">
                          100
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-bold text-[#082B63] font-mono text-sm">
                          {sub.percentage}%
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            sub.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : sub.percentage >= 50
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-slate-700 text-xs">
                          {sub.remark}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No subject marks entered for this term yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-right uppercase text-slate-700">
                      Aggregate Total
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-slate-500">
                      {reportCard.subjectRecords.length * 100}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-[#082B63] font-extrabold text-sm">
                      {reportCard.totalScore}
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-xs text-slate-500 font-normal">
                      Sum of {reportCard.subjectRecords.length} curriculum subjects
                    </td>
                  </tr>
                  <tr className="bg-blue-50/80 font-bold">
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-right uppercase text-[#082B63]">
                      Overall Average
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-slate-500">
                      100%
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-[#1557B0] font-extrabold text-base">
                      {reportCard.averagePercentage}%
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center text-[#082B63] font-black text-sm font-mono">
                      {reportCard.overallGrade}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-xs text-[#082B63] font-bold">
                      <span className={`inline-flex items-center gap-1.5 ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {passed ? 'PASSED TERM STANDARD' : 'REQUIRES REMEDIAL ACADEMIC SUPPORT'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Remarks Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1557B0]" />
                  <span>Class Teacher's Assessment</span>
                </div>
                <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                  "{reportCard.teacherRemarks}"
                </p>
                <div className="text-[10px] text-slate-500 text-right font-medium">
                  {reportCard.classTeacherName || 'Class Teacher'}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#082B63]" />
                  <span>Headmaster's Evaluation</span>
                </div>
                <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                  "{reportCard.headmasterRemarks}"
                </p>
                <div className="text-[10px] text-slate-500 text-right font-medium">
                  {reportCard.headmasterName || 'Dr. C. G. Mugabe, Headmaster'}
                </div>
              </div>
            </div>

            {/* Grading Scale Legend */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-[#082B63] uppercase">Grading System:</span>
              <span><strong>A:</strong> 75-100% (Distinction)</span>
              <span><strong>B:</strong> 65-74% (Merit)</span>
              <span><strong>C:</strong> 50-64% (Credit)</span>
              <span><strong>D:</strong> 40-49% (Pass)</span>
              <span><strong>U:</strong> 0-39% (Ungraded)</span>
            </div>

            {/* Signatures & Footer */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-xs text-slate-700">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-900 truncate">
                  {reportCard.classTeacherName || 'Mr. Moyo / Mrs. Sibanda'}
                </div>
                <div className="font-bold text-slate-600 uppercase text-[10px]">Class Teacher's Signature</div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-900 truncate">
                  {reportCard.headmasterName || 'Dr. C. G. Mugabe'}
                </div>
                <div className="font-bold text-slate-600 uppercase text-[10px]">Headmaster's Official Seal</div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-semibold font-mono text-slate-900">
                  {reportCard.generatedDate}
                </div>
                <div className="font-bold text-slate-600 uppercase text-[10px]">Date of Issue</div>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center text-[9px] text-slate-400 font-medium border-t border-slate-100">
              <span>Dadaya High School E-Report Management System</span>
              <span className="tracking-widest uppercase">DISCIPLINE • EXCELLENCE • FUTURE</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions Bar (Hidden in print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-mono">
            Candidate ID: <span className="font-bold text-[#082B63]">{reportCard.studentId}</span> • Stream: <span className="font-bold text-slate-800">{reportCard.className}</span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#1557B0]" />
              <span>Print Report Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-[#082B63] hover:bg-[#1557B0] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Report Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardModal;
