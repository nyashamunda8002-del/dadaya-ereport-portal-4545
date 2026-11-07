import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ReportCardModal from './components/ReportCardModal';
import LoginView from './views/LoginView';

// Teacher Views
import TeacherDashboard from './views/teacher/TeacherDashboard';
import FeedMarksView from './views/teacher/FeedMarksView';
import TeacherClassesView from './views/teacher/TeacherClassesView';
import TeacherReportCardsView from './views/teacher/TeacherReportCardsView';
import TeacherSettingsView from './views/teacher/TeacherSettingsView';

// Student Views
import StudentDashboard from './views/student/StudentDashboard';
import StudentProfileView from './views/student/StudentProfileView';

// Admin Views
import AdminDashboard from './views/admin/AdminDashboard';
import AdminStudentsView from './views/admin/AdminStudentsView';
import AdminTeachersView from './views/admin/AdminTeachersView';
import AdminClassesView from './views/admin/AdminClassesView';
import AdminSubjectsView from './views/admin/AdminSubjectsView';
import AdminMarksView from './views/admin/AdminMarksView';
import AdminReportsView from './views/admin/AdminReportsView';
import AdminActivityLogsView from './views/admin/AdminActivityLogsView';
import AdminSettingsView from './views/admin/AdminSettingsView';

import dataService from './services/dataService';
import { Menu, X } from 'lucide-react';

const getRoleDashboardTab = (role: string | null) => {
  if (role === 'admin') return 'admin-dashboard';
  if (role === 'student') return 'my-results';
  return 'dashboard';
};

const MainAppContent: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(() => getRoleDashboardTab(role));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically reset to the role's dashboard whenever a role or user account is opened
  useEffect(() => {
    if (role === 'admin') {
      setCurrentTab('admin-dashboard');
    } else if (role === 'student') {
      setCurrentTab('my-results');
    } else if (role === 'teacher') {
      setCurrentTab('dashboard');
    }
  }, [role, currentUser?.id]);

  const [reportModalStudentId, setReportModalStudentId] = useState<string | null>(null);
  const [reportModalTerm, setReportModalTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');

  const [feedMarksClassId, setFeedMarksClassId] = useState<string>('lower-six-sciences');

  const handleOpenReportCard = (studentId: string, term?: string) => {
    setReportModalStudentId(studentId);
    if (term === 'Term 1' || term === 'Term 2' || term === 'Term 3') {
      setReportModalTerm(term);
    } else {
      setReportModalTerm(dataService.getSettings().currentTerm || 'Term 1');
    }
  };

  const handleCloseReportCard = () => {
    setReportModalStudentId(null);
  };

  const handleTeacherNavigate = (tab: string, context?: { classId?: string }) => {
    if (context?.classId) {
      setFeedMarksClassId(context.classId);
    }
    setCurrentTab(tab);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <LoginView />
        </main>
      </div>
    );
  }

  const activeReportCard = reportModalStudentId
    ? dataService.generateReportCard(reportModalStudentId, reportModalTerm)
    : null;

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onNavigateHome={() =>
          setCurrentTab(
            role === 'admin'
              ? 'admin-dashboard'
              : role === 'student'
              ? 'my-results'
              : 'dashboard'
          )
        }
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full relative">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'report-card') {
              handleOpenReportCard(currentUser.associatedId || 'DHS001');
            } else {
              setCurrentTab(tab);
            }
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 bg-[#F4F7FC] p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto max-w-[1600px]">
          {/* TEACHER VIEWS */}
          {role === 'teacher' && (
            <>
              {(currentTab === 'dashboard' || !currentTab) && (
                <TeacherDashboard
                  onNavigate={handleTeacherNavigate}
                  onOpenReportCard={handleOpenReportCard}
                />
              )}
              {currentTab === 'classes' && (
                <TeacherClassesView
                  initialClassId={feedMarksClassId}
                  onOpenReportCard={handleOpenReportCard}
                />
              )}
              {currentTab === 'feed-marks' && (
                <FeedMarksView
                  initialClassId={feedMarksClassId}
                  onOpenReportCard={handleOpenReportCard}
                />
              )}
              {currentTab === 'report-cards' && (
                <TeacherReportCardsView onOpenReportCard={handleOpenReportCard} />
              )}
              {currentTab === 'settings' && <TeacherSettingsView />}
            </>
          )}

          {/* STUDENT VIEWS */}
          {role === 'student' && (
            <>
              {(currentTab === 'my-results' || currentTab === 'dashboard' || !currentTab) && (
                <StudentDashboard onOpenReportCard={handleOpenReportCard} />
              )}
              {currentTab === 'profile' && (
                <StudentProfileView onOpenReportCard={handleOpenReportCard} />
              )}
              {currentTab === 'settings' && (
                <StudentProfileView onOpenReportCard={handleOpenReportCard} />
              )}
            </>
          )}

          {/* ADMIN VIEWS */}
          {role === 'admin' && (
            <>
              {(currentTab === 'admin-dashboard' || currentTab === 'dashboard' || !currentTab) && (
                <AdminDashboard
                  onNavigate={(t) => setCurrentTab(t)}
                  onOpenReportCard={handleOpenReportCard}
                />
              )}
              {currentTab === 'admin-students' && (
                <AdminStudentsView onOpenReportCard={handleOpenReportCard} />
              )}
              {currentTab === 'admin-teachers' && <AdminTeachersView />}
              {currentTab === 'admin-classes' && <AdminClassesView />}
              {currentTab === 'admin-subjects' && <AdminSubjectsView />}
              {currentTab === 'admin-marks' && <AdminMarksView />}
              {currentTab === 'admin-report-cards' && (
                <TeacherReportCardsView onOpenReportCard={handleOpenReportCard} />
              )}
              {currentTab === 'admin-reports' && (
                <AdminReportsView onOpenReportCard={handleOpenReportCard} />
              )}
              {currentTab === 'admin-logs' && <AdminActivityLogsView />}
              {currentTab === 'admin-settings' && <AdminSettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Official Student Report Card Modal (A4 Printable) */}
      <ReportCardModal
        isOpen={Boolean(reportModalStudentId)}
        reportCard={activeReportCard}
        onClose={handleCloseReportCard}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
