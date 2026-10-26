import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DadayaCrest, DadayaLogo } from '../components/DadayaLogo';
import dataService from '../services/dataService';
import { Student } from '../types';
import {
  FileText,
  User,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  UserPlus,
  Wifi,
  WifiOff,
  RefreshCw,
  Mail,
  Shield,
  BookOpen,
  Building2,
  Calendar,
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
      setSuccessMsg(`Synchronized ${result.synced} offline student record(s) to Cloud Firestore.`);
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
      setErrorMsg('Please enter the candidate first name and surname.');
      return;
    }
    if (!registerForm.classId) {
      setErrorMsg('Please select an academic class stream.');
      return;
    }
    if (!registerForm.password || registerForm.password.length < 4) {
      setErrorMsg('Password must contain at least 4 characters.');
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
      password: registerForm.password,
      gender: registerForm.gender,
      autoLogin: false, // Consecutive queue: do not enter portal, stay on enrollment page
    });

    if (res.success && res.student) {
      const student = res.student;
      setLastEnrolledStudent(student);
      setEnrolledCount((prev) => prev + 1);
      setSuccessMsg(
        isOnline
          ? `Candidate ${student.name} ${student.surname} (${student.id}) enrolled into ${student.className}. Record saved to institutional database.`
          : `Candidate ${student.name} ${student.surname} (${student.id}) enrolled in offline mode. Saved locally and queued for cloud sync.`
      );
      // Reset form so next candidate can immediately be enrolled
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
    <div className="min-h-screen flex flex-col bg-[#052319] text-stone-100 selection:bg-emerald-700 selection:text-white">
      {/* 1. Header Bar: Formal Institutional Identity */}
      <header className="border-b border-emerald-900/60 bg-[#031d14]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <DadayaCrest sizeClass="w-12 h-12" inverted={true} />
            <div>
              <div className="font-serif-school font-bold text-base sm:text-lg text-white tracking-wider leading-tight">
                DADAYA HIGH SCHOOL
              </div>
              <div className="text-[11px] text-emerald-300/80 font-medium tracking-widest uppercase">
                Academic Registrar & Continuous Assessment Portal
              </div>
            </div>
          </div>

          {/* Portal Switcher Tabs */}
          <nav className="flex items-center border border-emerald-800/80 rounded-lg p-1 bg-[#021810]">
            <button
              type="button"
              onClick={() => {
                setActivePortal('student');
                setErrorMsg(null);
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activePortal === 'student'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
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
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activePortal === 'teacher'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
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
              className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activePortal === 'admin'
                  ? 'bg-amber-900/90 text-amber-100 shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Administration
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Main Body Split */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Academic Institution Prospectus & Streams */}
        <section className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 tracking-wider uppercase">
              <span>Zvishavane, Zimbabwe</span>
              <span aria-hidden="true">·</span>
              <span>Founded 1934</span>
              <span aria-hidden="true">·</span>
              <span>Motto: Alere Flammam</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {activePortal === 'student' && 'Student Performance & Enrollment Registry'}
              {activePortal === 'teacher' && 'Academic Staff & Continuous Assessment'}
              {activePortal === 'admin' && 'Institutional Governance & Records'}
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              Welcome to the official electronic records system of Dadaya High School. Candidates, academic staff, and administration can verify term assessments, continuous performance metrics, and official ZIMSEC candidate standing.
            </p>
          </div>

          {/* Academic Streams Overview for Lower Six */}
          <div className="border border-emerald-800/70 rounded-xl bg-[#031d14]/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Lower Six Academic Disciplines (Advanced Level)</span>
              </div>
              <span className="text-[11px] text-emerald-300 font-mono">Form 5 Curriculum</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-[#021810]/70 border border-emerald-900/80 rounded-lg p-3 space-y-1.5">
                <div className="font-bold text-emerald-200">Sciences Stream</div>
                <div className="text-[11px] text-stone-300 leading-normal">
                  Pure Mathematics, Physics, Chemistry, Biology & Computer Science.
                </div>
              </div>

              <div className="bg-[#021810]/70 border border-emerald-900/80 rounded-lg p-3 space-y-1.5">
                <div className="font-bold text-emerald-200">Commercials Stream</div>
                <div className="text-[11px] text-stone-300 leading-normal">
                  Accounting, Economics, Business Studies & Statistics.
                </div>
              </div>

              <div className="bg-[#021810]/70 border border-emerald-900/80 rounded-lg p-3 space-y-1.5">
                <div className="font-bold text-emerald-200">Arts Stream</div>
                <div className="text-[11px] text-stone-300 leading-normal">
                  Literature in English, History, Divinity & Geography.
                </div>
              </div>
            </div>
          </div>

          {/* Operational Station Notice */}
          <div className="border border-emerald-900 bg-[#02160f]/60 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between text-stone-300">
              <span className="font-semibold text-white">Desk Registration Station</span>
              <span className="text-stone-400 font-mono">Sequential Mode Active</span>
            </div>
            <p className="text-[12px] text-stone-300 leading-relaxed">
              This terminal is optimized for continuous candidate enrollment. Submitting an enrollment stores the student record directly to the database and preserves the active screen so subsequent candidates can register without interruption.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-300/90 border-t border-emerald-900/60">
              <span>{isOnline ? 'Network: Online · Cloud Firestore connected' : 'Network: Offline · Local station storage active'}</span>
              {pendingSyncCount > 0 && <span>{pendingSyncCount} record(s) queued for sync</span>}
            </div>
          </div>
        </section>

        {/* Right Column: Formal Institutional Form Card */}
        <section className="lg:col-span-5">
          <div className="bg-stone-50 text-stone-900 rounded-xl border border-stone-200 shadow-xl p-6 sm:p-7 space-y-5">
            {/* Header of the Card */}
            <div className="border-b border-stone-200 pb-3">
              <div className="text-xs uppercase tracking-wider text-stone-500 font-bold">
                {activePortal === 'student' && 'Candidate Portal'}
                {activePortal === 'teacher' && 'Academic Faculty'}
                {activePortal === 'admin' && 'School Administration'}
              </div>
              <h2 className="text-xl font-bold text-[#064e3b] mt-0.5">
                {activePortal === 'student' && (studentMode === 'signin' ? 'Sign In to Report Card' : 'Enroll New Candidate')}
                {activePortal === 'teacher' && 'Staff Authentication'}
                {activePortal === 'admin' && 'Administrative Console'}
              </h2>
            </div>

            {/* Sub-mode selector for student portal */}
            {activePortal === 'student' && (
              <div className="grid grid-cols-2 p-1 bg-stone-200/70 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-1.5 rounded-md text-center transition-colors ${
                    studentMode === 'signin'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
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
                  className={`py-1.5 rounded-md text-center transition-colors ${
                    studentMode === 'register'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Candidate Enrollment
                </button>
              </div>
            )}

            {/* Offline notice bar if offline or pending items */}
            {(!isOnline || pendingSyncCount > 0) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold block">
                      {isOnline ? 'Pending Cloud Sync' : 'Offline Mode Active'}
                    </span>
                    <span className="text-[11px] text-amber-800">
                      {isOnline
                        ? `${pendingSyncCount} enrollment(s) waiting to upload to cloud.`
                        : 'Enrollments are saved on this computer and auto-sync when connected.'}
                    </span>
                  </div>
                </div>
                {isOnline && pendingSyncCount > 0 && (
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-2.5 py-1 bg-amber-800 text-white rounded text-[11px] font-bold hover:bg-amber-900 transition-colors shrink-0"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                )}
              </div>
            )}

            {/* Feedback Banners */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span className="flex-1">{errorMsg}</span>
              </div>
            )}

            {successMsg && !lastEnrolledStudent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-lg">
                {successMsg}
              </div>
            )}

            {/* Official Candidate Admission Slip (Single-PC Desk Confirmation) */}
            {activePortal === 'student' && studentMode === 'register' && lastEnrolledStudent && (
              <div className="border border-emerald-600 bg-emerald-50/60 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Official Candidate Admission Slip
                  </span>
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                    Slip #{enrolledCount}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded border border-emerald-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Candidate Name</span>
                    <span className="font-bold text-stone-900">{lastEnrolledStudent.name} {lastEnrolledStudent.surname}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Candidate ID</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">{lastEnrolledStudent.id}</span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Stream Allocated</span>
                    <span className="font-semibold text-stone-800">{lastEnrolledStudent.className}</span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-900">
                  Record successfully added to the school database. The form below has been cleared for the next student.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLastEnrolledStudent(null);
                      setSuccessMsg(null);
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#064e3b] text-white rounded font-bold text-xs hover:bg-emerald-800 transition-colors text-center"
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
                    className="py-1.5 px-3 border border-stone-300 text-stone-800 rounded font-semibold text-xs hover:bg-white transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* FORM 1A: Student Sign In */}
            {activePortal === 'student' && studentMode === 'signin' && (
              <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farai"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Surname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mutasa"
                    value={studentForm.surname}
                    onChange={(e) => setStudentForm({ ...studentForm, surname: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Academic Class
                  </label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 font-medium"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.stream})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Candidate Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      className="w-full pl-3 pr-9 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#064e3b] hover:bg-emerald-800 text-white rounded font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {isLoading ? 'Verifying Candidate...' : 'Sign In to Student Portal'}
                </button>

                <div className="pt-2 text-center text-xs text-stone-500">
                  New candidate seeking admission?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('register');
                      setErrorMsg(null);
                    }}
                    className="text-emerald-800 font-semibold hover:underline"
                  >
                    Enroll here
                  </button>
                </div>
              </form>
            )}

            {/* FORM 1B: Student Enrollment (Single-PC Desk Queue) */}
            {activePortal === 'student' && studentMode === 'register' && (
              <form onSubmit={handleStudentRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      First Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tendai"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Surname <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Moyo"
                      value={registerForm.surname}
                      onChange={(e) => setRegisterForm({ ...registerForm, surname: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Academic Class Stream <span className="text-rose-600">*</span>
                  </label>
                  <select
                    required
                    value={registerForm.classId}
                    onChange={(e) => setRegisterForm({ ...registerForm, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 font-medium text-stone-900"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.stream})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Candidate ID
                    </label>
                    <div className="px-3 py-2 text-xs rounded border border-stone-300 bg-stone-100 font-mono text-stone-600">
                      Auto-generated (DHS)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Passcode <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 4 characters"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Confirm Passcode <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#064e3b] hover:bg-emerald-800 text-white rounded font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {isLoading
                    ? 'Processing Enrollment...'
                    : isOnline
                    ? 'Enroll Candidate'
                    : 'Enroll Candidate (Offline)'}
                </button>

                <div className="text-[11px] text-stone-500 text-center leading-normal">
                  Desk Station: Submitting creates the student profile and keeps this registration desk open for the next candidate.
                </div>
              </form>
            )}

            {/* FORM 2: Teacher Login */}
            {activePortal === 'teacher' && (
              <form onSubmit={handleTeacherSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Staff Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. moyo@dadaya.ac.zw"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter staff password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-[#064e3b] hover:bg-emerald-800 text-white rounded font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Faculty Portal'}
                </button>
              </form>
            )}

            {/* FORM 3: Admin Login */}
            {activePortal === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@dadaya.ac.zw"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Security Passkey
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter admin passkey"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Access Administration Console'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* 3. Understated Footer */}
      <footer className="border-t border-emerald-900/60 bg-[#021810] text-stone-400 py-4 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>© 2026 Dadaya High School</span>
            <span aria-hidden="true">·</span>
            <span>Ministry of Primary & Secondary Education, Zimbabwe</span>
          </div>

          {/* Quiet developer & staff test shortcuts */}
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span className="text-stone-500">Quick Access:</span>
            <button
              type="button"
              onClick={() => quickLogin('student', 'DHS001')}
              className="hover:text-emerald-300 transition-colors"
            >
              Student
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => quickLogin('teacher', 'tch-moyo')}
              className="hover:text-emerald-300 transition-colors"
            >
              Teacher (Mr. Moyo)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => quickLogin('admin')}
              className="hover:text-amber-300 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginView;
