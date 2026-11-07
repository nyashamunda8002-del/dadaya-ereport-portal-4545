import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { Briefcase, Mail, Phone, Lock, Save, CheckCircle2 } from 'lucide-react';

export const TeacherSettingsView: React.FC = () => {
  const { currentTeacher } = useAuth();
  const [phone, setPhone] = useState(currentTeacher?.phone || '+263 77 234 5678');
  const [success, setSuccess] = useState(false);

  const teacher = currentTeacher || dataService.getTeachers()[0];
  const classes = dataService.getClasses().filter((c) => teacher.assignedClassIds.includes(c.id));
  const subjects = dataService.getSubjects().filter((s) => teacher.assignedSubjectIds.includes(s.id));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacher) {
      dataService.updateTeacher(teacher.id, { phone });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
          Teacher Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your faculty credentials and contact information.
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#082B63] text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1557B0]" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#082B63] text-white flex items-center justify-center font-bold text-2xl font-serif-school shadow-xs">
            {teacher.name.charAt(0)}
            {teacher.surname.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#082B63]">{teacher.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[#1557B0] font-bold">
                {teacher.ecNumber}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">{teacher.status}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="text"
                disabled
                value={teacher.email}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#082B63] uppercase tracking-wider mb-2">
              Assigned Classes
            </h3>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1 rounded-lg bg-blue-50 text-[#1557B0] text-xs font-bold border border-blue-200"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#082B63] uppercase tracking-wider mb-2">
              Assigned Subjects
            </h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                >
                  {s.name} ({s.code})
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherSettingsView;
