import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DadayaCrest } from './DadayaLogo';
import {
  Home,
  LayoutGrid,
  Edit3,
  FileBarChart2,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { role, logout } = useAuth();

  const getNavItems = () => {
    if (role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'classes', label: 'My Class', icon: LayoutGrid },
        { id: 'feed-marks', label: 'Feed Marks', icon: Edit3 },
        { id: 'report-cards', label: 'Reports', icon: FileBarChart2 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'student') {
      return [
        { id: 'my-results', label: 'Dashboard', icon: Home },
        { id: 'report-card', label: 'Reports', icon: Award },
        { id: 'profile', label: 'Profile', icon: GraduationCap },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    // Administrator
    return [
      { id: 'admin-dashboard', label: 'Dashboard', icon: Home },
      { id: 'admin-students', label: 'Students', icon: GraduationCap },
      { id: 'admin-teachers', label: 'Teachers', icon: Briefcase },
      { id: 'admin-classes', label: 'Classes', icon: LayoutGrid },
      { id: 'admin-subjects', label: 'Subjects', icon: BookOpen },
      { id: 'admin-marks', label: 'Feed Marks', icon: Edit3 },
      { id: 'admin-report-cards', label: 'Reports', icon: FileBarChart2 },
      { id: 'admin-settings', label: 'Settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleHelpClick = () => {
    window.location.hash = '#help';
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white text-slate-800 border-r border-slate-200/90 flex flex-col justify-between shrink-0 shadow-sm transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Block */}
          <div className="pt-6 pb-6 px-5 flex flex-col items-center text-center border-b border-slate-100 relative">
            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden absolute top-3 right-3 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sidebar menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <DadayaCrest sizeClass="w-16 h-16" />
            <h2 className="mt-2 text-base font-black tracking-wide text-[#082B63] uppercase leading-tight font-sans">
              DADAYA HIGH SCHOOL
            </h2>
            <p className="text-[11px] text-slate-400 font-medium italic mt-0.5">
              Education for Life • Imfundo Yempilo
            </p>
          </div>

          {/* Primary Navigation */}
          <div className="px-3.5 py-4 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'classes' && currentTab === 'classes') ||
                (item.id === 'dashboard' && (!currentTab || currentTab === 'dashboard'));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#1557B0] text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-600 hover:text-[#082B63] hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Help & Support */}
            <div className="pt-4 mt-3 border-t border-slate-100 space-y-1.5">
              <button
                type="button"
                onClick={handleHelpClick}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#082B63] hover:bg-slate-100/80 transition-all text-left cursor-pointer"
              >
                <HelpCircle className="w-4.5 h-4.5 shrink-0 text-slate-500" />
                <span className="truncate">Help & Support</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0 text-slate-500 group-hover:text-red-500" />
                <span className="truncate">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Campus Graphic and Copyright */}
        <div className="relative overflow-hidden bg-gradient-to-t from-[#082B63] via-[#103b7b] to-[#1557B0] text-white pt-10 pb-4 px-4 text-center mt-auto">
          {/* Subtle building silhouette graphic overlay */}
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-bottom mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: 'url(/assets/aistudio/Dadaya_High_School_E-Report_Portal_Showcase_acb996a7.png)',
            }}
          />
          <div className="relative z-10">
            <p className="text-[10px] text-blue-100 font-medium">
              © 2026 Dadaya High School
            </p>
            <p className="text-[9.5px] text-blue-200/80 mt-0.5">
              All Rights Reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
