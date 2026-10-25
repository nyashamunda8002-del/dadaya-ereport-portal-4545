import React, { useState } from 'react';
import dataService from '../../services/dataService';
import { History, Search, Shield, CheckCircle2, User, Clock } from 'lucide-react';

export const AdminActivityLogsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const logs = dataService.getActivityLogs(50).filter((l) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight">
            System Audit & Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable tracking of marks entries, credentials updates, and administrative events.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-emerald-50/20 transition-colors flex items-start gap-3.5">
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  log.role === 'admin'
                    ? 'bg-amber-100 text-amber-800'
                    : log.role === 'teacher'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {log.role === 'admin' ? (
                  <Shield className="w-4 h-4" />
                ) : log.role === 'teacher' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">{log.action}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                {log.details && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    Authorized User: {log.user}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded capitalize">
                    Role: {log.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogsView;
