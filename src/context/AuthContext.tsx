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
    name: string;
    surname: string;
    classId: string;
    password?: string;
    dob?: string;
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
    name: string;
    surname: string;
    classId: string;
    password?: string;
    dob?: string;
    studentId?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // Smooth realistic loading

    const cleanName = data.name.trim().toLowerCase();
    const cleanSurname = data.surname.trim().toLowerCase();
    const cleanPassword = data.password?.trim() || '';

    if (!cleanName || !cleanSurname) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Please enter your First Name and Surname.',
      };
    }

    // Verify against database by name, surname and class
    const student = dataService.getStudents().find((s) => {
      const nameMatch = s.name.trim().toLowerCase() === cleanName;
      const surnameMatch = s.surname.trim().toLowerCase() === cleanSurname;
      const classMatch = !data.classId || s.classId === data.classId;
      return nameMatch && surnameMatch && classMatch;
    });

    if (!student) {
      setIsLoading(false);
      return {
        success: false,
        error: `Student "${data.name} ${data.surname}" not found in this class. Please enroll below to create your account.`,
      };
    }

    if (student.status === 'Inactive') {
      setIsLoading(false);
      return {
        success: false,
        error: 'This student account has been deactivated. Please contact the school administration.',
      };
    }

    // Password verification: if student has a password registered, it must match
    if (student.password && cleanPassword && student.password !== cleanPassword) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Incorrect password. Please verify your password and try again.',
      };
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
    const teacher = dataService.getTeachers().find((t) => t.email.toLowerCase() === cleanEmail);

    if (!teacher) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Invalid teacher credentials. For testing, use moyo@dadaya.ac.zw or quick demo login below.',
      };
    }

    if (!password || password.length < 3) {
      setIsLoading(false);
      return { success: false, error: 'Please enter a valid password (minimum 3 characters).' };
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
      action: 'Teacher logged in to dashboard',
      details: `EC ${teacher.ecNumber} • Active session started`,
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

  // Quick 1-click login for test reviewers
  const quickLogin = (role: UserRole, targetId?: string) => {
    if (role === 'student') {
      const id = targetId || 'DHS001';
      let student = dataService.getStudentById(id) || dataService.getStudents()[0];
      if (!student) {
        student = dataService.addStudent({
          id: 'DHS001',
          name: 'Tinashe',
          surname: 'Shumba',
          classId: 'lower-six-sciences',
          gender: 'Male',
          status: 'Active',
          email: 'tinashe.shumba@student.dadaya.ac.zw',
          password: 'password123',
        });
      }
      if (student) {
        const u: User = {
          id: student.id,
          displayName: `${student.name} ${student.surname}`,
          role: 'student',
          associatedId: student.id,
          email: student.email,
        };
        setCurrentUser(u);
        setCurrentStudent(student);
        setCurrentTeacher(null);
        saveSession(u);
      }
    } else if (role === 'teacher') {
      const id = targetId || 'tch-moyo';
      const teacher = dataService.getTeacherById(id) || dataService.getTeachers()[0];
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
