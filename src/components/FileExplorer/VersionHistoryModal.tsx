import React from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  X,
  History,
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  HardDrive,
  FileText,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';

export const VersionHistoryModal: React.FC = () => {
  const {
    lang,
    versionHistoryFile,
    setVersionHistoryFile,
    restoreFileVersion,
    currentPlan,
  } = useStorage();

  if (!versionHistoryFile) return null;
  const isAr = lang === 'ar';
  const versions = versionHistoryFile.versions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? 'سجل النسخ السابقة والاسترجاع اللحظي' : 'Point-in-Time Version History'}
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                {versionHistoryFile.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setVersionHistoryFile(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-3 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300 font-medium">
          <span>
            {isAr
              ? `صلاحية الاحتفاظ بالنسخ: ${currentPlan.versionRetentionDays} يوماً`
              : `Retention Window: ${currentPlan.versionRetentionDays} days`}
          </span>
          <span className="font-mono text-[11px]">
            {versions.length} {isAr ? 'نسخ محفوظة' : 'snapshots stored'}
          </span>
        </div>

        {/* Versions Timeline */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              {isAr ? 'لا توجد نسخ سابقة إضافية لهذا الملف حتى الآن' : 'No previous versions recorded for this file yet.'}
            </div>
          ) : (
            <div className="relative border-r rtl:border-r ltr:border-l border-slate-200 dark:border-slate-800 space-y-4 rtl:pr-4 ltr:pl-4">
              {versions.map((ver, idx) => {
                const isCurrent = idx === 0;

                return (
                  <div
                    key={ver.id}
                    className={`relative p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    {/* Timeline bullet dot */}
                    <div
                      className={`absolute top-4 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        isCurrent
                          ? 'bg-blue-600 rtl:-right-[22px] ltr:-left-[22px]'
                          : 'bg-slate-300 dark:bg-slate-600 rtl:-right-[22px] ltr:-left-[22px]'
                      }`}
                    />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {ver.versionNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                            {isAr ? 'النسخة الحالية' : 'Current'}
                          </span>
                        )}
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => {
                            restoreFileVersion(versionHistoryFile.id, ver.id);
                            setVersionHistoryFile(null);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isAr ? 'استعادة' : 'Restore'}</span>
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {ver.changeNote}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{formatDate(ver.modifiedAt, isAr)}</span>
                      <span>{formatBytes(ver.sizeBytes, 1, isAr)}</span>
                      <span className="truncate max-w-[120px]">{ver.modifiedBy}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-end">
          <button
            onClick={() => setVersionHistoryFile(null)}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
