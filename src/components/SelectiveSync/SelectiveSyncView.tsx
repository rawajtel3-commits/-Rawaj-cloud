import React from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  RefreshCw,
  HardDrive,
  Cloud,
  CheckCircle2,
  Folder,
  WifiOff,
  GitFork,
  Database,
  Cpu,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export const SelectiveSyncView: React.FC = () => {
  const {
    lang,
    folders,
    files,
    toggleFolderSync,
    toggleOfflineSync,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';

  // Calculate local disk savings: files that are NOT pinned locally (cloud only on-demand virtual)
  const virtualFiles = files.filter(f => !f.isOffline && !f.isTrash);
  const totalSavedBytes = virtualFiles.reduce((acc, f) => acc + f.sizeBytes, 0) + 125 * 1024 * 1024 * 1024; // Base demo ~125GB saved!

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-sky-200 text-xs font-mono font-semibold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? 'محرك المزامنة الذكي وفض التعارضات' : 'Selective Sync & Conflict Engine'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAr ? 'المزامنة الانتقائية والملفات عند الطلب' : 'Selective Sync & On-Demand Virtual Files'}
          </h2>

          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            {isAr
              ? 'تصفح ملايين الملفات السحابية مباشرة دون شغل أي مساحة على قرص جهازك (0 KB على القرص الصلب) عبر تقنية الملفات الافتراضية Virtual On-Demand، مع إمكانية تثبيت المجلدات الحيوية للعمل دون اتصال بالإنترنت.'
              : 'Browse terabytes of cloud files with zero local disk footprint (0 KB On-Demand). Pin critical folders locally with SQLite/Isar cache and vector-clock conflict resolution.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-sky-100">
            <span className="font-bold text-emerald-300">
              {isAr ? `وفرت سعة تخزين لجهازك: ${formatBytes(totalSavedBytes, 1, isAr)}` : `Saved Local Device Space: ${formatBytes(totalSavedBytes, 1, isAr)}`}
            </span>
            <span>·</span>
            <span>{isAr ? 'فض التعارض: Vector Clock / Forking' : 'Conflict Mode: Vector Clock'}</span>
          </div>
        </div>
      </div>

      {/* Engine Architecture Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isAr ? 'الملفات عند الطلب (0 KB)' : 'Virtual On-Demand'}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {virtualFiles.length + 1480} {isAr ? 'ملف سحابي' : 'virtual files'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isAr ? 'الكاش المحلي (SQLite/Isar)' : 'Local SQLite Cache'}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              2.4 GB {isAr ? 'مثبت للكاش' : 'pinned cache'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isAr ? 'فض التعارضات المتزامنة' : 'Conflict Resolution'}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {isAr ? 'تلقائي (Zero Overwrite)' : 'Forking on Clash'}
            </div>
          </div>
        </div>

      </div>

      {/* Folders Selective Sync Toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
            {isAr ? 'المجلدات وحالة المزامنة المحلية' : 'Folder Sync Status & Storage Mode'}
          </h3>
          <span className="text-xs text-slate-500">
            {isAr ? 'اختر المجلدات التي ترغب بالاحتفاظ بنسخة منها دون اتصال' : 'Toggle folders for full offline availability'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {folders.map(folder => (
            <div key={folder.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-850 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${folder.color || '#0284C7'}20` }}
                >
                  <Folder className="w-5 h-5" style={{ color: folder.color || '#0284C7' }} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {folder.name}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                    <span>
                      {folder.isSyncPinned
                        ? (isAr ? 'مثبت محلياً (جاهز للعمل دون اتصال)' : 'Pinned Offline (Full Local Copy)')
                        : (isAr ? 'سحابي عند الطلب (0 KB على جهازك)' : 'Cloud On-Demand (0 KB on device)')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                  folder.isSyncPinned
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                }`}>
                  {folder.isSyncPinned ? (isAr ? 'متاح Offline' : 'Offline Ready') : (isAr ? 'سحابي On-Demand' : 'On-Demand')}
                </span>

                <button
                  onClick={() => toggleFolderSync(folder.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    folder.isSyncPinned
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {folder.isSyncPinned ? (isAr ? 'تحويل لسحابي فقط' : 'Make Cloud-Only') : (isAr ? 'تثبيت محلياً' : 'Pin Locally')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
