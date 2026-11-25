import React from 'react';
import { useStorage } from '../../context/StorageContext';
import { formatBytes } from '../../utils/formatters';
import { HardDriveDownload, WifiOff } from 'lucide-react';

interface OfflineQuotaBarProps {
  onSelectOffline?: () => void;
}

export const OfflineQuotaBar: React.FC<OfflineQuotaBarProps> = ({ onSelectOffline }) => {
  const {
    lang,
    offlineCacheStats,
    isOfflineMode,
    setActiveTab,
    setActiveCategory,
  } = useStorage();

  const isAr = lang === 'ar';
  const { usedBytes, quotaBytes, cachedFilesCount, percentUsed } = offlineCacheStats;

  const isHigh = percentUsed >= 90;
  const isModerate = percentUsed >= 75 && !isHigh;

  const barColorClass = isHigh
    ? 'bg-[#B91C1C]'
    : isModerate
      ? 'bg-[#A38540]'
      : 'bg-[#4E115A] dark:bg-purple-400';

  const handleOpenOffline = () => {
    setActiveTab('files');
    setActiveCategory('offline');
    if (onSelectOffline) onSelectOffline();
  };

  return (
    <button
      type="button"
      onClick={handleOpenOffline}
      className="w-full text-start bg-white dark:bg-slate-800/70 hover:bg-[#F5EFF7]/70 dark:hover:bg-slate-800 rounded-xl p-2.5 border border-[#DCD3DF] dark:border-slate-700/70 transition-colors cursor-pointer space-y-1.5 shadow-2xs"
      title={
        isAr
          ? 'عرض الملفات المحفوظة للعمل دون اتصال وإدارة مساحة الكاش'
          : 'View offline cached files and manage local cache quota'
      }
      aria-label={isAr ? 'حصة التخزين دون اتصال للملفات المخزنة مؤقتاً' : 'Offline storage quota for cached files'}
    >
      {/* Compact Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isOfflineMode ? (
            <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <HardDriveDownload className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300 shrink-0" />
          )}
          <span className="text-[11px] font-bold text-[#1E1E24] dark:text-slate-200 truncate">
            {isAr ? 'حصة التخزين دون اتصال' : 'Offline Cache Quota'}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold shrink-0 ${
            isHigh
              ? 'text-[#B91C1C]'
              : isModerate
                ? 'text-[#A38540]'
                : 'text-[#4E115A] dark:text-purple-300'
          }`}
        >
          {percentUsed.toFixed(1)}%
        </span>
      </div>

      {/* Small Progress Bar */}
      <div
        className="w-full h-1.5 bg-[#EFE7F2] dark:bg-slate-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percentUsed)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
          style={{ width: `${Math.max(usedBytes > 0 ? 3 : 0, Math.min(100, percentUsed))}%` }}
        />
      </div>

      {/* Compact Metrics Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#6E6A75] dark:text-slate-400">
        <span>
          {formatBytes(usedBytes, 1, isAr)} / {formatBytes(quotaBytes, 0, isAr)}
        </span>
        <span className="text-[10px] font-sans font-semibold text-[#4E115A] dark:text-purple-300">
          {cachedFilesCount} {isAr ? 'ملفات' : cachedFilesCount === 1 ? 'file' : 'files'}
        </span>
      </div>
    </button>
  );
};
