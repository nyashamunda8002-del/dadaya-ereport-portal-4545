import { Student, Teacher, SchoolClass, Subject, Mark, SchoolSettings, ActivityLog } from '../types';

export const initialSettings: SchoolSettings = {
  schoolName: 'DADAYA HIGH SCHOOL',
  motto: 'DISCIPLINE • EXCELLENCE • FUTURE',
  currentTerm: 'Term 1',
  currentAcademicYear: '2025/2026',
  headmasterName: 'Dr. C. G. Mugabe',
  address: 'Dadaya Mission, P. Bag 650, Zvishavane, Zimbabwe',
  phone: '+263 51 2234 / 2235',
  email: 'admin@dadaya.ac.zw',
  firebaseConfigured: false,
  gradeBoundaries: [
    { grade: 'A', minMark: 80, maxMark: 100, remark: 'Distinction / Excellent effort', category: 'Excellent' },
    { grade: 'B', minMark: 70, maxMark: 79, remark: 'Good performance. Keep it up', category: 'Good' },
    { grade: 'C', minMark: 50, maxMark: 69, remark: 'Credit pass. Work harder', category: 'Fair' },
    { grade: 'D', minMark: 40, maxMark: 49, remark: 'Pass. Needs more attention', category: 'Needs Improvement' },
    { grade: 'U', minMark: 0, maxMark: 39, remark: 'Ungraded. Urgent intervention needed', category: 'Needs Improvement' },
  ],
};

export const initialClasses: SchoolClass[] = [
  // Form 1
  { id: 'form-1-red', name: 'Form 1 Red', formLevel: 'Form 1', stream: 'Red', academicYear: '2025/2026', studentCount: 38, status: 'Active' },
  { id: 'form-1-green', name: 'Form 1 Green', formLevel: 'Form 1', stream: 'Green', academicYear: '2025/2026', studentCount: 36, status: 'Active' },
  { id: 'form-1-yellow', name: 'Form 1 Yellow', formLevel: 'Form 1', stream: 'Yellow', academicYear: '2025/2026', studentCount: 35, status: 'Active' },
  { id: 'form-1-blue', name: 'Form 1 Blue', formLevel: 'Form 1', stream: 'Blue', academicYear: '2025/2026', studentCount: 37, status: 'Active' },

  // Form 2
  { id: 'form-2-red', name: 'Form 2 Red', formLevel: 'Form 2', stream: 'Red', academicYear: '2025/2026', studentCount: 35, status: 'Active' },
  { id: 'form-2-green', name: 'Form 2 Green', formLevel: 'Form 2', stream: 'Green', academicYear: '2025/2026', studentCount: 36, status: 'Active' },
  { id: 'form-2-white', name: 'Form 2 White', formLevel: 'Form 2', stream: 'White', academicYear: '2025/2026', studentCount: 34, status: 'Active' },
  { id: 'form-2-yellow', name: 'Form 2 Yellow', formLevel: 'Form 2', stream: 'Yellow', academicYear: '2025/2026', studentCount: 35, status: 'Active' },
  { id: 'form-2-blue', name: 'Form 2 Blue', formLevel: 'Form 2', stream: 'Blue', academicYear: '2025/2026', studentCount: 36, status: 'Active' },

  // Form 3
  { id: 'form-3-sciences-1', name: 'Form 3 Sciences 1', formLevel: 'Form 3', stream: 'Sciences 1', academicYear: '2025/2026', studentCount: 32, status: 'Active' },
  { id: 'form-3-sciences-2', name: 'Form 3 Sciences 2', formLevel: 'Form 3', stream: 'Sciences 2', academicYear: '2025/2026', studentCount: 31, status: 'Active' },
  { id: 'form-3-commercials', name: 'Form 3 Commercials', formLevel: 'Form 3', stream: 'Commercials', academicYear: '2025/2026', studentCount: 34, status: 'Active' },
  { id: 'form-3-arts-ict', name: 'Form 3 Arts/ICT', formLevel: 'Form 3', stream: 'Arts/ICT', academicYear: '2025/2026', studentCount: 33, status: 'Active' },

  // Form 4
  { id: 'form-4-sciences-1', name: 'Form 4 Sciences 1', formLevel: 'Form 4', stream: 'Sciences 1', academicYear: '2025/2026', studentCount: 30, status: 'Active' },
  { id: 'form-4-sciences-2', name: 'Form 4 Sciences 2', formLevel: 'Form 4', stream: 'Sciences 2', academicYear: '2025/2026', studentCount: 29, status: 'Active' },
  { id: 'form-4-commercials', name: 'Form 4 Commercials', formLevel: 'Form 4', stream: 'Commercials', academicYear: '2025/2026', studentCount: 33, status: 'Active' },
  { id: 'form-4-arts-ict', name: 'Form 4 Arts/ICT', formLevel: 'Form 4', stream: 'Arts/ICT', academicYear: '2025/2026', studentCount: 32, status: 'Active' },

  // A-Level (Preserved)
  {
    id: 'lower-six-sciences',
    name: 'Lower Six Sciences',
    formLevel: 'Lower 6',
    stream: 'Sciences',
    academicYear: '2025/2026',
    studentCount: 0,
    status: 'Active',
  },
  {
    id: 'lower-six-commercials',
    name: 'Lower Six Commercials',
    formLevel: 'Lower 6',
    stream: 'Commercials',
    academicYear: '2025/2026',
    studentCount: 0,
    status: 'Active',
  },
  {
    id: 'lower-six-arts',
    name: 'Lower Six Arts',
    formLevel: 'Lower 6',
    stream: 'Arts',
    academicYear: '2025/2026',
    studentCount: 0,
    status: 'Active',
  },
];

