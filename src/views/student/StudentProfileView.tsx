import React from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { DadayaCrest } from '../../components/DadayaLogo';
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const StudentProfileView: React.FC<{ onOpenReportCard: (id: string) => void }> = ({
  onOpenReportCard,
}) => {
  const { currentStudent, currentUser } = useAuth();
  const studentId = currentStudent?.id || currentUser?.associatedId || 'DHS001';
  const student = currentStudent || dataService.getStudentById(studentId) || dataService.getStudents()[0];
  const settings = dataService.getSettings();

  if (!student) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto mt-8">
        <h3 className="text-xl font-bold text-[#082B63]">No Student Profile Enrolled</h3>
        <p className="text-sm text-slate-500 mt-2">
          Please enroll into your class stream on the sign-in page to create your student record.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Official academic enrollment record at Dadaya High School.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Banner with clean blue gradient header */}
        <div className="bg-gradient-to-r from-[#082B63] to-[#1557B0] relative flex items-end px-6 py-6 text-white">
          <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
            <DadayaCrest sizeClass="w-24 h-24" inverted={true} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-xl bg-white text-[#082B63] flex items-center justify-center font-bold text-2xl font-serif-school shadow-md">
              {student.name.charAt(0)}
              {student.surname.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-school">
                {student.name} {student.surname}
              </h2>
              <div className="flex items-center gap-2 text-xs text-blue-100 mt-1 font-mono">
                <span className="font-bold text-amber-300">
                  {student.id}
                </span>
                <span>•</span>
                <span className="font-sans font-medium text-white">{student.className}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="max-w-md space-y-4 text-sm">
            <h3 className="text-xs font-bold text-[#082B63] uppercase tracking-wider">
              Academic Information
            </h3>
            <div className="flex items-center gap-3 text-slate-700">
              <GraduationCap className="w-4 h-4 text-[#1557B0] shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Class / Stream</span>
                <span className="font-semibold text-slate-900">{student.className}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <CreditCard className="w-4 h-4 text-[#1557B0] shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Registration Student ID</span>
                <span className="font-mono font-bold text-[#082B63]">{student.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <Calendar className="w-4 h-4 text-[#1557B0] shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-900">{student.dob || '2008-05-14'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700">
              <MapPin className="w-4 h-4 text-[#1557B0] shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">School Campus</span>
                <span className="font-semibold text-slate-900">Dadaya High School, Zvishavane</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenReportCard(student.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99]"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Generate Official Report Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;
