import React, { useState, useEffect } from 'react';
import dataService from '../../services/dataService';
import { getFirebaseStatus, initFirebase } from '../../services/firebase';
import { SchoolSettings, GradeBoundary } from '../../types';
import {
  Save,
  CheckCircle2,
  Database,
  RotateCcw,
  Sliders,
  Building,
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  HardDrive,
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SchoolSettings>(dataService.getSettings());
  const [firebaseStatus, setFirebaseStatus] = useState(getFirebaseStatus());
  const [notification, setNotification] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => dataService.getIsOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => dataService.getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    return dataService.subscribe(() => {
      setIsOnline(dataService.getIsOnline());
      setPendingSyncCount(dataService.getPendingSyncCount());
    });
  }, []);

  const handleSyncQueue = async () => {
    setIsSyncing(true);
    const res = await dataService.syncPendingOfflineQueue();
    setIsSyncing(false);
    if (res.synced > 0) {
      setNotification(`Successfully synchronized ${res.synced} offline record(s) to Cloud Firestore!`);
    } else if (res.failed > 0) {
      setNotification(`Sync failed for ${res.failed} record(s). Check your internet connection.`);
    } else {
      setNotification('All offline records are already synchronized with Cloud Firestore.');
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const [fbConfig, setFbConfig] = useState({
    apiKey: '',
    projectId: firebaseStatus.projectId || 'distributed-rig-z9v0l',
    authDomain: '',
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateSettings(settings);
    setNotification('School settings updated and saved.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBoundaryChange = (index: number, field: keyof GradeBoundary, val: any) => {
    const updated = [...settings.gradeBoundaries];
    updated[index] = { ...updated[index], [field]: val };
    setSettings({ ...settings, gradeBoundaries: updated });
  };

  const handleTestFirebase = () => {
    const res = initFirebase({
      apiKey: fbConfig.apiKey || 'demo-api-key',
      projectId: fbConfig.projectId,
      authDomain: fbConfig.authDomain || `${fbConfig.projectId}.firebaseapp.com`,
    });
    setNotification(res.message);
    setFirebaseStatus(getFirebaseStatus());
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the official Dadaya High School baseline dataset? This will reset students, classes, and marks back to standard showcase values.'
      )
    ) {
      dataService.resetToDemoData();
      setSettings(dataService.getSettings());
      setNotification('Dataset successfully reset to official Dadaya baseline.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B63] tracking-tight">
            Institutional Settings & Database
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure school metadata, academic terms, grading scales, and Firebase connectivity.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetDemo}
          className="flex items-center gap-2 px-4 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Dataset</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 text-[#082B63] text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#1557B0]" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Form: General School Information */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#082B63] uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1557B0]" />
            <span>School Identification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School Name</label>
              <input
                type="text"
                required
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motto</label>
              <input
                type="text"
                required
                value={settings.motto}
                onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-semibold focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headmaster Name</label>
              <input
                type="text"
                required
                value={settings.headmasterName}
                onChange={(e) => setSettings({ ...settings, headmasterName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Active Term</label>
              <select
                value={settings.currentTerm}
                onChange={(e) => setSettings({ ...settings, currentTerm: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Academic Year</label>
              <input
                type="text"
                value={settings.currentAcademicYear}
                onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Grade Boundaries Config */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#082B63] uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#1557B0]" />
            <span>Grading Scale & Performance Categories</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[#082B63] uppercase text-[11px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Min Mark</th>
                  <th className="py-2.5 px-3">Max Mark</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Official Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settings.gradeBoundaries.map((b, idx) => (
                  <tr key={b.grade}>
                    <td className="py-2 px-3 font-bold text-[#082B63]">{b.grade}</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={b.minMark}
                        onChange={(e) => handleBoundaryChange(idx, 'minMark', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={b.maxMark}
                        onChange={(e) => handleBoundaryChange(idx, 'maxMark', Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                      />
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-700">{b.category}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={b.remark}
                        onChange={(e) => handleBoundaryChange(idx, 'remark', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#1557B0] focus:outline-hidden"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Institutional Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Firebase Database Connection Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <h2 className="text-xs font-mono font-bold text-[#082B63] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1557B0]" />
            <span>Cloud Firestore Database Connection</span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Cloud Firestore Synchronized</span>
          </div>
        </div>

        {/* Database direct links banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-slate-900 space-y-3 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Database Identifier</div>
              <div className="text-xs sm:text-sm font-bold text-[#082B63] break-all">
                ai-studio-dadayahighschool-fc9a791d-1c21-4ba8-8ebb-e831db4a52bb
              </div>
            </div>
            <div className="text-xs text-slate-600">
              Project: <span className="font-mono text-[#1557B0] font-semibold">distributed-rig-z9v0l</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <a
              href="https://console.firebase.google.com/project/distributed-rig-z9v0l/firestore/databases/ai-studio-dadayahighschool-fc9a791d-1c21-4ba8-8ebb-e831db4a52bb/data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1557B0] hover:bg-[#082B63] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              <span>Open Firebase Firestore Console</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://console.firebase.google.com/project/distributed-rig-z9v0l/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors shadow-xs"
            >
              <span>View Security Rules</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project ID</label>
            <input
              type="text"
              readOnly
              value={fbConfig.projectId}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Database ID</label>
            <input
              type="text"
              readOnly
              value={firebaseStatus.databaseId || 'ai-studio-dadayahighschool-fc9a791d-1c21-4ba8-8ebb-e831db4a52bb'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-700 truncate"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleTestFirebase}
              className="w-full py-2 px-4 bg-[#1557B0] hover:bg-[#082B63] text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Database Connection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline Persistence & Synchronization Queue Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <h2 className="text-xs font-mono font-bold text-[#082B63] uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#1557B0]" />
            <span>Continuous Offline Ledger & Sync Queue</span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700">Station Connected · Live Sync</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span className="text-amber-700">Station Offline · Local Ledger</span>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          The Dadaya High School portal is Progressive Web App (PWA) and offline-enabled. When internet connectivity is unavailable, students can continue enrolling without disruption. Records are saved locally in persistent offline storage (IndexedDB & LocalStorage) with assigned candidate numbers and will automatically upload to Cloud Firestore as soon as internet reconnects.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Pending Offline Records:</span>
              <span className="text-xs font-bold text-[#082B63] tabular-nums">
                {pendingSyncCount} record{pendingSyncCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-sans">
              {pendingSyncCount === 0
                ? 'All student enrollments and system records are fully synced with the cloud.'
                : `${pendingSyncCount} student record(s) queued on this machine awaiting cloud sync.`}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncQueue}
            disabled={isSyncing || pendingSyncCount === 0 || !isOnline}
            className="px-4 py-2 bg-[#1557B0] hover:bg-[#082B63] disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Records...' : 'Synchronize Queued Records Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsView;