export const initialSubjects: Subject[] = [
  { id: 'maths', code: 'MTH101', name: 'Mathematics', department: 'Mathematics & Computing', passMark: 50, status: 'Active' },
  { id: 'english', code: 'ENG101', name: 'English Language', department: 'Languages & Humanities', passMark: 50, status: 'Active' },
  { id: 'physics', code: 'PHY101', name: 'Physics', department: 'Pure Sciences', passMark: 50, status: 'Active' },
  { id: 'chemistry', code: 'CHM101', name: 'Chemistry', department: 'Pure Sciences', passMark: 50, status: 'Active' },
  { id: 'biology', code: 'BIO101', name: 'Biology', department: 'Biological Sciences', passMark: 50, status: 'Active' },
  { id: 'history', code: 'HIS101', name: 'History', department: 'Languages & Humanities', passMark: 50, status: 'Active' },
  { id: 'shona', code: 'SHN101', name: 'Shona', department: 'Languages & Humanities', passMark: 50, status: 'Active' },
  { id: 'ict', code: 'CSC101', name: 'Computer Science', department: 'Mathematics & Computing', passMark: 50, status: 'Active' },
  { id: 'geography', code: 'GEO101', name: 'Geography', department: 'Environmental Studies', passMark: 50, status: 'Active' },
  { id: 'accounts', code: 'ACC101', name: 'Principles of Accounts', department: 'Commercials', passMark: 50, status: 'Active' },
  { id: 'business', code: 'BUS101', name: 'Business Studies', department: 'Commercials', passMark: 50, status: 'Active' },
];

export const initialTeachers: Teacher[] = [
  {
    id: 'tch-ahmed',
    name: 'Farai',
    surname: 'Ahmed',
    title: 'Mr. Ahmed',
    email: 'ahmed@dadaya.ac.zw',
    ecNumber: 'EC89104',
    assignedClassIds: ['form-1-red', 'form-2-green', 'form-3-sciences-1', 'form-4-sciences-1', 'lower-six-sciences'],
    assignedSubjectIds: ['maths', 'physics', 'ict'],
    status: 'Active',
    phone: '+263 77 112 3456',
  },
  {
    id: 'tch-moyo',
    name: 'Dumisani',
    surname: 'Moyo',
    title: 'Mr. Moyo',
    email: 'moyo@dadaya.ac.zw',
    ecNumber: 'EC88421',
    assignedClassIds: ['form-1-blue', 'form-2-red', 'form-3-sciences-2', 'lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
    assignedSubjectIds: ['maths', 'physics'],
    status: 'Active',
    phone: '+263 77 234 5678',
  },
  {
    id: 'tch-sibanda',
    name: 'Sithokozile',
    surname: 'Sibanda',
    title: 'Mrs. Sibanda',
    email: 'sibanda@dadaya.ac.zw',
    ecNumber: 'EC91032',
    assignedClassIds: ['form-1-green', 'form-2-yellow', 'form-3-commercials', 'lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
    assignedSubjectIds: ['english', 'history'],
    status: 'Active',
    phone: '+263 71 890 1234',
  },
  {
    id: 'tch-nyathi',
    name: 'Emmanuel',
    surname: 'Nyathi',
    title: 'Mr. Nyathi',
    email: 'nyathi@dadaya.ac.zw',
    ecNumber: 'EC76541',
    assignedClassIds: ['form-1-yellow', 'form-2-white', 'form-4-sciences-2', 'lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
    assignedSubjectIds: ['chemistry', 'biology'],
    status: 'Active',
    phone: '+263 77 456 7890',
  },
  {
    id: 'tch-dlodlo',
    name: 'Nomsa',
    surname: 'Dlodlo',
    title: 'Ms. Dlodlo',
    email: 'dlodlo@dadaya.ac.zw',
    ecNumber: 'EC82390',
    assignedClassIds: ['form-2-blue', 'form-3-arts-ict', 'form-4-arts-ict', 'lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
    assignedSubjectIds: ['shona', 'ict'],
    status: 'Active',
    phone: '+263 78 345 6789',
  },
];

export const initialStudents: Student[] = [];

export const initialMarks: Mark[] = [];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    user: 'Administrator',
    role: 'admin',
    action: 'System initialized',
    details: 'Lower Six Sciences, Commercials, and Arts streams active. Student database ready for enrollment.',
    timestamp: '24 Oct 2026, 08:00 AM',
  },
];
