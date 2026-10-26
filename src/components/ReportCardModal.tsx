import React from 'react';
import { ReportCard } from '../types';
import { DADAYA_REAL_LOGO_URL } from './DadayaLogo';
import { Printer, X, CheckCircle, Award } from 'lucide-react';
import dataService from '../services/dataService';

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
  if (!isOpen || !reportCard) return null;

  const settings = dataService.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none border border-emerald-900/20">
        {/* Modal Controls Toolbar (Hidden in print) */}
        <div className="no-print bg-[#064e3b] text-white px-6 py-3.5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base sm:text-lg">
              Official Student Report Card — {reportCard.studentName} {reportCard.surname}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content */}
        <div className="p-6 sm:p-10 bg-[#fdfdfd] text-slate-900 print:p-6 relative overflow-hidden">
          {/* Subtle Background Watermark with Real Dadaya Crest - seamlessly merged */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.045] select-none">
            <img
              src={DADAYA_REAL_LOGO_URL}
              alt=""
              className="w-[28rem] h-[28rem] object-contain mix-blend-multiply filter contrast-125"
            />
          </div>

          {/* Header with Real Crest and School Info */}
          <div className="text-center pb-6 border-b-2 border-[#064e3b] relative">
            {/* Top decorative rule */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-0.5 w-16 bg-gradient-to-r from-transparent to-[#064e3b]" />
              <div className="w-24 h-28 sm:w-28 sm:h-32 relative flex items-center justify-center">
                <img
                  src={DADAYA_REAL_LOGO_URL}
                  alt="Dadaya High School Official Crest"
                  className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-xs select-none"
                />
              </div>
              <span className="h-0.5 w-16 bg-gradient-to-l from-transparent to-[#064e3b]" />
            </div>

            <h1 className="font-serif-school text-2xl sm:text-3xl font-black text-[#064e3b] tracking-wider uppercase">
              {settings.schoolName || 'DADAYA HIGH SCHOOL'}
            </h1>

            <p className="text-xs sm:text-sm font-bold tracking-[0.20em] text-emerald-800 uppercase mt-0.5">
              EDUCATION FOR LIFE • IMFUNDO YEMPILO • DZIDZO YOUPENYU
            </p>

            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
              DISCIPLINE • EXCELLENCE • FUTURE
            </p>

            <div className="inline-block mt-3 px-6 py-1 bg-[#064e3b] text-white font-serif-school text-xs sm:text-sm font-bold tracking-widest rounded-xs uppercase shadow-sm">
              OFFICIAL STUDENT REPORT CARD
            </div>
          </div>

          {/* Student & Term Info Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs sm:text-sm border-b border-emerald-900/20 relative">
            <div className="space-y-1.5">
              <div className="flex items-baseline">
                <span className="w-28 font-bold text-slate-700">Name:</span>
                <span className="font-semibold text-slate-900">{reportCard.studentName}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-28 font-bold text-slate-700">Surname:</span>
                <span className="font-semibold text-slate-900">{reportCard.surname}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-28 font-bold text-slate-700">Candidate ID:</span>
                <span className="font-mono font-bold text-emerald-950 tracking-wider">
                  {reportCard.studentId}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline">
                <span className="w-32 font-bold text-slate-700">Class:</span>
                <span className="font-semibold text-slate-900">{reportCard.className}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-32 font-bold text-slate-700">Term:</span>
                <span className="font-semibold text-slate-900">{reportCard.term}</span>
              </div>
              <div className="flex items-baseline">
                <span className="w-32 font-bold text-slate-700">Academic Year:</span>
                <span className="font-semibold text-slate-900">{reportCard.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Subjects Table & Remarks Layout */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Subjects Table */}
            <div className="md:col-span-2 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#064e3b] text-white">
                    <th className="py-2.5 px-3 border border-emerald-900 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 border border-emerald-900">Subject</th>
                    <th className="py-2.5 px-3 border border-emerald-900 text-center w-24">Percentage</th>
                    <th className="py-2.5 px-3 border border-emerald-900 text-center w-16">Grade</th>
                    <th className="py-2.5 px-3 border border-emerald-900">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white/80">
                  {reportCard.subjectRecords.length > 0 ? (
                    reportCard.subjectRecords.map((sub, idx) => (
                      <tr key={sub.subjectId || idx} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="py-2 px-3 border border-slate-300 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 font-medium text-slate-800">
                          {sub.subjectName}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-bold text-emerald-950 font-mono">
                          {sub.percentage}%
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-900">
                          {sub.grade}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-slate-600 text-xs">
                          {sub.remark}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                        No subject marks entered for this term yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-right uppercase">
                      Total
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-emerald-900 font-extrabold">
                      {reportCard.totalScore}%
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-xs text-slate-500">
                      Sum of {reportCard.subjectRecords.length} subjects
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/80 font-bold">
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-300 text-right uppercase text-emerald-950">
                      Average
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-emerald-900 font-extrabold text-base">
                      {reportCard.averagePercentage}%
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center text-emerald-800 font-black">
                      {reportCard.overallGrade}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-xs text-emerald-800 font-semibold">
                      {reportCard.averagePercentage >= 50 ? 'Passed Term Standard' : 'Requires Improvement'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Remarks Box */}
            <div className="flex flex-col">
              <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-2xs h-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                    Teacher's Remarks
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                    "{reportCard.teacherRemarks}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 uppercase mb-1">Headmaster's Assessment:</div>
                  <p className="text-xs text-slate-700 italic bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                    "{reportCard.headmasterRemarks}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-700 relative">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-medium text-slate-900">
                Mr. Moyo / Class Teacher
              </div>
              <div className="font-bold text-slate-800 uppercase text-[11px]">Teacher's Signature</div>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-medium text-slate-900">
                {settings.headmasterName || 'Dr. C. G. Mugabe'}
              </div>
              <div className="font-bold text-slate-800 uppercase text-[11px]">Headmaster / Administrator</div>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-medium font-mono text-slate-900">
                {reportCard.generatedDate}
              </div>
              <div className="font-bold text-slate-800 uppercase text-[11px]">Date Issued</div>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center text-[10px] text-slate-400 font-medium">
            <span>Dadaya High School E-Report Management System</span>
            <span className="tracking-widest uppercase">DISCIPLINE • EXCELLENCE • FUTURE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardModal;
