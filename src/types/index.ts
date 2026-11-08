export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email?: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  associatedId?: string; // Student ID or Teacher ID
}

export interface Student {
  id: string; // e.g. DHS001
  name: string;
  surname: string;
  classId: string;
  className: string;
  dob?: string; // YYYY-MM-DD
  gender?: 'Male' | 'Female';
  status: 'Active' | 'Inactive' | 'Transferred';
  email?: string;
  password?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
}

export interface Teacher {
  id: string; // e.g. TCH001
  name: string;
  surname: string;
  title: string; // e.g. Mr. Moyo
  email: string;
  ecNumber: string; // e.g. EC88421
  assignedClassIds: string[];
  assignedSubjectIds: string[];
  status: 'Active' | 'On Leave';
  phone?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Form 3 Blue"
  formLevel: 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Lower 6' | 'Upper 6';
  stream: string; // e.g. "Blue", "Red", "Sciences 1", etc.
  classTeacherId?: string;
  classTeacherName?: string;
  academicYear: string;
  studentCount?: number;
  status: 'Active' | 'Archived';
}

export interface Subject {
  id: string;
  code: string; // e.g. MTH101
  name: string; // e.g. "Mathematics"
  department: string; // e.g. "Sciences & Mathematics"
  passMark: number; // e.g. 50
  status: 'Active' | 'Inactive';
}

export type MarkStatus = 'Saved' | 'Pending' | 'Submitted' | 'Approved';

export interface Mark {
  id: string;
  studentId: string;
  studentName: string;
  surname: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string; // e.g. "2025/2026"
  mark: number; // 0 - 100
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'U';
  remark: string;
  status: MarkStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCardSubjectRecord {
  subjectId: string;
  subjectName: string;
  percentage: number;
  grade: string;
  remark: string;
  teacherName?: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  surname: string;
  className: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
  subjectRecords: ReportCardSubjectRecord[];
  totalScore: number;
  averagePercentage: number;
  overallGrade: string;
  teacherRemarks: string;
  headmasterRemarks: string;
  generatedDate: string;
  status: 'Draft' | 'Published';
  classPosition?: string;
  rank?: number;
  cohortTotal?: number;
  attendancePresent?: number;
  attendanceTotal?: number;
  attendanceRate?: string;
  classTeacherName?: string;
  headmasterName?: string;
  schoolMotto?: string;
  isComplete?: boolean;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  details?: string;
  timestamp: string;
}

export interface GradeBoundary {
  grade: 'A' | 'B' | 'C' | 'D' | 'U';
  minMark: number;
  maxMark: number;
  remark: string;
  category: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
}

export interface SchoolSettings {
  schoolName: string;
  motto: string;
  currentTerm: 'Term 1' | 'Term 2' | 'Term 3';
  currentAcademicYear: string;
  headmasterName: string;
  address: string;
  phone: string;
  email: string;
  gradeBoundaries: GradeBoundary[];
  firebaseConfigured?: boolean;
}
