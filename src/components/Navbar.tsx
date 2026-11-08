import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  GraduationCap,
  Briefcase,
  Shield,
  ChevronDown,
  X,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import dataService from '../services/dataService';

interface NavbarProps {
  onNavigateHome?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onToggleMobileMenu }) => {
  const { currentUser, role, quickLogin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => dataService.getIsOnline());
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => {
      setIsOnline(dataService.getIsOnline());
      setRefreshCount((c) => c + 1);
    });
  }, []);

  const recentLogs = dataService.getActivityLogs(6);

  const getPortalLabel = () => {
    if (role === 'admin') return 'Admin Portal';
    if (role === 'student') return 'Student Portal';
    return 'Teacher Portal';
  };

  const getUserPhotoUrl = () => {
    // Return high quality teacher avatar portrait
    if (role === 'teacher') {
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
    }
    return '';
  };

  return (
    <header className="no-print bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Dadaya High School & E-REPORT Portal Branding */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-[#082B63] hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className="flex flex-col cursor-pointer select-none group"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#082B63]">
                Dadaya High School
              </span>
              <span className="hidden md:inline-block text-slate-300">|</span>
              <span className="hidden md:inline-block text-xs sm:text-sm text-slate-400 font-medium italic">
                Education for Life • Imfundo Yempilo
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black tracking-wide text-[#1557B0] uppercase">
              E-REPORT Portal
            </span>
          </div>
        </div>

        {/* Right: Curved Portal Pill Island with status & profile */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center bg-[#082B63] text-white rounded-full py-1.5 pl-4 pr-1.5 shadow-md shadow-blue-950/15 border border-[#1557B0]/40">
              {/* Portal Role Badge & Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center gap-2 pr-3 border-r border-blue-400/30 text-xs font-semibold text-white hover:text-blue-200 transition-colors cursor-pointer"
                  title="Switch Active Portal / Test Accounts"
                >
                  <GraduationCap className="w-4 h-4 text-blue-300" />
                  <span className="hidden sm:inline font-medium">{getPortalLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                </button>

                {showRoleSwitcher && (
                  <div className="absolute left-0 sm:right-0 mt-3 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 font-sans">
                    <div className="text-[11px] font-bold text-slate-400 uppercase px-3 py-1.5 tracking-wider border-b border-slate-100">
                      Switch Active Portal
                    </div>

                    <button
                      onClick={() => {
                        quickLogin('teacher', 'tch-moyo');
                        setShowRoleSwitcher(false);
                        onNavigateHome?.();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-[#1557B0] transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-[#1557B0]" />
                      <div>
                        <div className="font-bold text-slate-900">Mr. Moyo</div>
                        <div className="text-[10px] text-slate-500">Teacher • Pure Sciences</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        quickLogin('teacher', 'tch-sibanda');
                        setShowRoleSwitcher(false);
                        onNavigateHome?.();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-[#1557B0] transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-[#1557B0]" />
                      <div>
                        <div className="font-bold text-slate-900">Mrs. Sibanda</div>
                        <div className="text-[10px] text-slate-500">Teacher • Arts & Humanities</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        quickLogin('admin');
                        setShowRoleSwitcher(false);
                        onNavigateHome?.();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-[#1557B0] transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-bold text-slate-900">Administrator</div>
                        <div className="text-[10px] text-slate-500">Principal / Headmaster Office</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        quickLogin('student');
                        setShowRoleSwitcher(false);
                        onNavigateHome?.();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-[#1557B0] transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-bold text-slate-900">Tinashe Shumba</div>
                        <div className="text-[10px] text-slate-500">Student • Candidate Portal</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 pl-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 ring-2 ring-white/80 overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {currentUser.displayName ? currentUser.displayName.charAt(0) : 'M'}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-white pr-2">
                  {currentUser.displayName}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
