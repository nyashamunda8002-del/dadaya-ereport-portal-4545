import {
  Student,
  Teacher,
  SchoolClass,
  Subject,
  Mark,
  ReportCard,
  SchoolSettings,
  ActivityLog,
  GradeBoundary,
  MarkStatus,
} from '../types';
import {
  initialClasses,
  initialMarks,
  initialStudents,
  initialSubjects,
  initialTeachers,
  initialSettings,
  initialActivityLogs,
} from './mockData';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

const STORAGE_KEY = 'dadaya_portal_db_v6_lowersix_streams';
const OFFLINE_QUEUE_KEY = 'dadaya_offline_enrollment_queue_v1';

export interface OfflineQueueItem {
  id: string;
  type: 'student' | 'mark' | 'class';
  name?: string;
  data: any;
  timestamp: string;
}

interface StorageState {
  students: Student[];
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  marks: Mark[];
  settings: SchoolSettings;
  activityLogs: ActivityLog[];
}

class DataService {
  private state: StorageState;
  private listeners: Set<() => void> = new Set();
  private firestoreSynced: boolean = false;
  private pendingQueue: OfflineQueueItem[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    this.state = this.loadState();
    this.pendingQueue = this.loadOfflineQueue();
    this.setupNetworkListeners();
    this.initFirestoreSync();
  }

