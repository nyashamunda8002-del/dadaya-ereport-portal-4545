import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DadayaLogo } from './DadayaLogo';
import {
  Bell,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Mail,
  Home,
  CheckCircle2,
  ChevronDown,
  Shield,
  GraduationCap,
  Briefcase,
  X,
  Wifi,
  WifiOff,
} from 'lucide-react';
import dataService from '../services/dataService';

interface NavbarProps {
  onNavigateHome?: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome }) => {
  const { currentUser, role, logout, quickLogin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; message: string } | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => dataService.getIsOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => dataService.getPendingSyncCount());

  useEffect(() => {
    return dataService.subscribe(() => {
      setIsOnline(dataService.getIsOnline());
      setPendingSyncCount(dataService.getPendingSyncCount());
    });
  }, []);

  const recentLogs = dataService.getActivityLogs(6);

  return (
    <header className="no-print bg-[#064e3b] text-white border-b border-emerald-800/80 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: School Brand & Offline Indicator */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center cursor-pointer select-none group"
            onClick={onNavigateHome}
          >
            <DadayaLogo size="md" inverted={true} />
          </div>

          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
              isOnline
                ? 'bg-[#021810] border-emerald-800 text-emerald-300'
                : 'bg-amber-950/80 border-amber-800 text-amber-200'
            }`}
          >
            {isOnline ? (
              <span>Online · Cloud Synced</span>
            ) : (
              <span>Offline · Local Queue {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}</span>
            )}
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {currentUser ? (
            <>
              {/* Role Switcher Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#021810] hover:bg-emerald-900/60 border border-emerald-800/80 text-xs font-medium text-emerald-200 transition-colors"
                  title="Switch between Teacher, Student, and Administrator test accounts"
                >
                  <span className="text-stone-400">Portal:</span>
                  <span className="capitalize text-white font-semibold">{role}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-emerald-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="text-[11px] font-semibold text-emerald-300 uppercase px-2 py-1 tracking-wider border-b border-slate-800">
                      Switch Active Portal
                    </div>
                    <button
                      onClick={() => {
                        quickLogin('student');
                        setShowRoleSwitcher(false);
                        onNavigateHome?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-lg text-left text-xs text-slate-200 hover:bg-emerald-900/60 transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">Tinashe Shumba</div>
                        <div className="text-[10px] text-slate-400">Student • Lower Six Sciences</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        quickLogin('teacher', 'tch-moyo');
                        setShowRoleSwitcher(false);
                        onNavigateHome?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-emerald-900/60 transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">Mr. Moyo</div>
                        <div className="text-[10px] text-slate-400">Teacher • Maths & Physics</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        quickLogin('admin');
                        setShowRoleSwitcher(false);
                        onNavigateHome?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-emerald-900/60 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold text-white">Administrator</div>
                        <div className="text-[10px] text-slate-400">Headmaster / Admin Office</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile Identity */}
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-emerald-800/60">
                <div className="w-8 h-8 rounded bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.displayName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-emerald-300/80 capitalize">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Notification Activity */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded text-stone-300 hover:text-white hover:bg-emerald-900/60 transition-colors"
                  aria-label="System Activity"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {recentLogs.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in">
                    <div className="bg-[#064e3b] text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-300" />
                        <span className="font-bold text-sm">System Activity & Alerts</span>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-emerald-200 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
                      {recentLogs.map((log) => (
                        <div key={log.id} className="p-3 hover:bg-emerald-50/50 transition-colors text-xs">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">{log.action}</p>
                              {log.details && (
                                <p className="text-slate-500 text-[11px] mt-0.5">{log.details}</p>
                              )}
                              <p className="text-[10px] text-slate-400 mt-1">{log.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-red-900/70 hover:text-red-100 border border-emerald-800 text-xs font-semibold text-emerald-100 transition-all ml-1 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-6 text-xs sm:text-sm font-medium text-emerald-100">
              <button
                onClick={onNavigateHome}
                className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setInfoModal({
                    title: 'Dadaya High School IT Helpdesk',
                    message: 'Contact support@dadaya.ac.zw or telephone +263 51 2234 / 2235.',
                  })
                }
                className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setInfoModal({
                    title: 'Contact Dadaya High School',
                    message:
                      'Dadaya Mission, P. Bag 650, Zvishavane, Zimbabwe. Email: info@dadaya.ac.zw | Phone: +263 51 2234',
                  })
                }
                className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Contact</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Dialog */}
      {infoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-emerald-900 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-[#064e3b]">{infoModal.title}</h4>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">{infoModal.message}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-4 py-1.5 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
