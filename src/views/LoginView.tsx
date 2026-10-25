import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DadayaCrest } from '../components/DadayaLogo';
import dataService from '../services/dataService';
import { Student } from '../types';
import {
  FileText,
  TrendingUp,
  Edit3,
  FileSpreadsheet,
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Shield,
  AlertCircle,
  Sparkles,
  UserPlus,
  Phone,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
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

  const [activePortal, setActivePortal] = useState<'student' | 'teacher' | 'admin'>('student');
  const [studentMode, setStudentMode] = useState<'signin' | 'register'>('signin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [lastEnrolledStudent, setLastEnrolledStudent] = useState<Student | null>(null);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);

  // Network and offline sync state
  const [isOnline, setIsOnline] = useState<boolean>(() => dataService.getIsOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => dataService.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Reactive classes and offline sync counter
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
      setSuccessMsg(`Successfully uploaded ${result.synced} offline student record(s) to Cloud Firestore!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const [studentForm, setStudentForm] = useState({
    name: '',
    surname: '',
    classId: 'lower-six-sciences',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    surname: '',
    classId: 'lower-six-sciences',
    gender: 'Male' as 'Male' | 'Female',
    password: '',
    confirmPassword: '',
  });

  // Keep classId in sync with available classes if empty
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
    email: 'moyo@dadaya.ac.zw',
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
      setErrorMsg('Please enter your First Name and Surname.');
      return;
    }
    if (!studentForm.password) {
      setErrorMsg('Please enter your password.');
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
      setErrorMsg('Please enter student First Name and Surname.');
      return;
    }
    if (!registerForm.classId) {
      setErrorMsg('Please choose a class to enroll in.');
      return;
    }
    if (!registerForm.password || registerForm.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    const res = await registerStudent({
      name: registerForm.name,
      surname: registerForm.surname,
      classId: registerForm.classId,
      password: registerForm.password,
      gender: registerForm.gender,
      autoLogin: false, // Single-PC mode: record saved to database without entering portal
    });

    if (res.success && res.student) {
      const student = res.student;
      setLastEnrolledStudent(student);
      setEnrolledCount((prev) => prev + 1);
      setSuccessMsg(
        isOnline
          ? `Student "${student.name} ${student.surname}" (${student.id}) enrolled successfully in ${student.className}! Ready for next student.`
          : `Student "${student.name} ${student.surname}" (${student.id}) enrolled in Offline Mode! Stored on this PC & queued for Cloud Firestore sync.`
      );
      // Clear form immediately so the next student can type their info
      setRegisterForm((prev) => ({
        name: '',
        surname: '',
        classId: prev.classId,
        gender: 'Male',
        password: '',
        confirmPassword: '',
      }));
    } else if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };


  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await loginAsTeacher(teacherForm.email, teacherForm.password);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await loginAsAdmin(adminForm.email, adminForm.password);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between bg-emerald-950 relative overflow-hidden select-none">
      {/* Background Ambience in Green */}
      <div className="absolute inset-0 bg-radial from-emerald-900/50 via-[#032317] to-black pointer-events-none" />

      {/* Top Portal Switcher Bar */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pt-4 sm:pt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#064e3b]/85 backdrop-blur-md p-1 rounded-xl border border-emerald-700/60 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setActivePortal('student');
              setErrorMsg(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activePortal === 'student'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            Student Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('teacher');
              setErrorMsg(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activePortal === 'teacher'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-100 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            Teacher Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setErrorMsg(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activePortal === 'admin'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-200 hover:text-white hover:bg-amber-950/40'
            }`}
          >
            Admin Portal
          </button>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-300 font-medium hidden sm:inline">1-Click Test:</span>
          <button
            type="button"
            onClick={() => quickLogin('student', 'DHS001')}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 hover:text-white transition-colors"
          >
            Student (Tinashe)
          </button>
          <button
            type="button"
            onClick={() => quickLogin('teacher', 'tch-moyo')}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 hover:text-white transition-colors"
          >
            Teacher (Mr. Moyo)
          </button>
          <button
            type="button"
            onClick={() => quickLogin('admin')}
            className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-amber-300 hover:text-white transition-colors"
          >
            Administrator
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Side: Hero Info */}
        <div className="lg:col-span-7 text-white space-y-6">
          <div className="flex items-center gap-3">
            <DadayaCrest sizeClass="w-12 h-12" inverted={true} />
            <div className="inline-block text-xs uppercase tracking-widest text-emerald-300 font-bold bg-emerald-950/70 border border-emerald-700/80 px-3 py-1.5 rounded-full">
              Dadaya High School • E-Report Portal
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {activePortal === 'student' && (
              <>
                <span className="text-emerald-400">Student</span> E-Report Portal
              </>
            )}
            {activePortal === 'teacher' && (
              <>
                <span className="text-emerald-400">Teacher</span> E-Report Portal
              </>
            )}
            {activePortal === 'admin' && (
              <>
                <span className="text-amber-400">Administrator</span> Control Center
              </>
            )}
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl leading-relaxed">
            {activePortal === 'student' &&
              'Access your academic results, track your progress, inspect report cards and build a brighter future with Dadaya High School.'}
            {activePortal === 'teacher' &&
              'Manage your classes, feed marks, monitor academic trends, generate official student report cards and support student excellence.'}
            {activePortal === 'admin' &&
              'Complete institutional control over student rosters, teacher credentials, class streams, grading boundaries, and academic audits.'}
          </p>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl pt-2">
            {activePortal === 'student' ? (
              <>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-600/40 text-emerald-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">View Results</h4>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Check your latest results, report cards and academic records.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-600/40 text-emerald-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Track Academic Progress</h4>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Monitor your performance, grades, and subject achievements.
                    </p>
                  </div>
                </div>
              </>
            ) : activePortal === 'teacher' ? (
              <>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-600/40 text-emerald-300">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Record Marks</h4>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Enter and manage student marks easily with real-time validation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-600/40 text-emerald-300">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">View Reports</h4>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Access class rosters and generate official term report cards.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 backdrop-blur-xs">
                  <div className="p-2.5 rounded-lg bg-amber-600/30 text-amber-300">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">System Governance</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Full access to student, teacher, and curricular databases.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-800/40 backdrop-blur-xs">
                  <div className="p-2.5 rounded-lg bg-amber-600/30 text-amber-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Curriculum & Terms</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Configure grading boundaries, term dates, and batch approvals.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cursive Tagline */}
          <div className="pt-4 flex items-center justify-between">
            <div className="font-cursive-tagline text-2xl sm:text-3xl text-emerald-300 italic font-medium">
              Your Progress Our Priority
            </div>
          </div>
        </div>

        {/* Right Side: Elevated Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-100 relative">
            <div className="flex flex-col items-center text-center pb-4">
              <DadayaCrest sizeClass="w-14 h-14" />
              <h2 className="text-xl sm:text-2xl font-black text-[#064e3b] mt-2">
                {activePortal === 'student' &&
                  (studentMode === 'signin' ? 'Student Login' : 'Class Enrollment & Registration')}
                {activePortal === 'teacher' && 'Teacher Login'}
                {activePortal === 'admin' && 'Administrator Login'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activePortal === 'student' &&
                  (studentMode === 'signin'
                    ? 'Enter your credentials to access your academic e-report.'
                    : 'Enter student details to enroll into any class (including newly created classes).')}
                {activePortal === 'teacher' && 'Sign in to your teacher account.'}
                {activePortal === 'admin' && 'Enter administrative credentials.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMsg}</span>
                  {activePortal === 'student' && studentMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentMode('register');
                        setErrorMsg(null);
                      }}
                      className="block mt-1 font-bold text-emerald-800 underline hover:text-emerald-950"
                    >
                      Click here to enroll this student into an added class now →
                    </button>
                  )}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Sub-mode toggle for Student Portal */}
            {activePortal === 'student' && (
              <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    studentMode === 'signin'
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Existing Student Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    studentMode === 'register'
                      ? 'bg-[#064e3b] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Enroll in Class</span>
                </button>
              </div>
            )}

            {/* 1A. STUDENT SIGN IN FORM */}
            {activePortal === 'student' && studentMode === 'signin' && (
              <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Surname</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your surname"
                      value={studentForm.surname}
                      onChange={(e) => setStudentForm({ ...studentForm, surname: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <select
                      value={studentForm.classId}
                      onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    >
                      <option value="">Select your class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Student...' : 'Log In'}</span>
                </button>

                {/* Helpful Callout for newly added classes */}
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-emerald-950 block">Joining a newly added class?</span>
                    <span className="text-[11px] text-emerald-700">Enter your student details to register immediately.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('register');
                      setErrorMsg(null);
                    }}
                    className="shrink-0 px-2.5 py-1.5 bg-[#064e3b] hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-center pt-1 text-xs text-slate-500">
                  <span>Need help? </span>
                  <a
                    href="#admin"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePortal('admin');
                    }}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Contact your school administrator.
                  </a>
                </div>
              </form>
            )}

            {/* 1B. STUDENT ENROLLMENT / REGISTRATION FORM FOR ADDED CLASSES */}
            {activePortal === 'student' && studentMode === 'register' && (
              <form onSubmit={handleStudentRegister} className="space-y-3">
                {/* Offline / Online Network Status Bar */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                    isOnline
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isOnline ? (
                      <div className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </div>
                    ) : (
                      <div className="p-1 bg-amber-200/80 rounded-md text-amber-900 shrink-0">
                        <WifiOff className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{isOnline ? 'Online • Cloud Firestore Live' : 'Offline Mode Active'}</span>
                        {!isOnline && (
                          <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-extrabold uppercase rounded">
                            Offline Ready
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] opacity-80 block truncate">
                        {isOnline
                          ? pendingSyncCount > 0
                            ? `${pendingSyncCount} offline enrollment(s) pending sync`
                            : 'Single-PC enrollment active. Instant cloud auto-sync.'
                          : 'You can enroll students without internet! Records save to this PC & auto-sync when online.'}
                      </span>
                    </div>
                  </div>

                  {pendingSyncCount > 0 && isOnline && (
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="shrink-0 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : `Sync (${pendingSyncCount})`}</span>
                    </button>
                  )}
                </div>

                {/* Last Enrolled Student Receipt Card (Single-PC Desk Confirmation) */}
                {lastEnrolledStudent && (
                  <div className="p-3.5 bg-emerald-50/95 border-2 border-emerald-500 rounded-2xl shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
                      <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Enrolled Successfully!</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                        #{enrolledCount} on this PC
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student</span>
                        <span className="font-bold text-slate-900 text-xs">
                          {lastEnrolledStudent.name} {lastEnrolledStudent.surname}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned ID</span>
                        <span className="font-mono font-bold text-emerald-700 text-xs">
                          {lastEnrolledStudent.id}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrolled Class</span>
                        <span className="font-semibold text-slate-700 text-xs">
                          {lastEnrolledStudent.className}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[11px] text-emerald-800 font-medium">
                        ✨ Form cleared below for next student.
                      </span>
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
                        }}
                        className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-all shrink-0"
                      >
                        <LogIn className="w-3 h-3 text-emerald-700" />
                        <span>Sign In Now</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Farai"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mutasa"
                        value={registerForm.surname}
                        onChange={(e) => setRegisterForm({ ...registerForm, surname: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      {classes.length} classes available
                    </span>
                  </div>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      required
                      value={registerForm.classId}
                      onChange={(e) => setRegisterForm({ ...registerForm, classId: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.formLevel} • {c.stream})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Student ID</label>
                      <span className="text-[10px] text-emerald-700 font-medium">Auto-assigned</span>
                    </div>
                    <div className="px-3 py-2 text-xs rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-900 font-mono font-medium">
                      Generated on enrollment
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 4 characters"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isLoading
                      ? 'Saving Student Record...'
                      : isOnline
                      ? 'Complete Enrollment'
                      : 'Complete Enrollment (Offline Mode)'}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-medium text-center pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {isOnline
                      ? 'Single-PC Mode: Does not enter portal • Ready for next student'
                      : 'Works Offline: Saves on this PC without internet • Syncs when online'}
                  </span>
                </div>



                <div className="text-center pt-1 text-xs text-slate-500">
                  <span>Already enrolled? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('signin');
                      setErrorMsg(null);
                    }}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Switch back to Sign In.
                  </button>
                </div>
              </form>
            )}

            {/* 2. TEACHER LOGIN FORM */}
            {activePortal === 'teacher' && (
              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact Dadaya High School Administration for password resets.')}
                    className="text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Signing In...' : 'Log In'}</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-semibold">OR</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePortal('student')}
                  className="w-full py-2 px-4 border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>Switch to Student Portal</span>
                </button>
              </form>
            )}

            {/* 3. ADMIN LOGIN FORM */}
            {activePortal === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  Administrative access is restricted to authorized Dadaya High School staff.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="admin@dadaya.ac.zw"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter admin password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Access...' : 'Access Admin Console'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActivePortal('student')}
                    className="text-xs text-slate-500 hover:text-emerald-700 hover:underline"
                  >
                    Return to Student Portal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer className="relative z-10 border-t border-emerald-900 bg-black/50 text-emerald-200/80 py-3 px-4 text-center text-xs flex flex-wrap items-center justify-between max-w-7xl mx-auto w-full">
        <div>© 2026 Dadaya High School. All Rights Reserved.</div>
        <div className="flex items-center gap-4 text-emerald-200/80">
          <span>Discipline • Excellence • Future</span>
          <span className="hidden sm:inline">|</span>
          <span>Official E-Report System</span>
        </div>
      </footer>
    </div>
  );
};

export default LoginView;
