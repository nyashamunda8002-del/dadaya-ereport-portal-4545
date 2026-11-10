import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import dataService from '../services/dataService';

interface NavbarProps {
  onNavigateHome?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, onToggleMobileMenu }) => {
  const { currentUser, role, logout } = useAuth();
  const [, setIsOnline] = useState<boolean>(() => dataService.getIsOnline());
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => {
      setIsOnline(dataService.getIsOnline());
      setRefreshCount((c) => c + 1);
    });
  }, []);

  return (
    <header className="no-print bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Left: Dadaya High School & E-REPORT Portal Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-[#082B63] hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className="flex flex-col cursor-pointer select-none group min-w-0"
          >
            <div className="flex items-baseline gap-2 sm:gap-3">
              <span className="text-base sm:text-2xl font-black tracking-tight text-[#082B63] truncate">
                Dadaya High School
              </span>
              <span className="hidden md:inline-block text-slate-300">|</span>
              <span className="hidden md:inline-block text-xs sm:text-sm text-slate-400 font-medium italic">
                Education for Life • Imfundo Yempilo
              </span>
            </div>
            <span className="text-[10px] sm:text-sm font-black tracking-wide text-[#1557B0] uppercase leading-tight">
              E-REPORT Portal
            </span>
          </div>
        </div>

        {/* Right: Active User Identity & Direct Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex items-center bg-[#082B63] text-white rounded-full py-1 sm:py-1.5 pl-1.5 sm:pl-2 pr-3 sm:pr-4 shadow-md shadow-blue-950/15 border border-[#1557B0]/40">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1557B0] ring-2 ring-white/70 overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col ml-2 text-left min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white leading-tight max-w-[110px] sm:max-w-[200px] truncate">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                    {role === 'admin' ? 'Administrator' : role === 'student' ? 'Student' : 'Faculty'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-full text-xs font-bold border border-slate-200/90 hover:border-rose-200 shadow-xs transition-all cursor-pointer active:scale-95 group"
                title="Sign out of portal"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
