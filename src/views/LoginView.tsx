import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DadayaCrest } from '../components/DadayaLogo';
import dataService from '../services/dataService';
import {
  Eye,
  EyeOff,
  AlertCircle,
  WifiOff,
  HelpCircle,
  X,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    loginAsStudent,
    loginAsTeacher,
    loginAsAdmin,
    quickLogin,
    isLoading,
  } = useAuth();

  const [activePortal, setActivePortal] = useState<'teacher' | 'admin' | 'student'>('teacher');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    schoolId: 'DHS001',
    dob: '2008-05-14',
  });

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

    if (!studentForm.schoolId.trim()) {
      setErrorMsg('Please enter your School ID (e.g. DHS001).');
      return;
    }

    if (!studentForm.dob.trim()) {
      setErrorMsg('Please enter your Date of Birth.');
      return;
    }

    const res = await loginAsStudent({
      schoolId: studentForm.schoolId.trim(),
      dob: studentForm.dob.trim(),
    });

    if (!res.success && res.error) {
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
        <nav className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 shadow-lg max-w-full">
          <button
            type="button"
            onClick={() => {
              setActivePortal('teacher');
              setErrorMsg(null);
            }}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activePortal === 'teacher'
                ? 'bg-white text-[#082B63] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Teacher
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setErrorMsg(null);
            }}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-white text-[#082B63] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePortal('student');
              setErrorMsg(null);
            }}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activePortal === 'student'
                ? 'bg-white text-[#082B63] shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Student
          </button>
        </nav>
      </header>

      {/* 3. Centered White Login Card Matching Provided Design */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-5 sm:p-9 space-y-5 sm:space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
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
              {activePortal === 'student' && 'Student Sign In'}
            </h2>
          </div>

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

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl font-medium">
              {successMsg}
            </div>
          )}

          {/* FORM 1: Teacher Login */}
          {activePortal === 'teacher' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  TEACHER EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="moyo@dadaya.ac.zw"
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

              {/* Quick Faculty Sign-In */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                  QUICK FACULTY SIGN-IN
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => quickLogin('teacher', 'tch-moyo')}
                    className="py-2 px-3 bg-blue-50/80 hover:bg-blue-100 text-[#1557B0] rounded-xl text-xs font-bold transition-colors text-center cursor-pointer border border-blue-100"
                  >
                    Mr. Moyo (Sciences)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('teacher', 'tch-sibanda')}
                    className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer border border-slate-200"
                  >
                    Mrs. Sibanda (Arts)
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

          {/* FORM 3: Student Sign In (School ID and Date of Birth) */}
          {activePortal === 'student' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  STUDENT SCHOOL ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DHS001"
                  value={studentForm.schoolId}
                  onChange={(e) => setStudentForm({ ...studentForm, schoolId: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden font-mono tracking-wider transition-all uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">Official candidate ID number (e.g. DHS001)</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  DATE OF BIRTH
                </label>
                <input
                  type="date"
                  required
                  value={studentForm.dob}
                  onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Verified with Dadaya High School admissions records</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-2xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? 'Verifying Student Record...' : 'Sign In to Student Portal'}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => quickLogin('student', 'DHS001')}
                  className="text-xs font-bold text-[#1557B0] hover:underline cursor-pointer"
                >
                  Quick Student Preview (Tendai Shumba • DHS001)
                </button>
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
