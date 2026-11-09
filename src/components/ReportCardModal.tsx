import React, { useEffect, useState, useRef } from 'react';
import { ReportCard } from '../types';
import { DADAYA_REAL_LOGO_URL } from './DadayaLogo';
import {
  Printer,
  X,
  CheckCircle,
  Award,
  LogOut,
  Download,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
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
  const [scale, setScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const [docHeight, setDocHeight] = useState(980);

  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  // Calculate the scale needed to fit the entire document on one screen
  const calculateFitScale = () => {
    if (!containerRef.current || !docRef.current) return 1;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const docWidth = 880;
    const currentHeight = docRef.current.scrollHeight || docRef.current.offsetHeight || 980;
    setDocHeight(currentHeight);

    const isMobile = window.innerWidth < 640;
    const paddingX = isMobile ? 12 : 32;
    const paddingY = isMobile ? 12 : 28;

    const availableWidth = Math.max(100, containerWidth - paddingX);
    const availableHeight = Math.max(100, containerHeight - paddingY);

    const scaleX = availableWidth / docWidth;
    const scaleY = availableHeight / currentHeight;

    const calculated = Math.min(scaleX, scaleY);
    return Math.max(0.2, Math.min(calculated, 1.2));
  };

  // Auto-calculate fit scale and initialize
  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const fScale = calculateFitScale();
      setFitScale(fScale);
      if (isAutoFit) {
        setScale(fScale);
      }
    };

    update();

    const resizeObserver = new ResizeObserver(() => {
      update();
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (docRef.current) resizeObserver.observe(docRef.current);

    const handleResize = () => update();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isOpen, isAutoFit, reportCard]);

  // Touch pinch-to-zoom and wheel zoom listeners on the container (fluid 60fps, no re-attachment)
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartDistRef.current = dist;
        pinchStartScaleRef.current = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / pinchStartDistRef.current;
        const newScale = Math.max(0.2, Math.min(2.5, +(pinchStartScaleRef.current * factor).toFixed(2)));
        setIsAutoFit(false);
        setScale(newScale);
      }
    };

    const handleTouchEnd = () => {
      pinchStartDistRef.current = null;
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.cancelable) e.preventDefault();
        setIsAutoFit(false);
        const delta = -e.deltaY * 0.002;
        setScale((prev) => Math.max(0.2, Math.min(2.5, +(prev + delta).toFixed(2))));
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  // Zoom control handlers
  const handleZoomIn = () => {
    setIsAutoFit(false);
    setScale((prev) => Math.min(2.5, +(prev * 1.2).toFixed(2)));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setScale((prev) => Math.max(0.25, +(prev * 0.83).toFixed(2)));
  };

  const handleResetToFit = () => {
    setIsAutoFit(true);
    const fScale = calculateFitScale();
    setFitScale(fScale);
    setScale(fScale);
  };

  const handleZoom100 = () => {
    if (Math.abs(scale - 1) < 0.05) {
      handleResetToFit();
    } else {
      setIsAutoFit(false);
      setScale(1);
    }
  };

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent body background scroll while open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !reportCard) return null;

  const settings = dataService.getSettings();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadReportCardPDF(reportCard);
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
      className="fixed inset-0 z-50 bg-[#061838]/90 backdrop-blur-xs flex flex-col h-screen max-h-screen overflow-hidden select-none print:p-0 print:bg-white print:fixed print:inset-0 print:overflow-visible"
    >
      {/* ========================================================
          1. TOP CONTROLS TOOLBAR (Matching Screenshot Exactly)
         ======================================================== */}
      <div className="no-print bg-[#082B63] text-white px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between border-b border-[#1557B0]/60 shrink-0 z-30 shadow-md">
        {/* Left: Bookmark Ribbon Icon + Student Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 mr-2">
          <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 fill-blue-300/30" />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-base text-white truncate leading-tight">
              Official Report Card — {reportCard.studentName} {reportCard.surname}
            </h3>
            <p className="text-[10px] sm:text-xs text-blue-200/90 font-medium truncate mt-0.5">
              {reportCard.studentId} • {reportCard.className} • {reportCard.term} ({reportCard.academicYear})
            </p>
          </div>
        </div>

        {/* Right Action Buttons matching screenshot + Zoom Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom controls cluster in top toolbar */}
          <div className="hidden sm:flex items-center bg-blue-950/60 rounded-xl p-0.5 border border-blue-400/30">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-blue-800 text-blue-200 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom Out (-)"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleZoom100}
              className="px-2 py-1 text-[11px] font-mono font-bold text-white hover:text-blue-200 transition-colors cursor-pointer"
              title="Click to toggle 100% / Auto-Fit"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-blue-800 text-blue-200 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom In (+)"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetToFit}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isAutoFit
                  ? 'bg-[#1557B0] text-white shadow-xs'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
              title="Auto-Fit to Screen"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Fit</span>
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#1A73E8] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Download official PDF report card"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">{isDownloading ? 'Exporting...' : 'Download PDF'}</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#0E3D7D] hover:bg-blue-800 text-white border border-blue-400/40 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Print report card"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Red Exit Button matching screenshot */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#E11D48] hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            title="Exit Report Card"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Exit</span>
          </button>

          {/* Close 'X' Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 transition-colors cursor-pointer ml-1"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. VIEWPORT CONTAINER (Zoomable, Pannable, and Fits on Screen)
         ======================================================== */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-auto p-2 sm:p-4 print:p-0 print:h-auto print:block relative"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y',
        }}
      >
        <div className="min-w-full min-h-full flex items-center justify-center p-1 sm:p-2">
          {/* Scaled Wrapper: Sized to scaled dimensions so parent scrolls properly */}
          <div
            style={{
              width: `${880 * scale}px`,
              height: `${docHeight * scale}px`,
              position: 'relative',
              flexShrink: 0,
              transition: isAutoFit ? 'all 0.15s ease-out' : 'none',
            }}
            className="print:w-full print:h-auto"
          >
            {/* ========================================================
                3. OFFICIAL REPORT CARD DOCUMENT (Pixel-Perfect from Screenshot)
               ======================================================== */}
            <div
              ref={docRef}
              style={{
                width: '880px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                transition: isAutoFit ? 'transform 0.15s ease-out' : 'none',
              }}
              className="relative bg-white rounded-2xl shadow-2xl p-7 border border-slate-200/90 text-slate-900 font-sans print:p-0 print:shadow-none print:border-none print:w-full print:transform-none overflow-hidden"
            >
            {/* Elegant Background Crest Watermark matching official stationery */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none z-0">
              <img
                src={DADAYA_REAL_LOGO_URL}
                alt=""
                className="w-96 h-96 object-contain"
              />
            </div>

            <div className="relative z-10">
              {/* Header: Crest flanked by thin blue lines */}
              <div className="text-center relative">
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="h-[1.5px] w-20 bg-[#1557B0]" />
                <div className="w-16 h-20 relative flex items-center justify-center">
                  <img
                    src={DADAYA_REAL_LOGO_URL}
                    alt="Dadaya High School Official Crest"
                    className="w-full h-full object-contain filter drop-shadow-2xs select-none"
                  />
                </div>
                <span className="h-[1.5px] w-20 bg-[#1557B0]" />
              </div>

              {/* DADAYA HIGH SCHOOL Title */}
              <h1 className="font-serif-school text-3xl font-black text-[#082B63] tracking-wider uppercase leading-tight">
                {settings.schoolName || 'DADAYA HIGH SCHOOL'}
              </h1>

              {/* Motto */}
              <p className="text-xs font-black tracking-[0.18em] text-[#1557B0] uppercase mt-1 leading-snug">
                EDUCATION FOR LIFE • IMFUNDO YEMPILO • DZIDZO YOUPENYU
              </p>

              {/* Address */}
              <p className="text-[10.5px] font-bold text-slate-500 uppercase mt-0.5 tracking-wide">
                CHURCH OF CHRIST MISSION • P.O. BOX 9, ZVISHAVANE, ZIMBABWE • TEL: +263 51 2234
              </p>

              {/* Solid Navy Progress Report Pill */}
              <div className="inline-block mt-3 px-8 py-1.5 bg-[#082B63] text-white font-serif-school text-xs font-bold tracking-widest rounded-xs uppercase shadow-xs">
                OFFICIAL STUDENT ACADEMIC PROGRESS REPORT
              </div>

              {/* Separator Line */}
              <div className="border-b-2 border-[#082B63] mt-3.5 mb-3" />
            </div>

            {/* Candidate Details Card (Light Blue Container with 3 Columns) */}
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 mb-3.5">
              <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-xs">
                {/* Row 1 */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CANDIDATE NAME
                  </span>
                  <span className="font-extrabold text-[#101D3A] text-sm block truncate mt-0.5">
                    {reportCard.studentName} {reportCard.surname}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CANDIDATE ID
                  </span>
                  <span className="font-mono font-black text-[#1557B0] text-sm block mt-0.5">
                    {reportCard.studentId}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CLASS STREAM
                  </span>
                  <span className="font-bold text-slate-800 text-sm block truncate mt-0.5">
                    {reportCard.className}
                  </span>
                </div>

                {/* Row 2 */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    ACADEMIC TERM
                  </span>
                  <span className="font-semibold text-slate-700 text-xs block mt-0.5">
                    {reportCard.term}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    ACADEMIC YEAR
                  </span>
                  <span className="font-semibold text-slate-700 text-xs block mt-0.5">
                    {reportCard.academicYear}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    CLASS POSITION
                  </span>
                  <span className="font-bold text-slate-800 text-xs block mt-0.5">
                    {reportCard.classPosition || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Curriculum Subjects Table matching screenshot */}
            <div className="overflow-hidden rounded-xl border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#082B63] text-white">
                    <th className="py-2.5 px-3 w-10 text-center font-bold">#</th>
                    <th className="py-2.5 px-3 font-bold">Curriculum Subject</th>
                    <th className="py-2.5 px-3 text-center w-20 font-bold leading-tight">
                      <div>Max</div>
                      <div>Mark</div>
                    </th>
                    <th className="py-2.5 px-3 text-center w-24 font-bold">Mark (%)</th>
                    <th className="py-2.5 px-3 text-center w-16 font-bold">Grade</th>
                    <th className="py-2.5 px-3 font-bold">Teacher's Assessment Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {reportCard.subjectRecords.length > 0 ? (
                    reportCard.subjectRecords.map((sub, idx) => (
                      <tr key={sub.subjectId || idx} className="hover:bg-blue-50/40">
                        <td className="py-2 px-3 text-center text-slate-500 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-bold text-[#101D3A] text-xs">
                          {sub.subjectName}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 font-mono text-xs">
                          100
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-[#082B63] font-mono text-xs">
                          {sub.percentage}%
                        </td>
                        <td className="py-2 px-3 text-center font-black">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              sub.percentage >= 75
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : sub.percentage >= 50
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {sub.grade}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700 text-xs italic">
                          {sub.remark || 'Satisfactory academic participation and progress.'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 italic text-xs font-serif">
                        No subject marks entered for this term yet.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t border-slate-300">
                    <td colSpan={2} className="py-2 px-3 text-right uppercase text-slate-700 text-xs">
                      Aggregate Total
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-500 text-xs">
                      {Math.max(1, reportCard.subjectRecords.length) * 100}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-[#082B63] font-black text-xs">
                      {reportCard.totalScore}
                    </td>
                    <td colSpan={2} className="py-2 px-3 text-xs text-slate-500 font-normal">
                      Sum of {reportCard.subjectRecords.length} curriculum subjects
                    </td>
                  </tr>
                  <tr className="bg-blue-50/80 font-bold border-t border-slate-200">
                    <td colSpan={2} className="py-2 px-3 text-right uppercase text-[#082B63] text-xs">
                      Overall Average
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-500 text-xs">
                      100%
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-[#1557B0] font-black text-sm">
                      {reportCard.averagePercentage}%
                    </td>
                    <td className="py-2 px-3 text-center text-[#082B63] font-black text-xs font-mono">
                      {reportCard.overallGrade}
                    </td>
                    <td className="py-2 px-3 text-xs text-[#082B63] font-bold">
                      <span className={`inline-flex items-center gap-1 ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {passed ? 'PASSED TERM STANDARD' : 'REQUIRES REMEDIAL ACADEMIC SUPPORT'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Assessment Remarks (Class Teacher & Headmaster) */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3 h-3 text-[#1557B0]" />
                  <span>Class Teacher's Assessment</span>
                </div>
                <p className="text-[11px] text-slate-800 italic bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed">
                  "{reportCard.teacherRemarks || 'Satisfactory academic performance and steady progress throughout the term.'}"
                </p>
                <div className="text-[10px] text-slate-500 text-right font-medium mt-1">
                  {reportCard.classTeacherName || 'Mr. Moyo / Mrs. Sibanda'}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/60">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Award className="w-3 h-3 text-[#082B63]" />
                  <span>Headmaster's Evaluation</span>
                </div>
                <p className="text-[11px] text-slate-800 italic bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed">
                  "{reportCard.headmasterRemarks || 'A commendable term. Continue demonstrating academic discipline and commitment.'}"
                </p>
                <div className="text-[10px] text-slate-500 text-right font-medium mt-1">
                  {reportCard.headmasterName || 'Dr. C. G. Mugabe, Headmaster'}
                </div>
              </div>
            </div>

            {/* Grading Scale */}
            <div className="mt-2.5 bg-slate-50 rounded-xl p-2 border border-slate-200 text-[9.5px] text-slate-600 flex items-center justify-between">
              <span className="font-bold text-[#082B63] uppercase">Grading Scale:</span>
              <span><strong>A:</strong> 75-100% (Distinction)</span>
              <span><strong>B:</strong> 65-74% (Merit)</span>
              <span><strong>C:</strong> 50-64% (Credit)</span>
              <span><strong>D:</strong> 40-49% (Pass)</span>
              <span><strong>U:</strong> 0-39% (Ungraded)</span>
            </div>

            {/* Official Signatures & Seal */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-300 grid grid-cols-3 gap-4 text-xs text-slate-700">
              <div>
                <div className="border-b border-slate-400 pb-0.5 mb-0.5 font-semibold text-slate-900 truncate text-[11px]">
                  {reportCard.classTeacherName || 'Mr. Moyo / Mrs. Sibanda'}
                </div>
                <div className="font-bold text-slate-500 uppercase text-[9.5px]">
                  Class Teacher's Signature
                </div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-0.5 mb-0.5 font-semibold text-slate-900 truncate text-[11px]">
                  {reportCard.headmasterName || 'Dr. C. G. Mugabe'}
                </div>
                <div className="font-bold text-slate-500 uppercase text-[9.5px]">
                  Headmaster's Official Seal
                </div>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-0.5 mb-0.5 font-semibold font-mono text-slate-900 text-[11px]">
                  {reportCard.generatedDate}
                </div>
                <div className="font-bold text-slate-500 uppercase text-[9.5px]">
                  Date of Issue
                </div>
              </div>
            </div>

            {/* Micro Footer Motto */}
            <div className="mt-2 pt-1.5 flex justify-between items-center text-[8.5px] text-slate-400 font-medium border-t border-slate-100">
              <span>Dadaya High School E-Report Management System</span>
              <span className="tracking-widest uppercase">DISCIPLINE • EXCELLENCE • FUTURE</span>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Floating Zoom Controller Dock (Instant access on mobile & desktop) */}
      <div className="no-print fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-[#082B63]/90 hover:bg-[#082B63] text-white rounded-full shadow-2xl border border-blue-400/40 backdrop-blur-md transition-all select-none">
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 rounded-full hover:bg-blue-800 text-blue-200 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out (-)"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoom100}
          className="px-2.5 py-1 text-xs font-mono font-bold text-white hover:text-blue-200 transition-colors cursor-pointer"
          title="Click to toggle 100% / Auto-Fit"
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 rounded-full hover:bg-blue-800 text-blue-200 hover:text-white transition-colors cursor-pointer"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-blue-400/30 mx-0.5" />

        <button
          type="button"
          onClick={handleResetToFit}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isAutoFit
              ? 'bg-[#1557B0] text-white shadow-xs'
              : 'text-blue-200 hover:bg-blue-800 hover:text-white'
          }`}
          title="Reset to Fit Screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fit Screen</span>
        </button>
      </div>
    </div>
  );
};

export default ReportCardModal;
