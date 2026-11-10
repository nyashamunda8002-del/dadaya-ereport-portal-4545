import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import dataService from '../../services/dataService';
import { SchoolClass, Subject, Student, MarkStatus } from '../../types';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Send,
} from 'lucide-react';

interface FeedMarksViewProps {
  initialClassId?: string;
  onOpenReportCard?: (studentId: string) => void;
}

export const FeedMarksView: React.FC<FeedMarksViewProps> = ({
  initialClassId = 'lower-six-sciences',
  onOpenReportCard,
}) => {
  const { currentTeacher, currentUser } = useAuth();
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => setRefreshCount((c) => c + 1));
  }, []);

  const settings = dataService.getSettings();
  const classes = dataService.getClasses();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes.find((c) => c.id === initialClassId)?.id || classes[0]?.id || 'lower-six-sciences'
  );

  useEffect(() => {
    if (classes.length > 0 && !classes.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Subjects strictly filtered by class stream/curriculum
  const availableSubjects = dataService.getSubjectsForClass(selectedClassId);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const initSubs = dataService.getSubjectsForClass(initialClassId || 'lower-six-sciences');
    return initSubs[0]?.id || 'physics';
  });

  // Whenever class changes, ensure selected subject belongs to the new class
  useEffect(() => {
    const classSubs = dataService.getSubjectsForClass(selectedClassId);
    if (classSubs.length > 0 && !classSubs.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(classSubs[0].id);
    }
  }, [selectedClassId]);

  const [selectedTerm, setSelectedTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(
    settings.currentTerm || 'Term 1'
  );

  const [marksDraft, setMarksDraft] = useState<Record<string, { mark: string; status: MarkStatus }>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const classStudents = dataService.getStudents({ classId: selectedClassId, status: 'Active' });

  useEffect(() => {
    const existingMarks = dataService.getMarks({
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      term: selectedTerm,
      academicYear: settings.currentAcademicYear,
    });

    const draftMap: Record<string, { mark: string; status: MarkStatus }> = {};
    classStudents.forEach((st) => {
      const found = existingMarks.find((m) => m.studentId === st.id);
      if (found) {
        draftMap[st.id] = { mark: String(found.percentage), status: found.status };
      } else {
        draftMap[st.id] = { mark: '', status: 'Pending' };
      }
    });

    setMarksDraft(draftMap);
    setFeedback({ type: null, message: '' });
  }, [selectedClassId, selectedSubjectId, selectedTerm]);

  const performAutoSave = (studentId: string, markStr: string) => {
    if (markStr.trim() === '') return;
    const num = Number(markStr);
    if (isNaN(num) || num < 0 || num > 100) return;

    setAutoSaveState('saving');

    const teacherName = currentTeacher?.title || currentUser?.displayName || 'Mr. Gunda';
    const teacherId = currentTeacher?.id || 'tch-gunda';

    const result = dataService.saveMarksBatch(
      [
        {
          studentId,
          mark: num,
          status: 'Saved',
        },
      ],
      {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        term: selectedTerm,
        academicYear: settings.currentAcademicYear,
        teacherId,
        teacherName,
      }
    );

    if (result.success) {
      setAutoSaveState('saved');
      setLastSavedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setMarksDraft((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status: 'Saved',
        },
      }));
    } else {
      setAutoSaveState('idle');
    }
  };

  const handleMarkChange = (studentId: string, val: string) => {
    if (val !== '' && !/^\d+$/.test(val)) return;

    setMarksDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        mark: val,
        status: val === '' ? 'Pending' : (prev[studentId]?.status || 'Saved'),
      },
    }));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val !== '') {
      const num = Number(val);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        setAutoSaveState('saving');
        debounceTimerRef.current = setTimeout(() => {
          performAutoSave(studentId, val);
        }, 400);
      }
    }
  };

  const handleMarkBlur = (studentId: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const currentItem = marksDraft[studentId];
    if (currentItem && currentItem.mark !== '') {
      performAutoSave(studentId, currentItem.mark);
    }
  };

  const handleSaveMarks = (targetStatus: MarkStatus = 'Saved') => {
    setIsSubmitting(true);
    setFeedback({ type: null, message: '' });

    const itemsToSave: Array<{ studentId: string; mark: number; status: MarkStatus }> = [];
    const validationErrors: string[] = [];

    classStudents.forEach((student) => {
      const item = marksDraft[student.id];
      if (item && item.mark.trim() !== '') {
        const num = Number(item.mark);
        if (isNaN(num) || num < 0 || num > 100) {
          validationErrors.push(`${student.name} ${student.surname}: Mark must be between 0 and 100.`);
        } else {
          itemsToSave.push({
            studentId: student.id,
            mark: num,
            status: targetStatus,
          });
        }
      }
    });

    if (validationErrors.length > 0) {
      setIsSubmitting(false);
      setFeedback({
        type: 'error',
        message: validationErrors[0],
      });
      return;
    }

    if (itemsToSave.length === 0) {
      setIsSubmitting(false);
      setFeedback({
        type: 'error',
        message: 'No marks entered to save. Please type student percentages.',
      });
      return;
    }

    const teacherName = currentTeacher?.title || currentUser?.displayName || 'Mr. Gunda';
    const teacherId = currentTeacher?.id || 'tch-gunda';

    const result = dataService.saveMarksBatch(itemsToSave, {
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      term: selectedTerm,
      academicYear: settings.currentAcademicYear,
      teacherId,
      teacherName,
    });

    setIsSubmitting(false);

    if (result.success) {
      setMarksDraft((prev) => {
        const updated = { ...prev };
        itemsToSave.forEach((saved) => {
          if (updated[saved.studentId]) {
            updated[saved.studentId].status = targetStatus;
          }
        });
        return updated;
      });

      setFeedback({
        type: 'success',
        message:
          targetStatus === 'Submitted'
            ? `Marks successfully submitted to Administration for ${result.savedCount} students.`
            : `Marks saved successfully. Total recorded: ${result.savedCount} students.`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: result.errors[0] || 'Unable to save marks. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Feed Marks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Enter and manage student marks for your classes.
          </p>
        </div>

        {/* Live Auto-Save Status Indicator */}
        <div className="flex items-center gap-2">
          {autoSaveState === 'saving' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#1557B0] text-xs font-bold animate-pulse border border-blue-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#1557B0] animate-ping" />
              Saving automatically...
            </span>
          )}
          {autoSaveState === 'saved' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Marks auto-saved {lastSavedTime ? `at ${lastSavedTime}` : 'live'}
            </span>
          )}
          {autoSaveState === 'idle' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              Auto-save active
            </span>
          )}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.formLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject ({availableSubjects.length} for this stream)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            >
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#1557B0] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: null, message: '' })}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Student Marks Table - Authentic Academic Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile Student Marks Entry Cards */}
        <div className="sm:hidden divide-y divide-slate-100">
          {classStudents.length > 0 ? (
            classStudents.map((st, index) => {
              const draft = marksDraft[st.id] || { mark: '', status: 'Pending' };

              return (
                <div key={st.id} className="p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          #{index + 1}
                        </span>
                        <h4 className="font-bold text-sm text-[#082B63]">
                          {st.name} {st.surname}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#1557B0] mt-0.5 block">
                        {st.id}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                        draft.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : draft.status === 'Submitted'
                          ? 'bg-blue-50 text-blue-700'
                          : draft.status === 'Saved'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          draft.status === 'Approved'
                            ? 'bg-emerald-600'
                            : draft.status === 'Submitted'
                            ? 'bg-blue-600'
                            : draft.status === 'Saved'
                            ? 'bg-purple-600'
                            : 'bg-slate-400'
                        }`}
                      />
                      {draft.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-600">
                        Mark:
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={3}
                          value={draft.mark}
                          onChange={(e) => handleMarkChange(st.id, e.target.value)}
                          onBlur={() => handleMarkBlur(st.id)}
                          placeholder="0–100"
                          className="w-20 px-2.5 py-2 text-center text-sm font-bold font-mono text-[#082B63] border border-slate-300 rounded-xl focus:border-[#1557B0] focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden tabular-nums bg-white min-h-[40px]"
                        />
                        <span className="text-slate-500 font-mono text-xs font-bold">%</span>
                      </div>
                    </div>

                    {onOpenReportCard && (
                      <button
                        type="button"
                        onClick={() => onOpenReportCard(st.id)}
                        className="px-3 py-2 text-xs font-bold text-[#1557B0] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer min-h-[40px] flex items-center gap-1"
                      >
                        Report Card
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              No candidates currently registered in this stream.
            </div>
          )}
        </div>

        {/* Desktop & Tablet Tabular Marks Ledger */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#082B63] uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Candidate Name</th>
                <th className="py-3 px-3">Surname</th>
                <th className="py-3 px-3">Candidate ID</th>
                <th className="py-3 px-3 w-40">Mark Percentage</th>
                <th className="py-3 px-3 w-28 text-center">Status</th>
                <th className="py-3 px-3 w-24 text-center">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length > 0 ? (
                classStudents.map((st, index) => {
                  const draft = marksDraft[st.id] || { mark: '', status: 'Pending' };

                  return (
                    <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#082B63]">{st.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{st.surname}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-[#1557B0]">
                        {st.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 w-32">
                          <input
                            type="text"
                            maxLength={3}
                            value={draft.mark}
                            onChange={(e) => handleMarkChange(st.id, e.target.value)}
                            onBlur={() => handleMarkBlur(st.id)}
                            placeholder="0–100"
                            className="w-16 px-2 py-1 text-center font-bold font-mono text-[#082B63] border border-slate-300 rounded-lg focus:border-[#1557B0] focus:ring-1 focus:ring-[#1557B0] focus:outline-hidden tabular-nums"
                          />
                          <span className="text-slate-500 font-mono text-xs">%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${
                            draft.status === 'Approved'
                              ? 'text-emerald-700'
                              : draft.status === 'Submitted'
                              ? 'text-blue-700'
                              : draft.status === 'Saved'
                              ? 'text-purple-700'
                              : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              draft.status === 'Approved'
                                ? 'bg-emerald-600'
                                : draft.status === 'Submitted'
                                ? 'bg-blue-600'
                                : draft.status === 'Saved'
                                ? 'bg-purple-600'
                                : 'bg-slate-300'
                            }`}
                          />
                          {draft.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenReportCard && onOpenReportCard(st.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#1557B0] hover:text-[#082B63] hover:underline cursor-pointer"
                          title="View Student Report Card"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans italic">
                    No candidates currently registered in this stream.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium text-center sm:text-left">
            Total Enrolled: <span className="font-bold text-[#082B63] font-mono">{classStudents.length}</span> candidates
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting || classStudents.length === 0}
              onClick={() => handleSaveMarks('Submitted')}
              className="px-3.5 py-2.5 sm:py-1.5 border border-slate-300 hover:border-[#1557B0] hover:bg-white text-[#082B63] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs min-h-[44px] sm:min-h-0"
            >
              <Send className="w-3.5 h-3.5 text-[#1557B0]" />
              <span>Submit for Verification</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting || classStudents.length === 0}
              onClick={() => handleSaveMarks('Saved')}
              className="px-4 py-2.5 sm:py-1.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs min-h-[44px] sm:min-h-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Save Draft'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedMarksView;
