import { jsPDF } from 'jspdf';
import { ReportCard } from '../types';

/**
 * PDF Report Card & Class Academic Documents Generator for Dadaya High School
 */
export const generateReportCardPDF = (reportCard: ReportCard): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Outer border & frame
  doc.setDrawColor(8, 43, 99); // #082B63
  doc.setLineWidth(0.8);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, pageHeight - (margin - 4) * 2);

  doc.setDrawColor(21, 87, 176); // #1557B0
  doc.setLineWidth(0.3);
  doc.rect(margin - 2.5, margin - 2.5, contentWidth + 5, pageHeight - (margin - 2.5) * 2);

  let y = margin + 4;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(8, 43, 99);
  doc.text('DADAYA HIGH SCHOOL', pageWidth / 2, y, { align: 'center' });

  y += 5.5;
  doc.setFontSize(8);
  doc.setTextColor(21, 87, 176);
  doc.setFont('helvetica', 'bold');
  doc.text('EDUCATION FOR LIFE • IMFUNDO YEMPILO • DZIDZO YOUPENYU', pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Church of Christ Mission • P.O. Box 9, Zvishavane, Zimbabwe • Tel: +263 51 2234', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFillColor(8, 43, 99);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL STUDENT ACADEMIC PROGRESS REPORT', pageWidth / 2, y + 4.5, { align: 'center' });

  y += 10;

  // Student Information Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 23, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 2;

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Name:', col1, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${reportCard.studentName} ${reportCard.surname}`, col1 + 28, y + 5);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate ID:', col1, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 87, 176);
  doc.text(`${reportCard.studentId}`, col1 + 28, y + 11);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Stream:', col1, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${reportCard.className}`, col1 + 28, y + 17);

  // Right column
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Academic Year:', col2, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${reportCard.academicYear}`, col2 + 26, y + 5);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Academic Term:', col2, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${reportCard.term}`, col2 + 26, y + 11);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Position:', col2, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 43, 99);
  doc.text(`${reportCard.classPosition || '—'}`, col2 + 26, y + 17);

  y += 27;

  // Subjects Results Table Header
  doc.setFillColor(8, 43, 99);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  const cNr = margin + 3;
  const cSubject = margin + 12;
  const cMax = margin + 78;
  const cScore = margin + 98;
  const cGrade = margin + 116;
  const cRemarks = margin + 130;

  doc.text('#', cNr, y + 4.8);
  doc.text('Curriculum Subject', cSubject, y + 4.8);
  doc.text('Max Mark', cMax, y + 4.8);
  doc.text('Mark (%)', cScore, y + 4.8);
  doc.text('Grade', cGrade, y + 4.8);
  doc.text('Teacher Assessment Comment', cRemarks, y + 4.8);

  y += 7;

  // Table Rows
  doc.setFontSize(8);
  const rowHeight = 7;
  const records = reportCard.subjectRecords || [];

  if (records.length === 0) {
    doc.setTextColor(148, 163, 184);
    doc.text('No subject marks entered for this candidate yet.', margin + 4, y + 5);
    y += rowHeight;
  } else {
    records.forEach((rec, idx) => {
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), cNr, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(rec.subjectName, cSubject, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('100', cMax, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(8, 43, 99);
      doc.text(`${rec.percentage}%`, cScore, y + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(rec.percentage >= 50 ? 21 : 225, rec.percentage >= 50 ? 87 : 29, rec.percentage >= 50 ? 176 : 72);
      doc.text(rec.grade, cGrade + 2, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const truncatedRemark = doc.splitTextToSize(rec.remark || 'Satisfactory standard.', contentWidth - (cRemarks - margin) - 2);
      doc.text(truncatedRemark[0] || '', cRemarks, y + 4.8);

      y += rowHeight;
    });
  }

  // Summary Totals & Averages Box
  y += 1.5;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 12, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(8, 43, 99);

  doc.text('Aggregate Score:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${reportCard.totalScore} / ${records.length * 100}`, margin + 35, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Overall Average:', margin + 70, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 87, 176);
  doc.text(`${reportCard.averagePercentage}%`, margin + 100, y + 5);

  doc.setTextColor(8, 43, 99);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Grade:', margin + 120, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${reportCard.overallGrade}`, margin + 145, y + 5);

  // Row 2: Attendance & Result
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Term Attendance:', margin + 4, y + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${reportCard.attendancePresent || 63} / ${reportCard.attendanceTotal || 65} Days (${reportCard.attendanceRate || '96.9%'})`, margin + 35, y + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Term Status:', margin + 70, y + 9.5);
  doc.setFont('helvetica', 'bold');
  const passed = reportCard.averagePercentage >= 50;
  doc.setTextColor(passed ? 16 : 225, passed ? 120 : 29, passed ? 60 : 72);
  doc.text(passed ? 'PASSED TERM STANDARD' : 'REQUIRES ACADEMIC SUPPORT', margin + 100, y + 9.5);

  y += 16;

  // Remarks Section
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 32, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(8, 43, 99);
  doc.text("CLASS TEACHER'S ASSESSMENT & REMARKS:", margin + 3, y + 4.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  const teacherText = doc.splitTextToSize(`"${reportCard.teacherRemarks || 'Good performance. Keep up the disciplined work.'}"`, contentWidth - 6);
  doc.text(teacherText, margin + 3, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 43, 99);
  doc.text("HEADMASTER'S GENERAL EVALUATION:", margin + 3, y + 19);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(51, 65, 85);
  const headText = doc.splitTextToSize(`"${reportCard.headmasterRemarks || 'A commendable term result reflecting Dadaya High School ideals of discipline and excellence.'}"`, contentWidth - 6);
  doc.text(headText, margin + 3, y + 23.5);

  y += 36;

  // Institutional Grading Scale Legend
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 10, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(8, 43, 99);
  doc.text('GRADING SYSTEM:', margin + 3, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('A: 75-100% (Distinction)   |   B: 65-74% (Merit)   |   C: 50-64% (Credit)   |   D: 40-49% (Pass)   |   U: 0-39% (Ungraded / Remedial)', margin + 3, y + 7.5);

  y += 15;

  // Signatures Section
  const sigColWidth = contentWidth / 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  // Col 1: Class Teacher
  doc.line(margin + 2, y + 7, margin + sigColWidth - 6, y + 7);
  doc.text(reportCard.classTeacherName || 'Mr. Ahmed / Mr. Moyo', margin + 2, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Class Teacher's Signature", margin + 2, y + 14.5);

  // Col 2: Headmaster
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.line(margin + sigColWidth + 2, y + 7, margin + sigColWidth * 2 - 6, y + 7);
  doc.text(reportCard.headmasterName || 'Dr. C. G. Mugabe', margin + sigColWidth + 2, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Headmaster's Official Seal & Signature", margin + sigColWidth + 2, y + 14.5);

  // Col 3: Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.line(margin + sigColWidth * 2 + 2, y + 7, margin + contentWidth - 2, y + 7);
  doc.text(reportCard.generatedDate || new Date().toLocaleDateString('en-GB'), margin + sigColWidth * 2 + 2, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Date of Issue', margin + sigColWidth * 2 + 2, y + 14.5);

  // Security Footnote at bottom
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Academic Record • Dadaya High School E-Report Portal • Any unauthorized alteration or reproduction renders this document null and void.', pageWidth / 2, pageHeight - margin + 1, { align: 'center' });

  return doc;
};

export const downloadReportCardPDF = (reportCard: ReportCard) => {
  const doc = generateReportCardPDF(reportCard);
  const fileName = `Dadaya_ReportCard_${reportCard.studentId}_${reportCard.term.replace(/\s+/g, '')}_${reportCard.academicYear.replace(/[/]/g, '-')}.pdf`;
  doc.save(fileName);
};
