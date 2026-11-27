import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  UploadCloud,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { formatBytes, formatSpeed, formatDuration } from '../../utils/formatters';

export const UploadManager: React.FC = () => {
  const {
    lang,
    uploadTasks,
    uploadQueueOpen,
    setUploadQueueOpen,
    togglePauseUpload,
    cancelUpload,
    simulateResilienceGlitch,
  } = useStorage();

  const [minimized, setMinimized] = useState(false);
  const isAr = lang === 'ar';

  if (!uploadQueueOpen || uploadTasks.length === 0) return null;

  const activeCount = uploadTasks.filter(t => t.status === 'uploading' || t.status === 'hashing').length;
  const completedCount = uploadTasks.filter(t => t.status === 'completed' || t.status === 'deduplicated').length;

  return (
    <aside aria-label="Upload Queue Manager" className="fixed bottom-[calc(156px+env(safe-area-inset-bottom))] rtl:left-4 ltr:right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200">
      
      {/* Header Bar */}
      <div
        onClick={() => setMinimized(!minimized)}
        className="p-3.5 bg-slate-900 text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <UploadCloud className="w-4 h-4 text-blue-400" />
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span>{isAr ? 'مدير الرفع المقسم (tus/S3 Resumable)' : 'Multipart Upload Queue'}</span>
            <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">
              {completedCount}/{uploadTasks.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(!minimized);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
          >
            {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUploadQueueOpen(false);
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {!minimized && (
        <div className="p-3 max-h-72 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80">
          
          {/* Resilience Glitch Test Button */}
          {activeCount > 0 && (
            <div className="pt-1 pb-1">
              <button
                onClick={simulateResilienceGlitch}
                className="w-full py-1.5 px-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAr ? 'اختبار انقطاع الاتصال والتعافي التلقائي (Auto-Resume)' : 'Test Network Drop & Auto-Resume'}</span>
              </button>
            </div>
          )}

          {uploadTasks.map(task => {
            const percent = task.totalBytes > 0 ? Math.round((task.uploadedBytes / task.totalBytes) * 100) : 0;

            return (
              <div key={task.id} className="pt-2.5 first:pt-0 text-xs">
                
                {/* Filename & status */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate flex-1" title={task.name}>
                    {task.name}
                  </div>
                  
                  {/* Status Badges */}
                  <div className="shrink-0 flex items-center gap-1">
                    {task.status === 'deduplicated' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        <span>{isAr ? 'فوري (0s) مطابقة' : 'Instant Dedup'}</span>
                      </span>
                    )}

                    {task.status === 'completed' && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                        <span>{isAr ? 'مكتمل' : 'Uploaded'}</span>
                      </span>
                    )}

                    {task.status === 'uploading' && (
                      <button
                        onClick={() => togglePauseUpload(task.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={isAr ? 'إيقاف مؤقت' : 'Pause'}
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {task.status === 'paused' && (
                      <button
                        onClick={() => togglePauseUpload(task.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title={isAr ? 'استئناف' : 'Resume'}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => cancelUpload(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title={isAr ? 'إلغاء' : 'Cancel'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden my-1.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      task.status === 'deduplicated'
                        ? 'bg-emerald-500'
                        : task.status === 'completed'
                        ? 'bg-blue-600'
                        : task.status === 'paused'
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Sub details: chunks, speed, eta */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>
                    {task.status === 'deduplicated'
                      ? (isAr ? 'توفير 100% من باقة العميل' : '100% bandwidth saved')
                      : `${formatBytes(task.uploadedBytes, 1, isAr)} / ${formatBytes(task.totalBytes, 1, isAr)} (${percent}%)`}
                  </span>

                  {task.status === 'uploading' && (
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                      <span>{formatSpeed(task.speedBytesPerSec, isAr)}</span>
                      <span>·</span>
                      <span>{isAr ? `جزء ${task.chunksCompleted}/${task.chunksTotal}` : `Chunk ${task.chunksCompleted}/${task.chunksTotal}`}</span>
                    </div>
                  )}

                  {task.status === 'paused' && (
                    <span className="text-amber-500 font-semibold">
                      {task.errorMessage ? (isAr ? 'انقطاع شبكة (بانتظار الاستئناف)' : 'Network Drop (Waiting)') : (isAr ? 'موقوف مؤقتاً' : 'Paused')}
                    </span>
                  )}
                </div>

              </div>
            );
          })}

        </div>
      )}

    </aside>
  );
};
