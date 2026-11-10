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

  // A-Level (Preserved and Enhanced)
  {
    id: 'lower-six-sciences',
    name: 'Lower Six Sciences',
    formLevel: 'Lower 6',
    stream: 'Sciences',
    academicYear: '2025/2026',
    studentCount: 26,
    status: 'Active',
  },
  {
    id: 'lower-six-commercials',
    name: 'Lower Six Commercials',
    formLevel: 'Lower 6',
    stream: 'Commercials',
    academicYear: '2025/2026',
    studentCount: 24,
    status: 'Active',
  },
  {
    id: 'lower-six-arts',
    name: 'Lower Six Arts',
    formLevel: 'Lower 6',
    stream: 'Arts',
    academicYear: '2025/2026',
    studentCount: 22,
    status: 'Active',
  },
  {
    id: 'upper-six-sciences',
    name: 'Upper Six Sciences',
    formLevel: 'Upper 6',
    stream: 'Sciences',
    academicYear: '2025/2026',
    studentCount: 25,
    status: 'Active',
  },
  {
    id: 'upper-six-commercials',
    name: 'Upper Six Commercials',
    formLevel: 'Upper 6',
    stream: 'Commercials',
    academicYear: '2025/2026',
    studentCount: 23,
    status: 'Active',
  },
  {
    id: 'upper-six-arts',
    name: 'Upper Six Arts',
    formLevel: 'Upper 6',
    stream: 'Arts',
    academicYear: '2025/2026',
    studentCount: 21,
    status: 'Active',
  },
];

export const initialSubjects: Subject[] = [
  // General & O-Level / Core
  { id: 'maths', code: 'MTH101', name: 'Mathematics', department: 'Mathematics & Computing', passMark: 50, status: 'Active' },
  { id: 'english', code: 'ENG101', name: 'English Language', department: 'Languages & Humanities', passMark: 50, status: 'Active' },

  // A-Level Sciences: Pure Mathematics, Physics, Computer Science, Biology, Chemistry, Geography, Statistics
  { id: 'pure-maths', code: 'PMTH601', name: 'Pure Mathematics', department: 'Mathematics & Computing', passMark: 50, status: 'Active' },
  { id: 'physics', code: 'PHY601', name: 'Physics', department: 'Pure Sciences', passMark: 50, status: 'Active' },
  { id: 'ict', code: 'CSC601', name: 'Computer Science', department: 'Mathematics & Computing', passMark: 50, status: 'Active' },
  { id: 'biology', code: 'BIO601', name: 'Biology', department: 'Biological Sciences', passMark: 50, status: 'Active' },
  { id: 'chemistry', code: 'CHM601', name: 'Chemistry', department: 'Pure Sciences', passMark: 50, status: 'Active' },
  { id: 'geography', code: 'GEO601', name: 'Geography', department: 'Environmental Studies', passMark: 50, status: 'Active' },
  { id: 'statistics', code: 'STA601', name: 'Statistics', department: 'Mathematics & Computing', passMark: 50, status: 'Active' },

  // A-Level Arts: Literature in English, FRS (Family and Religious Studies), History, Shona
  { id: 'literature', code: 'LIT601', name: 'Literature in English', department: 'Languages & Humanities', passMark: 50, status: 'Active' },
  { id: 'frs', code: 'FRS601', name: 'Family and Religious Studies (FRS)', department: 'Languages & Humanities', passMark: 50, status: 'Active' },
  { id: 'history', code: 'HIS601', name: 'History', department: 'Languages & Humanities', passMark: 50, status: 'Active' },
  { id: 'shona', code: 'SHN601', name: 'Shona', department: 'Languages & Humanities', passMark: 50, status: 'Active' },

  // A-Level Commercials: Pure Mathematics, Business Studies, Computer Science, Principles of Accounting, Statistics, Geography
  { id: 'business', code: 'BUS601', name: 'Business Studies', department: 'Commercials', passMark: 50, status: 'Active' },
  { id: 'accounts', code: 'ACC601', name: 'Principles of Accounting', department: 'Commercials', passMark: 50, status: 'Active' },
];

export const initialTeachers: Teacher[] = [
  {
    id: 'tch-gunda',
    name: 'Gunda',
    surname: 'Nyasha',
    title: 'Mr. Gunda',
    email: 'gunda@gmail.com',
    password: 'gunda',
    ecNumber: 'EC-GUNDA-01',
    assignedClassIds: [
      'form-1-red',
      'form-1-green',
      'form-1-yellow',
      'form-1-blue',
      'form-2-red',
      'form-2-green',
      'form-2-white',
      'form-2-yellow',
      'form-2-blue',
      'form-3-sciences-1',
      'form-3-sciences-2',
      'form-3-commercials',
      'form-3-arts-ict',
      'form-4-sciences-1',
      'form-4-sciences-2',
      'form-4-commercials',
      'form-4-arts-ict',
      'lower-six-sciences',
      'lower-six-commercials',
      'lower-six-arts',
      'upper-six-sciences',
      'upper-six-commercials',
      'upper-six-arts',
    ],
    assignedSubjectIds: [
      'pure-maths',
      'physics',
      'computer-science',
      'biology',
      'chemistry',
      'geography',
      'statistics',
      'maths',
      'literature',
      'frs',
      'history',
      'shona',
      'english',
      'business',
      'accounts',
      'ict',
    ],
    status: 'Active',
    phone: '+263 77 100 2000',
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
