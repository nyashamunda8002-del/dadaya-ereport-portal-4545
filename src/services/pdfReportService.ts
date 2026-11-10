import { jsPDF } from 'jspdf';
import { ReportCard } from '../types';

/**
 * Fetch Dadaya High School crest as a data URL for embedding into the official PDF
 */
const getCrestImageDataUrl = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/assets/aistudio/dadaya_crest_transparent.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * PDF Report Card Generator for Dadaya High School
 * Exactly matches the visual layout, typography, and styling of the official on-screen report card
 */
export const generateReportCardPDF = (
  reportCard: ReportCard,
  logoDataUrl?: string | null
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  // Optional background crest watermark matching official school stationery
  if (logoDataUrl) {
    try {
      doc.saveGraphicsState();
      const GState = (doc as any).GState;
      if (GState) {
        doc.setGState(new GState({ opacity: 0.035 }));
        doc.addImage(logoDataUrl, 'PNG', pageWidth / 2 - 40, 105, 80, 100);
      }
      doc.restoreGraphicsState();
    } catch {
      // Fallback if GState not supported
    }
  }

  // ========================================================
  // 1. OFFICIAL HEADER (Flanked crest, title, trilingual motto, address, banner)
  // ========================================================
  let y = margin + 2;

  // Crest logo flanked by two royal blue lines
  const crestWidth = 14;
  const crestHeight = 17;
  const crestX = (pageWidth - crestWidth) / 2;
  const crestY = y;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', crestX, crestY, crestWidth, crestHeight);
    } catch {
      drawFallbackCrest(doc, crestX, crestY, crestWidth, crestHeight);
    }
  } else {
    drawFallbackCrest(doc, crestX, crestY, crestWidth, crestHeight);
  }

  // Left & Right Flanking Division Rules
  doc.setDrawColor(21, 87, 176); // #1557B0
  doc.setLineWidth(0.4);
  doc.line(crestX - 22, crestY + crestHeight / 2, crestX - 3, crestY + crestHeight / 2);
  doc.line(crestX + crestWidth + 3, crestY + crestHeight / 2, crestX + crestWidth + 22, crestY + crestHeight / 2);

  y = crestY + crestHeight + 4;

  // DADAYA HIGH SCHOOL Title
  doc.setFont('times', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(8, 43, 99); // #082B63
  doc.text('DADAYA HIGH SCHOOL', pageWidth / 2, y, { align: 'center' });

  // Trilingual School Motto
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 87, 176); // #1557B0
  doc.text('EDUCATION FOR LIFE • IMFUNDO YEMPILO • DZIDZO YOUPENYU', pageWidth / 2, y, {
    align: 'center',
  });

  // Official Church of Christ Mission Address
  y += 3.8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139); // #64748B
  doc.text(
    'CHURCH OF CHRIST MISSION • P.O. BOX 9, ZVISHAVANE, ZIMBABWE • TEL: +263 51 2234',
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // Solid Navy Progress Report Pill Banner
  y += 4.5;
  const bannerWidth = 110;
  const bannerHeight = 5.8;
  const bannerX = (pageWidth - bannerWidth) / 2;
  doc.setFillColor(8, 43, 99); // #082B63
  doc.roundedRect(bannerX, y, bannerWidth, bannerHeight, 1, 1, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL STUDENT ACADEMIC PROGRESS REPORT', pageWidth / 2, y + 4.1, {
    align: 'center',
  });

  // Header Divider Rule across full width
  y += bannerHeight + 3.2;
  doc.setDrawColor(8, 43, 99); // #082B63
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + contentWidth, y);

  y += 3.5;

  // ========================================================
  // 2. CANDIDATE INFORMATION BOX (Light blue tint with 3 distinct columns)
  // ========================================================
  const infoBoxHeight = 22;
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, infoBoxHeight, 2, 2, 'FD');

  const col1X = margin + 5;
  const col2X = margin + contentWidth * 0.36;
  const col3X = margin + contentWidth * 0.7;

  // Row 1 - Labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text('CANDIDATE NAME', col1X, y + 4);
  doc.text('CANDIDATE ID', col2X, y + 4);
  doc.text('CLASS STREAM', col3X, y + 4);

  // Row 1 - Values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 29, 58); // #101D3A
  doc.text(`${reportCard.studentName} ${reportCard.surname}`, col1X, y + 8.5);

  doc.setTextColor(21, 87, 176); // #1557B0
  doc.text(`${reportCard.studentId}`, col2X, y + 8.5);

  doc.setTextColor(30, 41, 59); // #1E293B
  doc.text(`${reportCard.className}`, col3X, y + 8.5);

  // Row 2 - Labels
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('ACADEMIC TERM', col1X, y + 14);
  doc.text('ACADEMIC YEAR', col2X, y + 14);
  doc.text('CLASS POSITION', col3X, y + 14);

  // Row 2 - Values
  doc.setFontSize(7.8);
  doc.setTextColor(51, 65, 85);
  doc.text(`${reportCard.term}`, col1X, y + 18.2);

  doc.setTextColor(51, 65, 85);
  doc.text(`${reportCard.academicYear}`, col2X, y + 18.2);

  doc.setTextColor(16, 29, 58);
  doc.text(`${reportCard.classPosition || '—'}`, col3X, y + 18.2);

  y += infoBoxHeight + 3.5;

  // ========================================================
  // 3. CURRICULUM SUBJECTS TABLE (Solid Navy Header & Two-Row Summary Footer)
  // ========================================================
  const tableHeaderHeight = 6.5;
  doc.setFillColor(8, 43, 99); // #082B63
  doc.roundedRect(margin, y, contentWidth, tableHeaderHeight, 1.5, 1.5, 'F');
  // Fill square bottom corners for header
  doc.rect(margin, y + tableHeaderHeight - 1.5, contentWidth, 1.5, 'F');

  // Column positions matching contentWidth (186mm)
  // Col 1: # (9mm)
  // Col 2: Curriculum Subject (65mm)
  // Col 3: Max Mark (20mm)
  // Col 4: Mark (%) (22mm)
  // Col 5: Grade (16mm)
  // Col 6: Teacher Assessment Comment (54mm)
  const c1 = margin + 4.5; // centered in 9mm
  const c2 = margin + 11;
  const c3 = margin + 86; // centered in 20mm
  const c4 = margin + 107; // centered in 22mm
  const c5 = margin + 126; // centered in 16mm
  const c6 = margin + 135;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', c1, y + 4.5, { align: 'center' });
  doc.text('Curriculum Subject', c2, y + 4.5);
  doc.text('Max Mark', c3, y + 4.5, { align: 'center' });
  doc.text('Mark (%)', c4, y + 4.5, { align: 'center' });
  doc.text('Grade', c5, y + 4.5, { align: 'center' });
  doc.text("Teacher's Assessment Comment", c6, y + 4.5);

  y += tableHeaderHeight;

  // Render Subject Rows
  const records = reportCard.subjectRecords || [];
  const rowHeight = 6.2;

  if (records.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 12, 'S');

    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No subject marks entered for this term yet.', pageWidth / 2, y + 7.5, {
      align: 'center',
    });
    y += 12;
  } else {
    records.forEach((rec, idx) => {
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');

      // Hairline bottom border
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      // # Number
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), c1, y + 4.3, { align: 'center' });

      // Curriculum Subject Name
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 29, 58);
      doc.text(rec.subjectName, c2, y + 4.3);

      // Max Mark
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('100', c3, y + 4.3, { align: 'center' });

      // Mark (%)
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(8, 43, 99);
      doc.text(`${rec.percentage}%`, c4, y + 4.3, { align: 'center' });

      // Styled Grade Badge
      const isDistinction = rec.percentage >= 75;
      const isCredit = rec.percentage >= 50;
      doc.setFillColor(
        isDistinction ? 236 : isCredit ? 239 : 255,
        isDistinction ? 253 : isCredit ? 246 : 241,
        isDistinction ? 245 : isCredit ? 255 : 242
      );
      doc.roundedRect(c5 - 4.5, y + 1.2, 9, 4, 0.8, 0.8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      if (isDistinction) {
        doc.setTextColor(6, 95, 70); // #065F46
      } else if (isCredit) {
        doc.setTextColor(30, 64, 175); // #1E40AF
      } else {
        doc.setTextColor(159, 18, 57); // #9F1239
      }
      doc.text(rec.grade, c5, y + 4.1, { align: 'center' });

      // Teacher Remark
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.8);
      doc.setTextColor(71, 85, 105);
      const remarkText = doc.splitTextToSize(
        rec.remark || 'Satisfactory academic participation and progress.',
        contentWidth - (c6 - margin) - 2
      );
      doc.text(remarkText[0] || '', c6, y + 4.3);

      y += rowHeight;
    });
  }

  // Table Footer Row 1: AGGREGATE TOTAL
  const footerRow1Height = 5.5;
  doc.setFillColor(241, 245, 249); // #F1F5F9
  doc.rect(margin, y, contentWidth, footerRow1Height, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('AGGREGATE TOTAL', margin + 65, y + 3.8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${Math.max(1, records.length) * 100}`, c3, y + 3.8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(8, 43, 99);
  doc.text(`${reportCard.totalScore}`, c4, y + 3.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Sum of ${records.length} curriculum subjects`, c6, y + 3.8);

  y += footerRow1Height;

  // Table Footer Row 2: OVERALL AVERAGE & TERM PASS STATUS
  const footerRow2Height = 6.2;
  doc.setFillColor(239, 246, 255); // #EFF6FF
  doc.rect(margin, y, contentWidth, footerRow2Height, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.line(margin, y, margin + contentWidth, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(8, 43, 99);
  doc.text('OVERALL AVERAGE', margin + 65, y + 4.2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('100%', c3, y + 4.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 87, 176); // #1557B0
  doc.text(`${reportCard.averagePercentage}%`, c4, y + 4.3, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(8, 43, 99);
  doc.text(`${reportCard.overallGrade}`, c5, y + 4.2, { align: 'center' });

  const passed = reportCard.averagePercentage >= 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  if (passed) {
    doc.setTextColor(4, 120, 87); // #047857
    doc.text('PASSED TERM STANDARD', c6, y + 4.2);
  } else {
    doc.setTextColor(225, 29, 72); // #E11D48
    doc.text('REQUIRES REMEDIAL ACADEMIC SUPPORT', c6, y + 4.2);
  }

  // Complete outer border of the table
  y += footerRow2Height;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);

  y += 3.5;

  // ========================================================
  // 4. ASSESSMENT REMARKS (Side-by-Side 2 Cards matching on-screen design)
  // ========================================================
  // ========================================================
  // 4. MICRO FOOTER MOTTO
  // ========================================================
  const footerY = 286;
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, margin + contentWidth, footerY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Dadaya High School E-Report Management System', margin, footerY + 1.5);
  doc.text('DISCIPLINE • EXCELLENCE • FUTURE', margin + contentWidth, footerY + 1.5, {
    align: 'right',
  });

  return doc;
};

/**
 * Fallback vector drawing of the Dadaya High School crest shield if image not loaded
 */
function drawFallbackCrest(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
) {
  doc.setFillColor(6, 78, 59); // Deep Emerald #064E3B
  doc.setDrawColor(234, 179, 8); // Gold #EAB308
  doc.setLineWidth(0.3);

  // Shield body
  doc.roundedRect(x + 1, y, width - 2, height - 3, 2, 2, 'FD');

  // Gold emblem cross / book details
  doc.setFillColor(234, 179, 8);
  doc.rect(x + width / 2 - 0.6, y + 3, 1.2, height - 8, 'F');
  doc.rect(x + 3.5, y + 6, width - 7, 1.2, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DHS', x + width / 2, y + height - 4.5, { align: 'center' });
}

/**
 * Downloads the official PDF report card with high fidelity styling matching the on-screen report card
 */
export const downloadReportCardPDF = async (reportCard: ReportCard): Promise<void> => {
  const logoDataUrl = await getCrestImageDataUrl();
  const doc = generateReportCardPDF(reportCard, logoDataUrl);
  const fileName = `Dadaya_ReportCard_${reportCard.studentId}_${reportCard.term.replace(
    /\s+/g,
    ''
  )}_${reportCard.academicYear.replace(/[/]/g, '-')}.pdf`;
  doc.save(fileName);
};
