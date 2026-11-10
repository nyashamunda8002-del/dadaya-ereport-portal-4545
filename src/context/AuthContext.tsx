import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Student, Teacher } from '../types';
import dataService from '../services/dataService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  currentStudent: Student | null;
  currentTeacher: Teacher | null;
  isLoading: boolean;
  loginAsStudent: (data: {
    schoolId?: string;
    dob?: string;
    name?: string;
    surname?: string;
    classId?: string;
    password?: string;
    studentId?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (data: {
    name: string;
    surname: string;
    classId: string;
    password?: string;
    gender?: 'Male' | 'Female';
    dob?: string;
    studentId?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
    autoLogin?: boolean;
  }) => Promise<{ success: boolean; error?: string; student?: Student }>;
  loginAsTeacher: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (role: UserRole, targetId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'dadaya_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.user) {
          setCurrentUser(session.user);
          if (session.user.role === 'student' && session.user.associatedId) {
            const s = dataService.getStudentById(session.user.associatedId);
            if (s) setCurrentStudent(s);
          } else if (session.user.role === 'teacher' && session.user.associatedId) {
            const t = dataService.getTeacherById(session.user.associatedId);
            if (t) setCurrentTeacher(t);
          }
        }
      }
    } catch {
      // Clear invalid session
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session updates
  const saveSession = (user: User | null) => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const loginAsStudent = async (data: {
    schoolId?: string;
    dob?: string;
    name?: string;
    surname?: string;
    classId?: string;
    password?: string;
    studentId?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // Smooth realistic loading

    const targetSchoolId = (data.schoolId || data.studentId || '').trim().toUpperCase();
    const cleanDob = (data.dob || '').trim();

    if (!targetSchoolId) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Please enter your candidate School ID (e.g. DHS001).',
      };
    }

    if (!cleanDob) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Date of Birth is required to verify candidate identity and protect student record privacy.',
      };
    }

    const allStudents = dataService.getStudents();
    let student = allStudents.find((s) => s.id.toUpperCase() === targetSchoolId);

    // Fallback lookup if DHS001 was initialized
    if (!student && targetSchoolId === 'DHS001') {
      student = dataService.addStudent({
        id: 'DHS001',
        name: 'Tendai',
        surname: 'Shumba',
        classId: 'lower-six-sciences',
        dob: '2008-05-14',
        gender: 'Male',
        status: 'Active',
        email: 'tendai.shumba@student.dadaya.ac.zw',
      });
    }

    if (!student) {
      setIsLoading(false);
      return {
        success: false,
        error: `Candidate with School ID "${targetSchoolId}" not found. Please verify your School ID.`,
      };
    }

    if (student.status === 'Inactive') {
      setIsLoading(false);
      return {
        success: false,
        error: 'This candidate account has been deactivated. Please contact the school administration.',
      };
    }

    // Strict DOB validation to guarantee student privacy
    if (student.dob) {
      const normInput = cleanDob.replace(/[/]/g, '-');
      const normSaved = student.dob.replace(/[/]/g, '-');
      if (normInput !== normSaved) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Date of birth does not match official candidate records. Access rejected for student privacy.',
        };
      }
    } else {
      student.dob = cleanDob;
    }

    const user: User = {
      id: student.id,
      displayName: `${student.name} ${student.surname}`,
      role: 'student',
      associatedId: student.id,
      email: student.email,
    };

    setCurrentUser(user);
    setCurrentStudent(student);
    setCurrentTeacher(null);
    saveSession(user);

    dataService.logActivity({
      user: `${student.name} ${student.surname}`,
      role: 'student',
      action: 'Student logged in to E-Report portal',
      details: `${student.className} • ID ${student.id}`,
    });

    setIsLoading(false);
    return { success: true };
  };

  const registerStudent = async (data: {
    name: string;
    surname: string;
    classId: string;
    password?: string;
    gender?: 'Male' | 'Female';
    dob?: string;
    studentId?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
    autoLogin?: boolean;
  }): Promise<{ success: boolean; error?: string; student?: Student }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));

    const cleanName = data.name.trim();
    const cleanSurname = data.surname.trim();
    const cleanPassword = data.password?.trim() || '';

    if (!cleanName || !cleanSurname) {
      setIsLoading(false);
      return { success: false, error: 'Please enter both student first name and surname.' };
    }

    if (!data.classId) {
      setIsLoading(false);
      return { success: false, error: 'Please select a class to enroll in.' };
    }

    // Auto-generate or assign DHS number
    const allStudents = dataService.getStudents();
    let maxNum = 0;
    allStudents.forEach((s) => {
      const match = s.id.match(/^DHS(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const autoId = `DHS${String(maxNum + 1).padStart(3, '0')}`;

    const newStudent = dataService.addStudent(
      {
        id: autoId,
        name: cleanName,
        surname: cleanSurname,
        classId: data.classId,
        dob: data.dob || '2008-01-01',
        gender: data.gender || 'Male',
        status: 'Active',
        email: `${cleanName.toLowerCase()}.${cleanSurname.toLowerCase()}@student.dadaya.ac.zw`,
        password: cleanPassword,
      },
      `${cleanName} ${cleanSurname} (Student Enrollment)`
    );

    // If autoLogin is requested (e.g. from individual self-entry), set session.
    // Otherwise, keep current session clear so multiple students can enroll on a single PC!
    if (data.autoLogin) {
      const user: User = {
        id: newStudent.id,
        displayName: `${newStudent.name} ${newStudent.surname}`,
        role: 'student',
        associatedId: newStudent.id,
        email: newStudent.email,
      };

      setCurrentUser(user);
      setCurrentStudent(newStudent);
      setCurrentTeacher(null);
      saveSession(user);
    } else {
      dataService.logActivity({
        user: `${newStudent.name} ${newStudent.surname}`,
        role: 'student',
        action: 'Student enrolled in class (Single-PC Desk Registration)',
        details: `${newStudent.className} • ID ${newStudent.id}`,
      });
    }

    setIsLoading(false);
    return { success: true, student: newStudent };
  };

  const loginAsTeacher = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Look up teacher by email
    let teacher = dataService.getTeachers().find((t) => t.email.toLowerCase() === cleanEmail);

    // If teacher Gunda was requested but not found in cached storage, provision now
    if (!teacher && cleanEmail === 'gunda@gmail.com') {
      teacher = dataService.addTeacher({
        id: 'tch-gunda',
        name: 'Gunda',
        surname: 'Nyasha',
        title: 'Mr. Gunda',
        email: 'gunda@gmail.com',
        password: 'gunda',
        ecNumber: 'EC-GUNDA-01',
        assignedClassIds: dataService.getClasses().map((c) => c.id),
        assignedSubjectIds: dataService.getSubjects().map((s) => s.id),
        status: 'Active',
        phone: '+263 77 100 2000',
      });
    }

    if (!teacher) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Teacher account not found. Please verify your email address.',
      };
    }

    // Verify password: for gunda@gmail.com password is "gunda"
    const expectedPassword = teacher.password || (cleanEmail === 'gunda@gmail.com' ? 'gunda' : 'password123');
    if (cleanPassword !== expectedPassword) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Incorrect teacher password. Please verify your password.',
      };
    }

    const user: User = {
      id: teacher.id,
      displayName: teacher.title || `${teacher.name} ${teacher.surname}`,
      role: 'teacher',
      associatedId: teacher.id,
      email: teacher.email,
    };

    setCurrentUser(user);
    setCurrentTeacher(teacher);
    setCurrentStudent(null);
    saveSession(user);

    dataService.logActivity({
      user: teacher.title,
      role: 'teacher',
      action: 'Teacher logged in to faculty portal',
      details: `EC ${teacher.ecNumber} • Commercial faculty session started`,
    });

    setIsLoading(false);
    return { success: true };
  };

  const loginAsAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@dadaya.ac.zw' || cleanEmail === 'admin' || cleanEmail.includes('admin')) {
      const user: User = {
        id: 'admin-001',
        displayName: 'School Administrator',
        role: 'admin',
        email: 'admin@dadaya.ac.zw',
      };

      setCurrentUser(user);
      setCurrentStudent(null);
      setCurrentTeacher(null);
      saveSession(user);

      dataService.logActivity({
        user: 'Administrator',
        role: 'admin',
        action: 'Administrator logged in to management console',
        details: 'Full system privileges granted',
      });

      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid administrator email or password. Use admin@dadaya.ac.zw' };
  };

  // Quick portal session switch for administrative/commercial convenience
  const quickLogin = (role: UserRole, targetId?: string) => {
    if (role === 'student') {
      // 1-time unverified sign-in rejected to enforce candidate privacy
      console.warn('1-time unverified sign-in for students is rejected to ensure candidate privacy.');
      return;
    } else if (role === 'teacher') {
      const id = targetId || 'tch-gunda';
      let teacher = dataService.getTeacherById(id) || dataService.getTeachers().find((t) => t.email.toLowerCase() === 'gunda@gmail.com');
      if (!teacher) {
        teacher = dataService.addTeacher({
          id: 'tch-gunda',
          name: 'Gunda',
          surname: 'Nyasha',
          title: 'Mr. Gunda',
          email: 'gunda@gmail.com',
          password: 'gunda',
          ecNumber: 'EC-GUNDA-01',
          assignedClassIds: dataService.getClasses().map((c) => c.id),
          assignedSubjectIds: dataService.getSubjects().map((s) => s.id),
          status: 'Active',
          phone: '+263 77 100 2000',
        });
      }
      if (teacher) {
        const u: User = {
          id: teacher.id,
          displayName: teacher.title,
          role: 'teacher',
          associatedId: teacher.id,
          email: teacher.email,
        };
        setCurrentUser(u);
        setCurrentTeacher(teacher);
        setCurrentStudent(null);
        saveSession(u);
      }
    } else {
      const u: User = {
        id: 'admin-001',
        displayName: 'School Administrator',
        role: 'admin',
        email: 'admin@dadaya.ac.zw',
      };
      setCurrentUser(u);
      setCurrentTeacher(null);
      setCurrentStudent(null);
      saveSession(u);
    }
  };

  const logout = () => {
    if (currentUser) {
      dataService.logActivity({
        user: currentUser.displayName,
        role: currentUser.role,
        action: 'User signed out',
      });
    }
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
    saveSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        currentStudent,
        currentTeacher,
        isLoading,
        loginAsStudent,
        registerStudent,
        loginAsTeacher,
        loginAsAdmin,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
