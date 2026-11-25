import React from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Camera,
  Wifi,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Film,
  Sparkles,
  Smartphone,
  Layers,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const MediaBackupView: React.FC = () => {
  const {
    lang,
    mediaBackupSettings,
    updateMediaBackup,
    triggerManualMediaSync,
    files,
    setPreviewFile,
  } = useStorage();

  const isAr = lang === 'ar';
  const mediaFiles = files.filter(f => (f.type === 'image' || f.type === 'video') && !f.isTrash);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
      
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-amber-700 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-200 text-xs font-mono font-semibold uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>{isAr ? 'النسخ الاحتياطي التلقائي للذكريات' : 'Continuous Media Backup'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAr ? 'مزامنة الكاميرا والوسائط بالخلفية' : 'Camera Roll & Auto-Sync Engine'}
          </h2>

          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            {isAr
              ? 'تتم مزامنة صورك وفيديوهاتك التذكارية في الخلفية عبر أطر العمل الأصلية Android WorkManager و iOS BackgroundTasks دون استنزاف البطارية أو إغلاق التطبيق، مع ضغط ذكي فائق الدقة.'
              : 'Seamless background backup powered by Android WorkManager and iOS BackgroundTasks. Preserves battery and storage with smart WebP/HEIC edge compression.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-amber-100">
            <span>{isAr ? `إجمالي الصور المتزامنة: ${mediaBackupSettings.totalSyncedCount}` : `Total Synced: ${mediaBackupSettings.totalSyncedCount} items`}</span>
            <span>·</span>
            <span>{isAr ? 'توليد المصغرات: Edge CDN Thumbnails' : 'Edge CDN Thumbnails'}</span>
          </div>
        </div>
      </div>

      {/* Sync Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr ? 'إعدادات المزامنة التلقائية والشبكة' : 'Backup Rules & Optimization'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'تحكم في استهلاك باقة الإنترنت والشحن' : 'Fine-tune mobile data and battery preservation'}
            </p>
          </div>

          <button
            onClick={triggerManualMediaSync}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-xs active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'مزامنة فورية الآن' : 'Sync Now'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Wi-Fi Only */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'شبكة Wi-Fi فقط' : 'Wi-Fi Only'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isAr ? 'توفير باقة بيانات الجوال' : 'Avoid cellular usage'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={mediaBackupSettings.wifiOnly}
              onChange={e => updateMediaBackup({ wifiOnly: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded"
            />
          </div>

          {/* Charging Only */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'أثناء الشحن فقط' : 'While Charging Only'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isAr ? 'الحفاظ على عمر البطارية' : 'Protect device battery'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={mediaBackupSettings.chargingOnly}
              onChange={e => updateMediaBackup({ chargingOnly: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded"
            />
          </div>

          {/* Smart Compression */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'الضغط الذكي (WebP)' : 'Smart WebP/HEIC'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isAr ? 'توفير 40% من المساحة' : 'Save 40% space'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={mediaBackupSettings.smartCompression}
              onChange={e => updateMediaBackup({ smartCompression: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded"
            />
          </div>

          {/* Include Videos */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Film className="w-4 h-4 text-purple-500" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'تضمين الفيديوهات' : 'Include Videos'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isAr ? 'رفع مقاطع 4K ProRes' : 'Upload 4K clips'}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={mediaBackupSettings.includeVideos}
              onChange={e => updateMediaBackup({ includeVideos: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded"
            />
          </div>

        </div>
      </div>

      {/* Media Gallery Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            {isAr ? 'الوسائط المتزامنة في السحابة' : 'Synced Camera Memories'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {isAr ? `آخر مزامنة: ${formatDate(mediaBackupSettings.lastSyncTimestamp, isAr)}` : `Last Sync: ${formatDate(mediaBackupSettings.lastSyncTimestamp, isAr)}`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {mediaFiles.map(file => (
            <div
              key={file.id}
              onClick={() => setPreviewFile(file)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 cursor-pointer shadow-xs"
            >
              <img
                src={file.thumbnailUrl || '/assets/aistudio/_________________20261107_140807______425b22ac.png'}
                alt={file.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white text-[11px]">
                <div className="font-semibold truncate">{file.name}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mt-0.5">
                  <span className="uppercase">{file.extension}</span>
                  <span>{file.type === 'video' ? '4K Video' : 'Original'}</span>
                </div>
              </div>

              {file.type === 'video' && (
                <div className="absolute top-2 rtl:left-2 ltr:right-2 p-1 rounded-md bg-black/60 text-white backdrop-blur-xs">
                  <Film className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
