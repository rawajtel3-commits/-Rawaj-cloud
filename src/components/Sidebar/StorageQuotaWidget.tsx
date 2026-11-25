import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { formatBytes } from '../../utils/formatters';
import { Sparkles, AlertTriangle, Layers, Info, PieChart } from 'lucide-react';

interface StorageQuotaWidgetProps {
  onUpgradeClick?: () => void;
}

export const StorageQuotaWidget: React.FC<StorageQuotaWidgetProps> = ({ onUpgradeClick }) => {
  const {
    lang,
    quota,
    currentPlan,
    setPlansModalOpen,
    setActiveTab,
    flexWalletBalance,
  } = useStorage();

  const [activeHoverSegment, setActiveHoverSegment] = useState<string | null>(null);

  const isAr = lang === 'ar';
  const usedBytes = quota.usedBytes;
  const totalBytes = quota.totalBytes;
  const freeBytes = Math.max(0, totalBytes - usedBytes);
  const percentUsed = Math.min(100, Math.max(0, (usedBytes / totalBytes) * 100));

  // Threshold alerts
  const isCritical = percentUsed >= 90;
  const isWarning = percentUsed >= 75 && !isCritical;

  // Donut geometry constants
  const size = 96;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment lengths
  const { images, videos, documents, archives, other } = quota.breakdown;
  const otherCombined = archives + other;

  const categories = [
    {
      id: 'images',
      labelAr: 'صور',
      labelEn: 'Images',
      bytes: images,
      color: '#F59E0B', // Amber
      textColor: 'text-amber-500',
      bgColor: 'bg-amber-500',
    },
    {
      id: 'videos',
      labelAr: 'فيديو',
      labelEn: 'Videos',
      bytes: videos,
      color: '#0284C7', // Sky / Blue
      textColor: 'text-sky-500',
      bgColor: 'bg-sky-500',
    },
    {
      id: 'documents',
      labelAr: 'مستندات',
      labelEn: 'Docs',
      bytes: documents,
      color: '#10B981', // Emerald
      textColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
    },
    {
      id: 'other',
      labelAr: 'أخرى',
      labelEn: 'Other',
      bytes: otherCombined,
      color: '#8B5CF6', // Purple
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-500',
    },
  ];

  // Prepare segments with cumulative offsets
  let cumulativeLength = 0;
  const segments = categories.map(cat => {
    const fraction = totalBytes > 0 ? cat.bytes / totalBytes : 0;
    const strokeDash = fraction * circumference;
    const offset = -cumulativeLength;
    cumulativeLength += strokeDash;
    return {
      ...cat,
      strokeDash,
      offset,
      percent: (fraction * 100).toFixed(1),
    };
  });

  const handleUpgrade = () => {
    setPlansModalOpen(true);
    if (onUpgradeClick) onUpgradeClick();
  };

  return (
    <div className="bg-[#F5EFF7] dark:bg-slate-800/60 rounded-2xl p-3.5 border border-[#DCD3DF] dark:border-slate-700/60 space-y-3 transition-colors shadow-2xs">
      
      {/* Header: Plan Name & Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
            {isAr ? currentPlan.nameAr : currentPlan.nameEn}
          </span>
        </div>
        {isCritical ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#B91C1C] text-white">
            <AlertTriangle className="w-3 h-3 text-white" />
            <span>{isAr ? 'ممتلئ تقريباً' : 'Almost Full'}</span>
          </span>
        ) : isWarning ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#A38540]/20 text-[#A38540] border border-[#A38540]/40">
            {isAr ? 'استهلاك مرتفع' : 'High Usage'}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-[#6E6A75] dark:text-slate-400">
            {percentUsed.toFixed(1)}%
          </span>
        )}
      </div>

      {/* Main Visual: Interactive Donut Chart */}
      <div className="flex items-center justify-between gap-3 pt-1">
        
        {/* SVG Donut Chart */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 transform"
          >
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-[#DCD3DF] dark:text-slate-700/60"
            />

            {/* Category Segment Arcs */}
            {segments.map(seg => {
              if (seg.strokeDash <= 0) return null;
              const isHovered = activeHoverSegment === seg.id;
              return (
                <circle
                  key={seg.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={`${seg.strokeDash} ${circumference}`}
                  strokeDashoffset={seg.offset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveHoverSegment(seg.id)}
                  onMouseLeave={() => setActiveHoverSegment(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeHoverSegment ? (
              <>
                <span className="text-xs font-mono font-extrabold text-[#1E1E24] dark:text-white leading-none">
                  {segments.find(s => s.id === activeHoverSegment)?.percent}%
                </span>
                <span className="text-[9px] font-semibold text-[#6E6A75] dark:text-slate-400 leading-tight mt-0.5 truncate max-w-[60px]">
                  {isAr
                    ? segments.find(s => s.id === activeHoverSegment)?.labelAr
                    : segments.find(s => s.id === activeHoverSegment)?.labelEn}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-mono font-extrabold text-[#1E1E24] dark:text-white leading-none">
                  {percentUsed.toFixed(0)}%
                </span>
                <span className="text-[9px] font-medium text-[#6E6A75] dark:text-slate-400 leading-tight mt-0.5">
                  {isAr ? 'مستهلك' : 'used'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Text Metrics & Free Space */}
        <div className="flex-1 min-w-0 space-y-1.5 text-xs">
          <div>
            <span className="text-[10px] text-[#6E6A75] block leading-tight font-medium">
              {isAr ? 'المساحة المستخدمة' : 'Used Storage'}
            </span>
            <span className="font-mono font-bold text-[#1E1E24] dark:text-slate-200 text-xs sm:text-sm block">
              {formatBytes(usedBytes, 1, isAr)}
            </span>
          </div>

          <div className="pt-1 border-t border-[#DCD3DF] dark:border-slate-700/40">
            <span className="text-[10px] text-[#6E6A75] block leading-tight font-medium">
              {isAr ? 'المساحة الكلية' : 'Total Allowed'}
            </span>
            <span className="font-mono text-[#6E6A75] dark:text-slate-400 text-xs block">
              {formatBytes(totalBytes, 0, isAr)}
            </span>
          </div>
        </div>

      </div>

      {/* Segmented Linear Progress Indicator */}
      <div className="space-y-1.5">
        <div className="w-full h-1.5 bg-[#DCD3DF] dark:bg-slate-700/80 rounded-full overflow-hidden flex">
          {segments.map(seg => {
            const widthPct = (seg.bytes / totalBytes) * 100;
            if (widthPct <= 0) return null;
            return (
              <div
                key={seg.id}
                style={{ width: `${widthPct}%`, backgroundColor: seg.color }}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                title={`${isAr ? seg.labelAr : seg.labelEn}: ${formatBytes(seg.bytes, 1, isAr)} (${seg.percent}%)`}
              />
            );
          })}
        </div>

        {/* Free space text indicator */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#6E6A75] dark:text-slate-400 pt-0.5">
          <span>{isAr ? 'المتبقي المتاح:' : 'Free Remaining:'}</span>
          <span className="text-[#1AD062] font-bold">
            {formatBytes(freeBytes, 1, isAr)}
          </span>
        </div>
      </div>

      {/* Category Breakdown Chips Legend */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#DCD3DF] dark:border-slate-700/40">
        {categories.map(cat => (
          <div
            key={cat.id}
            onMouseEnter={() => setActiveHoverSegment(cat.id)}
            onMouseLeave={() => setActiveHoverSegment(null)}
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-colors cursor-default ${
              activeHoverSegment === cat.id
                ? 'bg-white shadow-2xs'
                : 'hover:bg-white/60'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-[10px] text-[#1E1E24] dark:text-slate-300 font-medium truncate flex-1">
              {isAr ? cat.labelAr : cat.labelEn}
            </span>
            <span className="text-[10px] font-mono text-[#6E6A75] shrink-0">
              {formatBytes(cat.bytes, 0, isAr)}
            </span>
          </div>
        ))}
      </div>

      {/* Flex Wallet Add-on indicator if on flex plan */}
      {currentPlan.id === 'flex' && (
        <div className="pt-2 border-t border-[#DCD3DF] dark:border-slate-700/40 flex items-center justify-between text-[11px]">
          <span className="text-[#6E6A75]">{isAr ? 'رصيد المحفظة السحابية:' : 'Cloud Wallet:'}</span>
          <span className="font-mono font-bold text-[#1AD062]">
            ${flexWalletBalance.toFixed(2)}
          </span>
        </div>
      )}

      {/* Quick Action Buttons: Cleanup & Insights */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('cleanup');
            if (onUpgradeClick) onUpgradeClick();
          }}
          className="py-1.5 px-2 text-xs font-semibold text-[#1E1E24] dark:text-slate-200 bg-white dark:bg-slate-700/60 hover:bg-[#F5EFF7] rounded-xl border border-[#DCD3DF] dark:border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          title={isAr ? 'تنظيف الملفات المكررة والمؤقتة' : 'Clean duplicate & temporary files'}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
          <span>{isAr ? 'تنظيف المساحة' : 'Cleanup'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('insights');
            if (onUpgradeClick) onUpgradeClick();
          }}
          className="py-1.5 px-2 text-xs font-semibold text-[#4E115A] dark:text-purple-300 bg-white dark:bg-slate-700/60 hover:bg-[#F5EFF7] rounded-xl border border-[#DCD3DF] dark:border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          title={isAr ? 'رؤى الاستهلاك وتوزيع الملفات' : 'View storage consumption insights'}
        >
          <PieChart className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
          <span>{isAr ? 'الرؤى والتحليل' : 'Insights'}</span>
        </button>
      </div>

      {/* Upgrade Storage CTA Button */}
      <button
        type="button"
        onClick={handleUpgrade}
        className="w-full mt-2 py-2 px-3 text-xs font-bold text-white bg-[#4E115A] hover:bg-[#3d0d46] rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>{isAr ? 'زيادة سعة التخزين' : 'Upgrade Storage'}</span>
      </button>

    </div>
  );
};
