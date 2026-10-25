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
        <h3 className="text-xl font-bold text-slate-900">No Student Profile Enrolled</h3>
        <p className="text-sm text-slate-500 mt-2">
          Please enroll into Lower Six (Sciences, Commercials, or Arts) on the sign-in page to create your student record.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Official academic enrollment record at Dadaya High School.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner in Forest Green */}
        <div className="bg-[#064e3b] h-32 relative flex items-end px-6 pb-4">
          <div className="absolute top-4 right-4 opacity-20">
            <DadayaCrest sizeClass="w-24 h-24" inverted={true} />
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="w-18 h-18 rounded-2xl bg-white text-[#064e3b] border-4 border-white shadow-lg flex items-center justify-center font-bold text-2xl font-serif-school">
              {student.name.charAt(0)}
              {student.surname.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {student.name} {student.surname}
              </h2>
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <span className="font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700">
                  {student.id}
                </span>
                <span>•</span>
                <span>{student.className}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Academic Information
              </h3>
              <div className="flex items-center gap-3 text-slate-700">
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">Class / Stream</span>
                  <span className="font-semibold">{student.className}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">Registration Student ID</span>
                  <span className="font-mono font-semibold">{student.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">Date of Birth</span>
                  <span className="font-semibold">{student.dob}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">Gender</span>
                  <span className="font-semibold">{student.gender}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Contact & Guardian
              </h3>
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">Student Email</span>
                  <span className="font-semibold">{student.email || `${student.name.toLowerCase()}@student.dadaya.ac.zw`}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">Guardian Name</span>
                  <span className="font-semibold">{student.guardianName || 'Parent / Guardian'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">Guardian Phone</span>
                  <span className="font-mono font-semibold">{student.guardianPhone || '+263 77 111 2233'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-400 block">School Campus</span>
                  <span className="font-semibold">Dadaya High School, Zvishavane</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenReportCard(student.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <Award className="w-4 h-4 text-emerald-300" />
              <span>Generate Official Report Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;
