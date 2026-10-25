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
    id: 'tch-moyo',
    name: 'Dumisani',
    surname: 'Moyo',
    title: 'Mr. Moyo',
    email: 'moyo@dadaya.ac.zw',
    ecNumber: 'EC88421',
    assignedClassIds: ['lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
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
    assignedClassIds: ['lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
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
    assignedClassIds: ['lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
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
    assignedClassIds: ['lower-six-sciences', 'lower-six-commercials', 'lower-six-arts'],
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
