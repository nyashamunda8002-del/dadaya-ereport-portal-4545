import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const configPath = path.resolve('firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function generatePDF() {
  console.log('Fetching students from Firestore database:', config.firestoreDatabaseId);
  const snap = await getDocs(collection(db, 'students'));
  let students = [];
  snap.forEach((doc) => {
    students.push(doc.data());
  });

  // Filter out any temporary guest accounts if present, or sort real candidate numbers first
  const realStudents = students.filter(s => s.id && !s.id.includes('GUEST') && !s.isGuest);
  const guestStudents = students.filter(s => s.id && (s.id.includes('GUEST') || s.isGuest));

  // Sort real candidates by candidate ID numeric portion (DHS001, DHS002, etc.)
  realStudents.sort((a, b) => {
    const numA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  const allOrdered = [...realStudents, ...guestStudents];
  console.log(`Total candidates to render: ${allOrdered.length} (${realStudents.length} official candidates)`);

  // Compute breakdown statistics
  const sciencesCount = realStudents.filter(s => (s.className || '').toLowerCase().includes('science') || (s.classId || '').includes('science')).length;
  const commercialsCount = realStudents.filter(s => (s.className || '').toLowerCase().includes('commercial') || (s.classId || '').includes('commercial')).length;
  const artsCount = realStudents.filter(s => (s.className || '').toLowerCase().includes('art') || (s.classId || '').includes('art')).length;
  const femaleCount = realStudents.filter(s => (s.gender || '').toLowerCase() === 'female').length;
  const maleCount = realStudents.filter(s => (s.gender || '').toLowerCase() === 'male').length;

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 32, bottom: 36, left: 32, right: 32 },
    bufferPages: true,
    info: {
      Title: 'Dadaya High School - Official Student Register',
      Author: 'Dadaya High School Academic Registry',
      Subject: 'Candidate Enrollment Register - Lower Six Form',
      Keywords: 'Dadaya High School, Zvishavane, Zimbabwe, Student Register, Lower Six',
    }
  });

  const publicOutputPath = path.resolve('public', 'dadaya_high_school_student_register.pdf');
  const artifactDir = '/.aistudio/artifacts/brain/fc9a791d-1c21-4ba8-8ebb-e831db4a52bb';
  const artifactOutputPath = path.join(artifactDir, 'dadaya_high_school_student_register.pdf');

  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const writeStreamPublic = fs.createWriteStream(publicOutputPath);
  const writeStreamArtifact = fs.createWriteStream(artifactOutputPath);

  doc.pipe(writeStreamPublic);
  doc.pipe(writeStreamArtifact);

  const crestPath = path.resolve('public/assets/aistudio/Screenshot_2026-08-11_160504_e18d926d.png');
  const hasCrest = fs.existsSync(crestPath);

  // --- Header Function ---
  function drawHeader() {
    const startY = 32;

    // School Crest on Left
    if (hasCrest) {
      try {
        doc.image(crestPath, 34, startY, { fit: [54, 58], align: 'center', valign: 'center' });
      } catch (e) {
        console.warn('Could not render crest image:', e.message);
      }
    }

    // Header Typography
    doc.fillColor('#064e3b');
    doc.font('Helvetica-Bold').fontSize(16).text('DADAYA HIGH SCHOOL', 96, startY, { tracking: 1.5 });

    doc.fillColor('#1b4332');
    doc.font('Helvetica-Bold').fontSize(8.5).text('Zvishavane, Midlands Province, Zimbabwe · Est. 1934', 96, startY + 18);

    doc.fillColor('#4b5563');
    doc.font('Helvetica').fontSize(8).text('Mission: Discipline · Excellence · Future | P. Bag 650, Zvishavane', 96, startY + 30);
    doc.text('Academic Registry Division · Ministry of Primary and Secondary Education', 96, startY + 41);

    // Document Badge Right
    doc.rect(410, startY, 150, 48).fillAndStroke('#032015', '#064e3b');
    doc.fillColor('#d1fae5').font('Helvetica-Bold').fontSize(7.5).text('OFFICIAL ACADEMIC REGISTER', 416, startY + 6, { width: 138, align: 'center' });
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9).text('LOWER SIX FORM 2026', 416, startY + 18, { width: 138, align: 'center' });
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(7).text('Status: Active Candidate Roster', 416, startY + 32, { width: 138, align: 'center' });

    // Hairline Separator Bar
    doc.strokeColor('#064e3b').lineWidth(1.5).moveTo(32, startY + 60).lineTo(562, startY + 60).stroke();
  }

  drawHeader();

  // --- Document Metadata & Metrics Summary Box ---
  let curY = 100;

  doc.rect(32, curY, 530, 48).fillAndStroke('#f8fafc', '#cbd5e1');

  // Column 1: Registry Ref & Date
  doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7).text('REGISTRY REFERENCE', 42, curY + 8);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text('DHS/REG/2026/L6-ADM', 42, curY + 18);
  doc.fillColor('#64748b').font('Helvetica').fontSize(7.5).text('Date: 26 October 2026', 42, curY + 30);

  // Column 2: Total Enrolled
  doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7).text('TOTAL ENROLLED', 170, curY + 8);
  doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(13).text(`${realStudents.length}`, 170, curY + 17);
  doc.fillColor('#64748b').font('Helvetica').fontSize(7).text(`Gender: ${maleCount} Male / ${femaleCount} Female`, 170, curY + 32);

  // Column 3: Stream Distribution
  doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7).text('STREAM ALLOCATION', 290, curY + 8);
  doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text(`Sciences: `, 290, curY + 18);
  doc.font('Helvetica-Bold').text(`${sciencesCount} candidates`, 335, curY + 18);
  doc.font('Helvetica').text(`Commercials: `, 290, curY + 30);
  doc.font('Helvetica-Bold').text(`${commercialsCount} candidates`, 350, curY + 30);

  // Column 4: Arts & Term
  doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7).text('TERM & ACADEMIC YEAR', 430, curY + 8);
  doc.fillColor('#0f172a').font('Helvetica').fontSize(8).text('Arts: ', 430, curY + 18);
  doc.font('Helvetica-Bold').text(`${artsCount} candidates`, 458, curY + 18);
  doc.font('Helvetica').text('Term: ', 430, curY + 30);
  doc.font('Helvetica-Bold').text('Term 1 (2025/2026)', 458, curY + 30);

  curY += 58;

  // --- Table Header ---
  const colX = {
    idx: 32,
    id: 54,
    name: 122,
    stream: 260,
    gender: 380,
    email: 422,
    status: 520,
  };

  const colWidths = {
    idx: 22,
    id: 68,
    name: 138,
    stream: 120,
    gender: 42,
    email: 98,
    status: 42,
  };

  function drawTableHeader(y) {
    doc.rect(32, y, 530, 20).fill('#064e3b');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7.5);
    doc.text('#', colX.idx, y + 6, { width: colWidths.idx, align: 'center' });
    doc.text('CANDIDATE ID', colX.id + 4, y + 6, { width: colWidths.id });
    doc.text('FULL CANDIDATE NAME', colX.name, y + 6, { width: colWidths.name });
    doc.text('ALLOCATED STREAM', colX.stream, y + 6, { width: colWidths.stream });
    doc.text('GENDER', colX.gender, y + 6, { width: colWidths.gender, align: 'center' });
    doc.text('INSTITUTIONAL EMAIL', colX.email, y + 6, { width: colWidths.email });
    doc.text('STATUS', colX.status, y + 6, { width: colWidths.status, align: 'center' });
  }

  drawTableHeader(curY);
  curY += 20;

  // --- Rows ---
  allOrdered.forEach((st, i) => {
    // If approaching bottom of page, start a new page
    if (curY > 730) {
      doc.addPage();
      drawHeader();
      curY = 105;
      drawTableHeader(curY);
      curY += 20;
    }

    const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(32, curY, 530, 19).fill(rowBg);

    // Hairline bottom border
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(32, curY + 19).lineTo(562, curY + 19).stroke();

    // Data values
    doc.fillColor('#64748b').font('Helvetica').fontSize(7.5);
    doc.text(`${i + 1}`, colX.idx, curY + 5, { width: colWidths.idx, align: 'center' });

    doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(8);
    doc.text(st.id || '—', colX.id + 4, curY + 5, { width: colWidths.id });

    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8);
    const fullName = `${st.name || ''} ${st.surname || ''}`.trim() || '—';
    doc.text(fullName, colX.name, curY + 5, { width: colWidths.name, lineBreak: false, ellipsis: true });

    doc.fillColor('#334155').font('Helvetica').fontSize(7.5);
    const streamName = st.className || 'Lower Six';
    doc.text(streamName, colX.stream, curY + 5, { width: colWidths.stream });

    doc.fillColor('#475569').text(st.gender || '—', colX.gender, curY + 5, { width: colWidths.gender, align: 'center' });

    doc.fillColor('#2563eb').fontSize(6.5);
    const emailStr = st.email || `${st.name?.toLowerCase() || 'student'}@student.dadaya.ac.zw`;
    doc.text(emailStr, colX.email, curY + 6, { width: colWidths.email, lineBreak: false, ellipsis: true });

    const isGuest = st.id && (st.id.includes('GUEST') || st.isGuest);
    doc.fillColor(isGuest ? '#6b7280' : '#15803d').font('Helvetica-Bold').fontSize(7);
    doc.text(isGuest ? 'GUEST' : (st.status || 'ACTIVE'), colX.status, curY + 5, { width: colWidths.status, align: 'center' });

    curY += 19;
  });

  // --- Official Endorsement & Verification Footer on Last Page ---
  if (curY > 670) {
    doc.addPage();
    drawHeader();
    curY = 110;
  } else {
    curY += 24;
  }

  doc.rect(32, curY, 530, 80).fillAndStroke('#f1f5f9', '#cbd5e1');

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text('REGISTRY CERTIFICATION & OFFICIAL ENDORSEMENT', 42, curY + 8);
  doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(
    'This document certifies that the candidates listed above have met the official prerequisite ZIMSEC O-Level matriculation standards and are duly enrolled into Lower Six streams for the 2025/2026 academic year at Dadaya High School.',
    42, curY + 20, { width: 510 }
  );

  const sigY = curY + 44;

  // Signature 1: Senior Master
  doc.strokeColor('#94a3b8').lineWidth(0.8).moveTo(42, sigY + 18).lineTo(180, sigY + 18).stroke();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5).text('Mr. D. Moyo', 42, sigY + 22);
  doc.fillColor('#64748b').font('Helvetica').fontSize(6.5).text('Senior Master / Registrar', 42, sigY + 31);

  // Signature 2: Headmaster
  doc.strokeColor('#94a3b8').lineWidth(0.8).moveTo(220, sigY + 18).lineTo(360, sigY + 18).stroke();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(7.5).text('Dr. C. G. Mugabe', 220, sigY + 22);
  doc.fillColor('#64748b').font('Helvetica').fontSize(6.5).text('Headmaster / Principal', 220, sigY + 31);

  // Signature 3: Registry Seal
  doc.strokeColor('#94a3b8').lineWidth(0.8).moveTo(400, sigY + 18).lineTo(540, sigY + 18).stroke();
  doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(7.5).text('OFFICIAL REGISTRY SEAL', 400, sigY + 22);
  doc.fillColor('#64748b').font('Helvetica').fontSize(6.5).text('Dadaya Mission, Zvishavane', 400, sigY + 31);

  // --- Add Page Numbers on All Pages ---
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(7).text(
      `Dadaya High School Official Academic Record · Page ${i + 1} of ${range.count} · Generated: 26 October 2026`,
      32,
      805,
      { width: 530, align: 'center' }
    );
  }

  doc.end();

  await new Promise((resolve) => {
    writeStreamPublic.on('finish', resolve);
  });

  console.log('PDF generated successfully at:');
  console.log('1. ', publicOutputPath);
  console.log('2. ', artifactOutputPath);
}

generatePDF().catch((err) => {
  console.error('Fatal error generating PDF:', err);
  process.exit(1);
});