  private setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.syncPendingOfflineQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  private loadState(): StorageState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.students && parsed.classes) {
          // De-duplicate and ensure all required classes exist
          const existingClassIds = new Set((parsed.classes as SchoolClass[]).map((c) => c.id));
          for (const initCls of initialClasses) {
            if (!existingClassIds.has(initCls.id)) {
              parsed.classes.push(initCls);
              existingClassIds.add(initCls.id);
            }
          }

          // Ensure Teacher Gunda exists as official commercial faculty
          const gundaTeacher = initialTeachers.find((t) => t.id === 'tch-gunda') || initialTeachers[0];
          parsed.teachers = (parsed.teachers as Teacher[]).filter(
            (t) => t.id !== 'tch-ahmed' && t.id !== 'tch-moyo' && t.id !== 'tch-sibanda' && t.id !== 'tch-nyathi' && t.id !== 'tch-dlodlo'
          );
          if (!parsed.teachers.some((t: Teacher) => t.id === 'tch-gunda' || t.email.toLowerCase() === 'gunda@gmail.com')) {
            parsed.teachers.unshift(gundaTeacher);
          }

          // Ensure all initial subjects exist
          if (!parsed.subjects || parsed.subjects.length === 0) {
            parsed.subjects = initialSubjects;
          } else {
            const existingSubjectIds = new Set((parsed.subjects as Subject[]).map((s) => s.id));
            for (const initSub of initialSubjects) {
              if (!existingSubjectIds.has(initSub.id)) {
                parsed.subjects.push(initSub);
                existingSubjectIds.add(initSub.id);
              }
            }
          }

          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    const defaultState: StorageState = {
      students: initialStudents,
      teachers: initialTeachers,
      classes: initialClasses,
      subjects: initialSubjects,
      marks: initialMarks,
      settings: initialSettings,
      activityLogs: initialActivityLogs,
    };
    this.saveLocalState(defaultState);
    return defaultState;
  }

  private saveLocalState(stateToSave?: StorageState) {
    const s = stateToSave || this.state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in subscriber:', err);
      }
    });
  }

  // --- Real-Time Firestore Synchronization ---
  private async initFirestoreSync() {
    try {
      // 1. Students Snapshot
      onSnapshot(
        collection(db, 'students'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteStudents: Student[] = [];
            snapshot.forEach((docSnap) => {
              remoteStudents.push(docSnap.data() as Student);
            });
            this.state.students = remoteStudents;
            this.saveLocalState();
          } else if (!this.firestoreSynced) {
            // Seed to Firestore
            this.seedFirestore();
          }
          this.firestoreSynced = true;
        },
        (error) => {
          console.warn('Firestore students subscription notice:', error.message);
        }
      );

      // 2. Marks Snapshot
      onSnapshot(
        collection(db, 'marks'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteMarks: Mark[] = [];
            snapshot.forEach((docSnap) => {
              remoteMarks.push(docSnap.data() as Mark);
            });
            this.state.marks = remoteMarks;
            this.saveLocalState();
          }
        },
        (error) => {
          console.warn('Firestore marks subscription notice:', error.message);
        }
      );

      // 3. Classes Snapshot
      onSnapshot(
        collection(db, 'classes'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteClasses: SchoolClass[] = [];
            const seen = new Set<string>();
            snapshot.forEach((docSnap) => {
              const c = docSnap.data() as SchoolClass;
              if (c && c.id && !seen.has(c.id)) {
                seen.add(c.id);
                remoteClasses.push(c);
              }
            });
            this.state.classes = remoteClasses;
            this.saveLocalState();
          }
        },
        (error) => {
          console.warn('Firestore classes subscription notice:', error.message);
        }
      );

      // 4. Activity Logs Snapshot
      onSnapshot(
        collection(db, 'activityLogs'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteLogs: ActivityLog[] = [];
            snapshot.forEach((docSnap) => {
              remoteLogs.push(docSnap.data() as ActivityLog);
            });
            remoteLogs.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            this.state.activityLogs = remoteLogs.slice(0, 50);
            this.saveLocalState();
          }
        },
        (error) => {
          console.warn('Firestore logs subscription notice:', error.message);
        }
      );
    } catch (e) {
      console.warn('Failed to start Firestore real-time listener:', e);
    }
  }

  // Seed baseline data to Firestore
  private async seedFirestore() {
    try {
      for (const st of this.state.students) {
        await setDoc(doc(db, 'students', st.id), st);
      }
      for (const m of this.state.marks) {
        await setDoc(doc(db, 'marks', m.id), m);
      }
      for (const c of this.state.classes) {
        await setDoc(doc(db, 'classes', c.id), c);
      }
      for (const s of this.state.subjects) {
        await setDoc(doc(db, 'subjects', s.id), s);
      }
      for (const t of this.state.teachers) {
        await setDoc(doc(db, 'teachers', t.id), t);
      }
      for (const l of this.state.activityLogs) {
        await setDoc(doc(db, 'activityLogs', l.id), l);
      }
      await setDoc(doc(db, 'settings', 'config'), this.state.settings);
      console.log('Dadaya High School baseline successfully populated to Cloud Firestore');
    } catch (e) {
      console.warn('Firestore initial seeding note:', e);
    }
  }

  // --- Grade Calculation Logic ---
  public calculateGrade(mark: number, boundaries?: GradeBoundary[]): {
    grade: 'A' | 'B' | 'C' | 'D' | 'U';
    remark: string;
    category: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  } {
    const scale = boundaries || this.state.settings.gradeBoundaries;
    const clamped = Math.max(0, Math.min(100, Math.round(mark)));
    const matched = scale.find((b) => clamped >= b.minMark && clamped <= b.maxMark);
    if (matched) {
      return {
        grade: matched.grade,
        remark: matched.remark,
        category: matched.category,
      };
    }
    if (clamped >= 80) return { grade: 'A', remark: 'Distinction / Excellent effort', category: 'Excellent' };
    if (clamped >= 70) return { grade: 'B', remark: 'Good performance. Keep it up', category: 'Good' };
    if (clamped >= 50) return { grade: 'C', remark: 'Credit pass. Work harder', category: 'Fair' };
    if (clamped >= 40) return { grade: 'D', remark: 'Pass. Needs more attention', category: 'Needs Improvement' };
    return { grade: 'U', remark: 'Ungraded. Urgent intervention needed', category: 'Needs Improvement' };
  }

  // --- Students CRUD ---
  public getStudents(filters?: { classId?: string; search?: string; status?: string }): Student[] {
    let list = [...this.state.students];
    if (filters?.classId && filters.classId !== 'all') {
      list = list.filter((s) => s.classId === filters.classId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((s) => s.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.surname.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getStudentById(id: string): Student | undefined {
    return this.state.students.find((s) => s.id.toLowerCase() === id.toLowerCase());
  }

  public addStudent(
    studentData: Omit<Student, 'id' | 'className'> & { id?: string; className?: string },
    authorName = 'Administrator'
  ): Student {
    const newId =
      studentData.id?.trim() || `DHS${String(Math.floor(Math.random() * 900) + 100)}`;

    const targetClass = this.state.classes.find((c) => c.id === studentData.classId);
    const newStudent: Student = {
      ...studentData,
      id: newId,
      className: targetClass ? targetClass.name : studentData.className || 'Lower Six Sciences',
      status: studentData.status || 'Active',
    };

    this.state.students.unshift(newStudent);
    this.updateClassStudentCounts();

    const currentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isOnline = currentlyOnline;

    this.logActivity({
      user: authorName,
      role: 'admin',
      action: `Student enrolled - ${newStudent.name} ${newStudent.surname}`,
      details: `Enrolled into ${newStudent.className} with ID ${newStudent.id}${!currentlyOnline ? ' (Offline Mode - Queued for sync)' : ''}`,
    });

    this.saveLocalState();

    if (!currentlyOnline) {
      // Offline mode: Enqueue student record for automatic background sync when online
      this.enqueueOfflineItem({
        id: newStudent.id,
        type: 'student',
        name: `${newStudent.name} ${newStudent.surname} (${newStudent.id})`,
        data: newStudent,
        timestamp: new Date().toISOString(),
      });
      console.log(`[Offline Mode] Student ${newStudent.id} queued for sync`);
    } else {
      // Online mode: Send to Cloud Firestore with safety queue on failure
      setDoc(doc(db, 'students', newStudent.id), newStudent).catch((err) => {
        console.warn('Firestore write warning, queuing for offline sync:', err);
        this.enqueueOfflineItem({
          id: newStudent.id,
          type: 'student',
          name: `${newStudent.name} ${newStudent.surname} (${newStudent.id})`,
          data: newStudent,
          timestamp: new Date().toISOString(),
        });
      });
    }

    return newStudent;
  }

  // --- Offline Mode Helpers & Background Cloud Sync ---
  public getIsOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public getPendingSyncCount(): number {
    return this.pendingQueue.length;
  }

  public getPendingSyncQueue(): OfflineQueueItem[] {
    return [...this.pendingQueue];
  }

  private loadOfflineQueue(): OfflineQueueItem[] {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.pendingQueue));
    } catch (e) {
      console.warn('Failed to save offline queue:', e);
    }
  }

  private enqueueOfflineItem(item: OfflineQueueItem) {
    this.pendingQueue = this.pendingQueue.filter((q) => !(q.id === item.id && q.type === item.type));
    this.pendingQueue.push(item);
    this.saveOfflineQueue();
    this.notify();
  }

  public async syncPendingOfflineQueue(): Promise<{ synced: number; failed: number }> {
    if (this.pendingQueue.length === 0) return { synced: 0, failed: 0 };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { synced: 0, failed: this.pendingQueue.length };
    }

    let synced = 0;
    let failed = 0;
    const remaining: OfflineQueueItem[] = [];

    for (const item of this.pendingQueue) {
      try {
        if (item.type === 'student') {
          await setDoc(doc(db, 'students', item.id), item.data);
        } else if (item.type === 'mark') {
          await setDoc(doc(db, 'marks', item.id), item.data);
        } else if (item.type === 'class') {
          await setDoc(doc(db, 'classes', item.id), item.data);
        }
        synced++;
      } catch (err) {
        console.warn(`Failed to sync queued item ${item.id}:`, err);
        remaining.push(item);
        failed++;
      }
    }

    this.pendingQueue = remaining;
    this.saveOfflineQueue();

    if (synced > 0) {
      this.logActivity({
        user: 'Auto-Sync Service',
        role: 'admin',
        action: `Offline student records synced to Cloud Firestore`,
        details: `Successfully uploaded ${synced} queued offline record(s) to cloud database`,
      });
      this.notify();
    }

    return { synced, failed };
  }

  public updateStudent(id: string, updates: Partial<Student>, authorName = 'Administrator'): boolean {
    const idx = this.state.students.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    if (updates.classId) {
      const targetClass = this.state.classes.find((c) => c.id === updates.classId);
      if (targetClass) {
        updates.className = targetClass.name;
      }
    }

    this.state.students[idx] = { ...this.state.students[idx], ...updates };
    this.updateClassStudentCounts();

    this.logActivity({
      user: authorName,
      role: 'admin',
      action: `Student record updated - ${this.state.students[idx].name} ${this.state.students[idx].surname}`,
      details: `Updated details for ${id}`,
    });

    this.saveLocalState();

    setDoc(doc(db, 'students', id), this.state.students[idx]).catch((err) => {
      console.warn('Firestore update warning:', err);
    });

    return true;
  }

  public deleteStudent(id: string, softDelete = true, authorName = 'Administrator'): boolean {
    const student = this.getStudentById(id);
    if (!student) return false;

    if (softDelete) {
      this.updateStudent(id, { status: 'Inactive' }, authorName);
      this.logActivity({
        user: authorName,
        role: 'admin',
        action: `Student deactivated - ${student.name} ${student.surname}`,
        details: `ID ${id} set to Inactive status`,
      });
    } else {
      this.state.students = this.state.students.filter((s) => s.id !== id);
      this.updateClassStudentCounts();
      this.logActivity({
        user: authorName,
        role: 'admin',
        action: `Student deleted - ${student.name} ${student.surname}`,
        details: `Record permanently removed from database`,
      });
      this.saveLocalState();
      deleteDoc(doc(db, 'students', id)).catch((err) => {
        console.warn('Firestore delete warning:', err);
      });
    }
    return true;
  }

  // --- Classes CRUD ---
  public getClasses(): SchoolClass[] {
    const seen = new Set<string>();
    return this.state.classes.filter((c) => {
      if (!c || !c.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }

  public getClassById(id: string): SchoolClass | undefined {
    return this.state.classes.find((c) => c.id === id);
  }

  public addClass(
    classData: Omit<SchoolClass, 'id' | 'status'> & { id?: string; status?: 'Active' | 'Archived' },
    authorName = 'Teacher',
    teacherId?: string
  ): SchoolClass {
    const rawId = classData.id || classData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    let id = rawId || `class-${Date.now()}`;
    let counter = 1;
    while (this.state.classes.some((c) => c.id === id)) {
      id = `${rawId}-${counter}`;
      counter++;
    }
    const newClass: SchoolClass = {
      ...classData,
      id,
      studentCount: 0,
      status: classData.status || 'Active',
    };
    this.state.classes.push(newClass);

    // If created by a teacher, automatically assign this class to their assignedClassIds
    if (teacherId) {
      const teacher = this.state.teachers.find((t) => t.id === teacherId);
      if (teacher) {
        if (!teacher.assignedClassIds) teacher.assignedClassIds = [];
        if (!teacher.assignedClassIds.includes(newClass.id)) {
          teacher.assignedClassIds.push(newClass.id);
          setDoc(doc(db, 'teachers', teacher.id), teacher).catch((err) => {
            console.warn('Firestore teacher update note:', err);
          });
        }
      }
    } else if (authorName && authorName !== 'Administrator') {
      const teacher = this.state.teachers.find((t) => t.name === authorName || t.title === authorName);
      if (teacher) {
        if (!teacher.assignedClassIds) teacher.assignedClassIds = [];
        if (!teacher.assignedClassIds.includes(newClass.id)) {
          teacher.assignedClassIds.push(newClass.id);
          setDoc(doc(db, 'teachers', teacher.id), teacher).catch((err) => {
            console.warn('Firestore teacher update note:', err);
          });
        }
      }
    }

    const isTeacher = authorName !== 'Administrator';
    this.logActivity({
      user: authorName,
      role: isTeacher ? 'teacher' : 'admin',
      action: `Class created - ${newClass.name}`,
      details: `${newClass.formLevel} • ${newClass.stream} created by ${authorName}`,
    });
    this.saveLocalState();

    setDoc(doc(db, 'classes', newClass.id), newClass).catch((err) => {
      console.warn('Firestore class write note:', err);
    });

    return newClass;
  }

  public deleteClass(
    classId: string,
    authorName = 'Teacher',
    teacherId?: string
  ): { success: boolean; message?: string } {
    const targetClass = this.getClassById(classId);
    if (!targetClass) {
      return { success: false, message: 'Class stream not found.' };
    }

    // Remove class from state
    this.state.classes = this.state.classes.filter((c) => c.id !== classId);

    // Also remove from all teachers' assignedClassIds
    this.state.teachers.forEach((t) => {
      if (t.assignedClassIds && t.assignedClassIds.includes(classId)) {
        t.assignedClassIds = t.assignedClassIds.filter((cid) => cid !== classId);
        setDoc(doc(db, 'teachers', t.id), t).catch((err) => {
          console.warn('Firestore teacher unassign note:', err);
        });
      }
    });

    // Reassign any students assigned to this deleted class
    this.state.students.forEach((s) => {
      if (s.classId === classId) {
        s.classId = 'unassigned';
        s.className = 'Unassigned';
        setDoc(doc(db, 'students', s.id), s).catch((err) => {
          console.warn('Firestore student reassign note:', err);
        });
      }
    });

    const isTeacher = authorName !== 'Administrator';
    this.logActivity({
      user: authorName,
      role: isTeacher ? 'teacher' : 'admin',
      action: `Class deleted - ${targetClass.name}`,
      details: `${targetClass.formLevel} • ${targetClass.stream} deleted by ${authorName}`,
    });

    this.saveLocalState();

    deleteDoc(doc(db, 'classes', classId)).catch((err) => {
      console.warn('Firestore class delete note:', err);
    });

    return { success: true };
  }

  private updateClassStudentCounts() {
    this.state.classes.forEach((c) => {
      c.studentCount = this.state.students.filter(
        (s) => s.classId === c.id && s.status === 'Active'
      ).length;
    });
  }

  // --- Subjects CRUD ---
  public getSubjects(): Subject[] {
    return [...this.state.subjects];
  }

  public getSubjectById(id: string): Subject | undefined {
    return this.state.subjects.find((s) => s.id === id);
  }

  public addSubject(subjectData: Omit<Subject, 'id'>, authorName = 'Administrator'): Subject {
    const id = subjectData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newSub: Subject = { ...subjectData, id, status: 'Active' };
    this.state.subjects.push(newSub);
    this.logActivity({
      user: authorName,
      role: 'admin',
      action: `Subject added - ${newSub.name} (${newSub.code})`,
      details: `Department: ${newSub.department}`,
    });
    this.saveLocalState();

    setDoc(doc(db, 'subjects', newSub.id), newSub).catch((err) => {
      console.warn('Firestore subject write note:', err);
    });

    return newSub;
  }

  public updateSubject(id: string, updates: Partial<Subject>): boolean {
    const idx = this.state.subjects.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.state.subjects[idx] = { ...this.state.subjects[idx], ...updates };
    this.saveLocalState();
    setDoc(doc(db, 'subjects', id), this.state.subjects[idx]).catch((err) => {
      console.warn('Firestore update subject note:', err);
    });
    return true;
  }

  // --- Teachers CRUD ---
  public getTeachers(): Teacher[] {
    return [...this.state.teachers];
  }

  public getTeacherById(id: string): Teacher | undefined {
    return this.state.teachers.find((t) => t.id === id);
  }

  public addTeacher(teacherData: (Omit<Teacher, 'id'> & { id?: string }) | Teacher, authorName = 'Administrator'): Teacher {
    const id = teacherData.id || `tch-${teacherData.surname.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const newTeacher: Teacher = { ...teacherData, id, status: 'Active' };
    this.state.teachers.push(newTeacher);
    this.logActivity({
      user: authorName,
      role: 'admin',
      action: `Teacher registered - ${newTeacher.title}`,
      details: `EC ${newTeacher.ecNumber} • Email ${newTeacher.email}`,
    });
    this.saveLocalState();

    setDoc(doc(db, 'teachers', newTeacher.id), newTeacher).catch((err) => {
      console.warn('Firestore teacher write note:', err);
    });

    return newTeacher;
  }

  public updateTeacher(id: string, updates: Partial<Teacher>, authorName = 'Administrator'): boolean {
    const idx = this.state.teachers.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.state.teachers[idx] = { ...this.state.teachers[idx], ...updates };
    this.logActivity({
      user: authorName,
      role: 'admin',
      action: `Teacher profile updated - ${this.state.teachers[idx].title}`,
      details: `Classes & subjects configuration updated`,
    });
    this.saveLocalState();

    setDoc(doc(db, 'teachers', id), this.state.teachers[idx]).catch((err) => {
      console.warn('Firestore teacher update note:', err);
    });

    return true;
  }

  // --- Marks Engine ---
  public getMarks(filters?: {
    classId?: string;
    subjectId?: string;
    term?: string;
    academicYear?: string;
    studentId?: string;
  }): Mark[] {
    let list = [...this.state.marks];
    if (filters?.classId && filters.classId !== 'all') {
      list = list.filter((m) => m.classId === filters.classId);
    }
    if (filters?.subjectId && filters.subjectId !== 'all') {
      list = list.filter((m) => m.subjectId === filters.subjectId);
    }
    if (filters?.term && filters.term !== 'all') {
      list = list.filter((m) => m.term === filters.term);
    }
    if (filters?.academicYear) {
      list = list.filter((m) => m.academicYear === filters.academicYear);
    }
    if (filters?.studentId) {
      list = list.filter((m) => m.studentId === filters.studentId);
    }
    return list;
  }

  public saveMarksBatch(
    items: Array<{
      studentId: string;
      mark: number;
      status?: MarkStatus;
    }>,
    context: {
      classId: string;
      subjectId: string;
      term: 'Term 1' | 'Term 2' | 'Term 3';
      academicYear: string;
      teacherId: string;
      teacherName: string;
    }
  ): { success: boolean; savedCount: number; errors: string[] } {
    const errors: string[] = [];
    let savedCount = 0;

    const subject = this.getSubjectById(context.subjectId);
    const subjectName = subject ? subject.name : 'Subject';
    const schoolClass = this.getClassById(context.classId);
    const className = schoolClass ? schoolClass.name : context.classId;

    const now = new Date().toISOString();

    for (const item of items) {
      if (typeof item.mark !== 'number' || isNaN(item.mark) || item.mark < 0 || item.mark > 100) {
        errors.push(`Invalid mark ${item.mark} for student ${item.studentId}. Must be 0-100.`);
        continue;
      }

      const student = this.getStudentById(item.studentId);
      if (!student) {
        errors.push(`Student with ID ${item.studentId} not found.`);
        continue;
      }

      const { grade, remark } = this.calculateGrade(item.mark);
      const markValue = Math.round(item.mark);

      const existingIdx = this.state.marks.findIndex(
        (m) =>
          m.studentId === item.studentId &&
          m.subjectId === context.subjectId &&
          m.term === context.term &&
          m.academicYear === context.academicYear
      );

      let targetMark: Mark;

      if (existingIdx >= 0) {
        this.state.marks[existingIdx] = {
          ...this.state.marks[existingIdx],
          mark: markValue,
          percentage: markValue,
          grade,
          remark,
          status: item.status || 'Saved',
          teacherId: context.teacherId,
          teacherName: context.teacherName,
          updatedAt: now,
        };
        targetMark = this.state.marks[existingIdx];
      } else {
        const newMark: Mark = {
          id: `mark-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: student.id,
          studentName: student.name,
          surname: student.surname,
          classId: context.classId,
          subjectId: context.subjectId,
          subjectName,
          teacherId: context.teacherId,
          teacherName: context.teacherName,
          term: context.term,
          academicYear: context.academicYear,
          mark: markValue,
          percentage: markValue,
          grade,
          remark,
          status: item.status || 'Saved',
          createdAt: now,
          updatedAt: now,
        };
        this.state.marks.push(newMark);
        targetMark = newMark;
      }

      // Sync individual mark to Firestore
      setDoc(doc(db, 'marks', targetMark.id), targetMark).catch((err) => {
        console.warn('Firestore mark sync note:', err);
      });

      savedCount++;
    }

    if (savedCount > 0) {
      this.logActivity({
        user: context.teacherName,
        role: 'teacher',
        action: `Marks updated - ${className}`,
        details: `${subjectName} • ${context.term} marks entered for ${savedCount} students`,
      });
      this.saveLocalState();
    }

    return {
      success: errors.length === 0,
      savedCount,
      errors,
    };
  }

  public updateMarkStatus(markId: string, status: MarkStatus, authorName = 'Administrator'): boolean {
    const mark = this.state.marks.find((m) => m.id === markId);
    if (!mark) return false;
    mark.status = status;
    mark.updatedAt = new Date().toISOString();
    this.logActivity({
      user: authorName,
      role: 'admin',
      action: `Mark status changed to ${status}`,
      details: `${mark.studentName} ${mark.surname} • ${mark.subjectName}`,
    });
    this.saveLocalState();

    setDoc(doc(db, 'marks', markId), mark).catch((err) => {
      console.warn('Firestore status write note:', err);
    });

    return true;
  }

  // --- Student Attendance Summary ---
  public getAttendanceSummary(studentId: string) {
    const totalDays = 65;
    const num = parseInt(studentId.replace(/\D/g, ''), 10) || 1;
    const presentDays = Math.min(totalDays, 60 + (num % 6));
    const rate = Math.round((presentDays / totalDays) * 1000) / 10;
    return {
      present: presentDays,
      total: totalDays,
      rate: `${rate}%`,
    };
  }

  // --- Dynamic Class Position Calculation ---
  public calculateClassPosition(
    studentId: string,
    classId: string,
    term: 'Term 1' | 'Term 2' | 'Term 3' = this.state.settings.currentTerm,
    academicYear: string = this.state.settings.currentAcademicYear
  ): { position: number; total: number; label: string } {
    const classmates = this.getStudents({ classId, status: 'Active' });
    if (classmates.length === 0) return { position: 0, total: 0, label: '—' };

    const scored = classmates
      .map((st) => {
        const summary = this.getStudentPerformanceSummary(st.id, term, academicYear);
        return {
          studentId: st.id,
          average: summary.average,
          count: summary.subjectCount,
        };
      })
      .filter((s) => s.count > 0);

    if (scored.length === 0) return { position: 0, total: classmates.length, label: '—' };

    scored.sort((a, b) => b.average - a.average);
    const rankIndex = scored.findIndex((s) => s.studentId === studentId);
    if (rankIndex === -1) {
      return { position: 0, total: classmates.length, label: '—' };
    }
    const rank = rankIndex + 1;
    return {
      position: rank,
      total: classmates.length,
      label: `${rank} of ${classmates.length}`,
    };
  }

  // --- Dynamic Report Card Generator ---
  public generateReportCard(
    studentId: string,
    term: 'Term 1' | 'Term 2' | 'Term 3' = this.state.settings.currentTerm,
    academicYear: string = this.state.settings.currentAcademicYear
  ): ReportCard | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const marks = this.getMarks({ studentId, term, academicYear });

    const subjectRecords = marks.map((m) => ({
      subjectId: m.subjectId,
      subjectName: m.subjectName,
      percentage: m.percentage,
      grade: m.grade,
      remark: m.remark,
      teacherName: m.teacherName,
    }));

    const totalScore = marks.reduce((sum, m) => sum + m.percentage, 0);
    const averagePercentage = marks.length > 0 ? Math.round((totalScore / marks.length) * 10) / 10 : 0;
    const overallGradeInfo = this.calculateGrade(averagePercentage);

    let teacherRemarks = 'Good performance. Keep it up and continue to work hard.';
    if (averagePercentage >= 80) {
      teacherRemarks = 'An outstanding academic performance. Has shown consistent discipline and diligence.';
    } else if (averagePercentage >= 65) {
      teacherRemarks = 'Good performance. Keep it up and continue to work hard.';
    } else if (averagePercentage >= 50) {
      teacherRemarks = 'Fair progress made this term. Needs to double efforts in weaker subjects.';
    } else if (marks.length > 0) {
      teacherRemarks = 'Performance is below expected standard. Remedial lessons strongly recommended.';
    } else {
      teacherRemarks = 'Marks pending evaluation.';
    }

    const headmasterRemarks =
      averagePercentage >= 75
        ? 'A commendable result reflecting Dadaya High School ideals of Discipline & Excellence.'
        : averagePercentage >= 50
        ? 'Satisfactory term. Encourage greater focus in subsequent terms.'
        : 'More commitment required to achieve school standards.';

    const positionInfo = this.calculateClassPosition(student.id, student.classId, term, academicYear);
    const attendance = this.getAttendanceSummary(student.id);

    const classTeacher = this.getTeachers().find((t) => t.assignedClassIds.includes(student.classId));
    const classTeacherName = classTeacher ? `${classTeacher.title}` : 'Mr. Gunda';

    return {
      id: `rc-${student.id}-${term.replace(/\s+/g, '')}-${academicYear.replace(/[/]/g, '-')}`,
      studentId: student.id,
      studentName: student.name,
      surname: student.surname,
      className: student.className,
      term,
      academicYear,
      subjectRecords,
      totalScore,
      averagePercentage,
      overallGrade: overallGradeInfo.grade,
      teacherRemarks,
      headmasterRemarks,
      generatedDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Published',
      classPosition: positionInfo.label,
      rank: positionInfo.position,
      cohortTotal: positionInfo.total,
      attendancePresent: attendance.present,
      attendanceTotal: attendance.total,
      attendanceRate: attendance.rate,
      classTeacherName,
      headmasterName: this.state.settings.headmasterName || 'Dr. C. G. Mugabe',
      schoolMotto: 'Education for Life • Imfundo Yempilo • Dzidzo Youpenyu',
      isComplete: subjectRecords.length >= 3,
    };
  }

  // --- Reports Dashboard Statistics ---
  public getReportsDashboardStats(filter?: {
    classId?: string;
    term?: 'Term 1' | 'Term 2' | 'Term 3';
    academicYear?: string;
    assignedClassIds?: string[];
  }) {
    const currentTerm = filter?.term || this.state.settings.currentTerm;
    const currentYear = filter?.academicYear || this.state.settings.currentAcademicYear;

    let targetStudents = this.getStudents({ status: 'Active' });
    if (filter?.classId && filter.classId !== 'all') {
      targetStudents = targetStudents.filter((s) => s.classId === filter.classId);
    } else if (filter?.assignedClassIds && filter.assignedClassIds.length > 0) {
      targetStudents = targetStudents.filter((s) => filter.assignedClassIds!.includes(s.classId));
    }

    const allMarks = this.getMarks({ term: currentTerm, academicYear: currentYear });

    let completedCount = 0;
    let pendingCount = 0;
    let awaitingApprovalCount = 0;

    targetStudents.forEach((st) => {
      const stMarks = allMarks.filter((m) => m.studentId === st.id);
      if (stMarks.length === 0) {
        pendingCount++;
      } else {
        const hasUnapproved = stMarks.some((m) => m.status !== 'Approved');
        if (hasUnapproved) {
          awaitingApprovalCount++;
        }
        if (stMarks.length >= 3) {
          completedCount++;
        } else {
          pendingCount++;
        }
      }
    });

    return {
      totalReports: targetStudents.length,
      completedReports: completedCount,
      pendingReports: pendingCount,
      awaitingApproval: awaitingApprovalCount,
      term: currentTerm,
      academicYear: currentYear,
    };
  }

  // --- Student Performance Aggregation ---
  public getStudentPerformanceSummary(
    studentId: string,
    term: 'Term 1' | 'Term 2' | 'Term 3' = this.state.settings.currentTerm,
    academicYear: string = this.state.settings.currentAcademicYear
  ) {
    const marks = this.getMarks({ studentId, term, academicYear });
    const total = marks.reduce((sum, m) => sum + m.percentage, 0);
    const average = marks.length > 0 ? Math.round(total / marks.length) : 0;

    let excellentCount = 0;
    let goodCount = 0;
    let fairCount = 0;
    let needsImprovementCount = 0;

    marks.forEach((m) => {
      const g = this.calculateGrade(m.percentage);
      if (g.category === 'Excellent') excellentCount++;
      else if (g.category === 'Good') goodCount++;
      else if (g.category === 'Fair') fairCount++;
      else needsImprovementCount++;
    });

    return {
      marks,
      totalMarks: total,
      average,
      subjectCount: marks.length,
      categories: {
        excellent: excellentCount,
        good: goodCount,
        fair: fairCount,
        needsImprovement: needsImprovementCount,
      },
    };
  }

  // --- Activity Logs ---
  public logActivity(entry: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ...entry,
    };
    this.state.activityLogs.unshift(newLog);
    if (this.state.activityLogs.length > 50) {
      this.state.activityLogs.pop();
    }

    setDoc(doc(db, 'activityLogs', newLog.id), newLog).catch((err) => {
      console.warn('Firestore log write note:', err);
    });
  }

  public getActivityLogs(limit = 20): ActivityLog[] {
    return this.state.activityLogs.slice(0, limit);
  }

  // --- Settings ---
  public getSettings(): SchoolSettings {
    return { ...this.state.settings };
  }

  public updateSettings(newSettings: Partial<SchoolSettings>, authorName = 'Administrator'): SchoolSettings {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.logActivity({
      user: authorName,
      role: 'admin',
      action: 'School portal settings updated',
      details: 'Academic calendar / grade boundaries changed',
    });
    this.saveLocalState();

    setDoc(doc(db, 'settings', 'config'), this.state.settings).catch((err) => {
      console.warn('Firestore settings update note:', err);
    });

    return this.state.settings;
  }

  // --- Demo Reset ---
  public resetToDemoData(): void {
    this.state = {
      students: initialStudents,
      teachers: initialTeachers,
      classes: initialClasses,
      subjects: initialSubjects,
      marks: initialMarks,
      settings: initialSettings,
      activityLogs: [
        {
          id: `act-reset-${Date.now()}`,
          user: 'System',
          role: 'admin',
          action: 'Demo dataset restored to official Dadaya baseline',
          details: 'Pre-seeded reference students, classes, and marks',
          timestamp: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    };
    this.saveLocalState();
    this.seedFirestore();
  }
}

export const dataService = new DataService();
export default dataService;
