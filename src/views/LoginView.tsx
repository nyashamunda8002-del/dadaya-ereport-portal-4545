import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DadayaCrest } from '../components/DadayaLogo';
import dataService from '../services/dataService';
import { Student } from '../types';
import {
  Eye,
  EyeOff,
  AlertCircle,
  WifiOff,
  HelpCircle,
  X,
  User,
  GraduationCap,
  Shield,
  Briefcase,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    loginAsStudent,
    registerStudent,
    loginAsTeacher,
    loginAsAdmin,
    quickLogin,
    isLoading,
  } = useAuth();

  const [activePortal, setActivePortal] = useState<'teacher' | 'admin' | 'student'>('teacher');
  const [studentMode, setStudentMode] = useState<'signin' | 'register'>('signin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [lastEnrolledStudent, setLastEnrolledStudent] = useState<Student | null>(null);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);

  // Network and offline sync state
  const [isOnline, setIsOnline] = useState<boolean>(() => dataService.getIsOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => dataService.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Reactive classes
  const [classes, setClasses] = useState(dataService.getClasses());

  useEffect(() => {
    return dataService.subscribe(() => {
      setClasses(dataService.getClasses());
      setIsOnline(dataService.getIsOnline());
      setPendingSyncCount(dataService.getPendingSyncCount());
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await dataService.syncPendingOfflineQueue();
    setIsSyncing(false);
    if (result.synced > 0) {
      setSuccessMsg(`Synchronized ${result.synced} offline student record(s) to Cloud Firestore.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const [studentForm, setStudentForm] = useState({
    name: '',
    surname: '',
    classId: 'form-1-red',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    surname: '',
    classId: 'form-1-red',
    gender: 'Male' as 'Male' | 'Female',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (classes.length > 0) {
      if (!registerForm.classId || !classes.some((c) => c.id === registerForm.classId)) {
        setRegisterForm((prev) => ({ ...prev, classId: classes[0].id }));
      }
      if (!studentForm.classId || !classes.some((c) => c.id === studentForm.classId)) {
        setStudentForm((prev) => ({ ...prev, classId: classes[0].id }));
      }
    }
  }, [classes, registerForm.classId, studentForm.classId]);

  const [teacherForm, setTeacherForm] = useState({
    email: 'ahmed@dadaya.ac.zw',
    password: 'password123',
  });

  const [adminForm, setAdminForm] = useState({
    email: 'admin@dadaya.ac.zw',
    password: 'password123',
  });

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!studentForm.name.trim() || !studentForm.surname.trim()) {
      setErrorMsg('Please enter your first name and surname.');
      return;
    }
    if (!studentForm.password) {
      setErrorMsg('Please enter your candidate password.');
      return;
    }

    const res = await loginAsStudent({
      name: studentForm.name,
      surname: studentForm.surname,
      classId: studentForm.classId,
      password: studentForm.password,
    });

    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!registerForm.name.trim() || !registerForm.surname.trim()) {
      setErrorMsg('Please enter both student first name and surname.');
      return;
    }
    if (!registerForm.password || registerForm.password.length < 4) {
      setErrorMsg('Passcode must be at least 4 characters.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    const res = await registerStudent({
      name: registerForm.name,
      surname: registerForm.surname,
      classId: registerForm.classId,
      gender: registerForm.gender,
      password: registerForm.password,
    });

    if (res.success && res.student) {
      setEnrolledCount((prev) => prev + 1);
      setLastEnrolledStudent(res.student);
      setSuccessMsg(`Candidate ${res.student.name} ${res.student.surname} enrolled successfully!`);

      // Reset fields for the next student so the same desk PC can enroll continuously
      setRegisterForm((prev) => ({
        ...prev,
        name: '',
        surname: '',
        password: '',
        confirmPassword: '',
      }));
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!teacherForm.email.trim() || !teacherForm.password) {
      setErrorMsg('Please enter both teacher email and password.');
      return;
    }

    const res = await loginAsTeacher(teacherForm.email.trim(), teacherForm.password);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!adminForm.email.trim() || !adminForm.password) {
      setErrorMsg('Please enter administrator credentials.');
      return;
    }

    const res = await loginAsAdmin(adminForm.email.trim(), adminForm.password);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden font-sans">
      {/* 1. Real Campus Photograph Background with Rich Navy Overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/aistudio/Dadaya_High_School_Campus_b24d215d.png"
          alt="Dadaya High School Campus Building"
          className="w-full h-full object-cover object-center select-none"
        />
        {/* Navy brand gradient overlay for high contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#082B63]/80 via-[#082B63]/65 to-[#082B63]/85 backdrop-blur-[1.5px]" />
      </div>

      {/* 2. Top Header Bar */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 bg-[#082B63]/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <DadayaCrest sizeClass="w-12 h-12" inverted={true} />
          <div>
            <div className="font-sans font-black text-lg sm:text-xl text-white tracking-wide leading-tight drop-shadow-xs">
              DADAYA HIGH SCHOOL
            </div>
            <div className="text-[11px] text-blue-200 font-semibold tracking-widest uppercase">
              E-REPORT PORTAL · Education for Life
            </div>
          </div>
        </div>

        {/* Portal Switcher Tabs */}
        <nav className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setActivePortal('teacher');
              setErrorMsg(null);
            }}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activePortal === 'teacher'
                ? 'bg-white text-[#082B63] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Teacher Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setErrorMsg(null);
            }}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-white text-[#082B63] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('student');
              setErrorMsg(null);
            }}
            className={`px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activePortal === 'student'
                ? 'bg-white text-[#082B63] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Student Portal
          </button>
        </nav>
      </header>

      {/* 3. Centered White Login Card Matching Provided Design */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-7 sm:p-9 space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header matching template screenshot */}
          <div className="border-b border-slate-100 pb-3">
            <div className="text-[11px] uppercase tracking-wider text-[#1557B0] font-bold">
              {activePortal === 'teacher' && 'STAFF AUTHENTICATION'}
              {activePortal === 'admin' && 'SCHOOL ADMINISTRATION'}
              {activePortal === 'student' && 'CANDIDATE PORTAL'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#082B63] mt-0.5 tracking-tight">
              {activePortal === 'teacher' && 'Teacher Login'}
              {activePortal === 'admin' && 'Administrator Login'}
              {activePortal === 'student' && (studentMode === 'signin' ? 'Student Sign In' : 'Candidate Enrollment')}
            </h2>
          </div>

          {/* Sub-mode selector for student portal */}
          {activePortal === 'student' && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setStudentMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-lg text-center transition-all cursor-pointer ${
                  studentMode === 'signin'
                    ? 'bg-white text-[#082B63] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Candidate Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-lg text-center transition-all cursor-pointer ${
                  studentMode === 'register'
                    ? 'bg-white text-[#082B63] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Candidate Enrollment
              </button>
            </div>
          )}

          {/* Offline notice bar if offline or pending items */}
          {(!isOnline || pendingSyncCount > 0) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold block">
                    {isOnline ? 'Pending Cloud Sync' : 'Offline Mode Active'}
                  </span>
                  <span className="text-[11px] text-amber-800">
                    {isOnline
                      ? `${pendingSyncCount} enrollment(s) waiting to upload.`
                      : 'Records saved locally and will auto-sync.'}
                  </span>
                </div>
              </div>
              {isOnline && pendingSyncCount > 0 && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-2.5 py-1 bg-amber-800 text-white rounded text-[11px] font-bold hover:bg-amber-900 transition-colors shrink-0 cursor-pointer"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
            </div>
          )}

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && !lastEnrolledStudent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl font-medium">
              {successMsg}
            </div>
          )}

          {/* Official Candidate Admission Slip (Desk Confirmation) */}
          {activePortal === 'student' && studentMode === 'register' && lastEnrolledStudent && (
            <div className="border border-[#1557B0] bg-blue-50/70 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <span className="text-xs font-bold text-[#082B63] uppercase tracking-wider">
                  Official Candidate Admission Slip
                </span>
                <span className="text-[11px] font-mono text-[#1557B0] font-bold">
                  Slip #{enrolledCount}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-blue-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
                  <span className="font-bold text-[#082B63]">{lastEnrolledStudent.name} {lastEnrolledStudent.surname}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate ID</span>
                  <span className="font-mono font-bold text-[#1557B0] text-sm">{lastEnrolledStudent.id}</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Stream Allocated</span>
                  <span className="font-semibold text-slate-800">{lastEnrolledStudent.className}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600">
                Record saved to database. Form cleared for the next student.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLastEnrolledStudent(null);
                    setSuccessMsg(null);
                  }}
                  className="flex-1 py-2 px-3 bg-[#1557B0] text-white rounded-lg font-bold text-xs hover:bg-[#082B63] transition-colors text-center cursor-pointer shadow-xs"
                >
                  Enroll Next Candidate
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentForm({
                      name: lastEnrolledStudent.name,
                      surname: lastEnrolledStudent.surname,
                      classId: lastEnrolledStudent.classId,
                      password: '',
                    });
                    setStudentMode('signin');
                    setLastEnrolledStudent(null);
                    setSuccessMsg(null);
                  }}
                  className="py-2 px-3 border border-slate-300 text-slate-800 rounded-lg font-semibold text-xs hover:bg-white transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* FORM 1: Teacher Login matching image_217f2088.png */}
          {activePortal === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  TEACHER EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="ahmed@dadaya.ac.zw"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-semibold text-[#1557B0] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    className="w-full pl-4 pr-11 py-3 text-sm rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Faculty Portal'}
              </button>

              {/* Quick Faculty Sign-In matching image_217f2088.png */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                  QUICK FACULTY SIGN-IN
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => quickLogin('teacher', 'tch-ahmed')}
                    className="py-2 px-3 bg-blue-50/80 hover:bg-blue-100 text-[#1557B0] rounded-xl text-xs font-bold transition-colors text-center cursor-pointer border border-blue-100"
                  >
                    Mr. Ahmed (Maths)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('teacher', 'tch-moyo')}
                    className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer border border-slate-200"
                  >
                    Mr. Moyo (Sciences)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* FORM 2: Administrator Login */}
          {activePortal === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ADMINISTRATOR EMAIL
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@dadaya.ac.zw"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#082B63] focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-semibold text-[#1557B0] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full pl-4 pr-11 py-3 text-sm rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#082B63] focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-[#082B63] hover:bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? 'Verifying Admin Privileges...' : 'Sign In as Administrator'}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => quickLogin('admin')}
                  className="text-xs font-bold text-[#1557B0] hover:underline cursor-pointer"
                >
                  1-Click Principal / Admin Preview Access
                </button>
              </div>
            </form>
          )}

          {/* FORM 3A: Student Sign In */}
          {activePortal === 'student' && studentMode === 'signin' && (
            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tendai"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Surname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shumba"
                    value={studentForm.surname}
                    onChange={(e) => setStudentForm({ ...studentForm, surname: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Class Stream
                </label>
                <select
                  value={studentForm.classId}
                  onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.formLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Candidate Passcode
                  </label>
                  <span className="text-[11px] text-slate-400">Default: password123</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? 'Loading Report...' : 'Sign In to Report Card'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => quickLogin('student', 'DHS001')}
                  className="text-xs font-bold text-[#1557B0] hover:underline cursor-pointer"
                >
                  Quick Student Preview (Tendai Shumba - DHS001)
                </button>
              </div>
            </form>
          )}

          {/* FORM 3B: Student Desk Registration (Continuous Single-PC) */}
          {activePortal === 'student' && studentMode === 'register' && (
            <form onSubmit={handleStudentRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nyasha"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Surname <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Munda"
                    value={registerForm.surname}
                    onChange={(e) => setRegisterForm({ ...registerForm, surname: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Class Stream <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={registerForm.classId}
                    onChange={(e) => setRegisterForm({ ...registerForm, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.formLevel})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={registerForm.gender}
                    onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Passcode <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 4 chars"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat passcode"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-2xl font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {isLoading
                  ? 'Processing Enrollment...'
                  : isOnline
                  ? 'Enroll Candidate'
                  : 'Enroll Candidate (Offline)'}
              </button>

              <div className="text-[11px] text-slate-500 text-center leading-normal">
                Continuous Single-PC Desk: Submissions synchronize directly to Cloud Firestore or local offline queue.
              </div>
            </form>
          )}
        </div>
      </main>

      {/* 4. Subtle Clean Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-white/80 font-medium tracking-wide drop-shadow-md">
        © 2026 Dadaya High School • Education for Life • Imfundo Yempilo • Dzidzo Youpenyu
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-[#082B63] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1557B0]" />
                Password Reset Support
              </h4>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 mt-3 space-y-2 leading-relaxed">
              <p>
                For security reasons, teacher and administrator passwords are reset by the Dadaya High School IT administration department.
              </p>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[#082B63]">
                <p className="font-bold">Contact School IT Registrar:</p>
                <p className="mt-1">Email: <span className="font-mono">admin@dadaya.ac.zw</span></p>
                <p>Phone: +263 51 2234 / 2235</p>
                <p className="text-[11px] text-slate-500 mt-1">Hours: Mon–Fri, 08:00 – 16:30</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="px-4 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginView;
