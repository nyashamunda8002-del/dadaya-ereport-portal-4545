import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Edit3,
  FileText,
  Settings,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  FileSpreadsheet,
  BarChart3,
  History,
  CheckCircle,
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
  const { role } = useAuth();

  const getNavItems = () => {
    if (role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'classes', label: 'Class', icon: Users },
        { id: 'feed-marks', label: 'Feed Marks', icon: Edit3 },
        { id: 'report-cards', label: 'Report Cards', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'student') {
      return [
        { id: 'my-results', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'report-card', label: 'My Report Card', icon: Award },
        { id: 'profile', label: 'Profile', icon: GraduationCap },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    // Administrator
    return [
      { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'admin-students', label: 'Students', icon: GraduationCap },
      { id: 'admin-teachers', label: 'Teachers', icon: Briefcase },
      { id: 'admin-classes', label: 'Classes', icon: Building2 },
      { id: 'admin-subjects', label: 'Subjects', icon: BookOpen },
      { id: 'admin-marks', label: 'Marks Entry & Review', icon: FileSpreadsheet },
      { id: 'admin-report-cards', label: 'Report Cards', icon: Award },
      { id: 'admin-reports', label: 'Analytics & Reports', icon: BarChart3 },
      { id: 'admin-logs', label: 'Activity Logs', icon: History },
      { id: 'admin-settings', label: 'Settings & Firebase', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed lg:static top-18 bottom-0 left-0 z-30 w-64 bg-[#032015] text-stone-200 border-r border-emerald-900/50 p-4 transition-transform duration-300 ease-in-out flex flex-col justify-between shrink-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 pt-1 text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-800/90 text-white font-semibold border-l-2 border-emerald-400 pl-2.5'
                    : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-500/80'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* School Motto / Footer note in sidebar */}
        <div className="pt-4 mt-4 border-t border-emerald-900/50 px-2">
          <div className="text-[11px] font-serif-school text-emerald-200 font-bold uppercase tracking-wider">
            Dadaya High School
          </div>
          <div className="text-[10px] text-emerald-300/60 mt-0.5 font-mono">
            Est. 1934 · Zvishavane, Zimbabwe
          </div>
          <div className="text-[9px] text-emerald-400/50 mt-1 uppercase tracking-widest">
            Discipline · Excellence · Future
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
