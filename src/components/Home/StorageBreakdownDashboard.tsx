import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { formatBytes } from '../../utils/formatters';
import { FileItem, FileCategory } from '../../types/storage';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  PieChart as PieChartIcon,
  BarChart3,
  Image as ImageIcon,
  Video,
  FileText,
  FileArchive,
  FileCode,
  HardDrive,
  ArrowUpRight,
  Sparkles,
  Info,
  Layers,
  CheckCircle2,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface StorageCategoryData {
  key: string;
  nameAr: string;
  nameEn: string;
  bytes: number;
  count: number;
  percentage: number;
  color: string;
  icon: React.ElementType;
  fileCategory: FileCategory;
  largestFile?: FileItem;
}

export const StorageBreakdownDashboard: React.FC = () => {
  const {
    lang,
    files,
    quota,
    currentPlan,
    setActiveTab,
    setActiveCategory,
    setPreviewFile,
  } = useStorage();

  const isAr = lang === 'ar';
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null);

  // Compute live storage breakdown per category from active files
  const categoryData = useMemo<StorageCategoryData[]>(() => {
    const activeFiles = files.filter(f => !f.isTrash);
    const totalUsed = quota.usedBytes > 0 ? quota.usedBytes : 1;

    // Buckets
    const buckets: Record<
      string,
      {
        nameAr: string;
        nameEn: string;
        color: string;
        icon: React.ElementType;
        fileCategory: FileCategory;
        files: FileItem[];
      }
    > = {
      images: {
        nameAr: 'الصور واللقطات',
        nameEn: 'Images & Photos',
        color: '#F97316', // Warm Coral
        icon: ImageIcon,
        fileCategory: 'images',
        files: [],
      },
      videos: {
        nameAr: 'الفيديوهات والوسائط',
        nameEn: 'Videos & Media',
        color: '#4E115A', // Deep Royal Plum
        icon: Video,
        fileCategory: 'videos',
        files: [],
      },
      documents: {
        nameAr: 'المستندات و PDF',
        nameEn: 'Documents & PDFs',
        color: '#0284C7', // Sky Blue
        icon: FileText,
        fileCategory: 'documents',
        files: [],
      },
      archives: {
        nameAr: 'الملفات المضغوطة',
        nameEn: 'Archives & Backups',
        color: '#1AD062', // Emerald Green
        icon: FileArchive,
        fileCategory: 'archives',
        files: [],
      },
      other: {
        nameAr: 'أخرى وقواعد بيانات',
        nameEn: 'Other & Code',
        color: '#A38540', // Muted Gold / Bronze
        icon: FileCode,
        fileCategory: 'all',
        files: [],
      },
    };

    activeFiles.forEach(f => {
      if (f.type === 'image') {
        buckets.images.files.push(f);
      } else if (f.type === 'video') {
        buckets.videos.files.push(f);
      } else if (['pdf', 'document', 'spreadsheet', 'presentation'].includes(f.type)) {
        buckets.documents.files.push(f);
      } else if (f.type === 'archive') {
        buckets.archives.files.push(f);
      } else {
        buckets.other.files.push(f);
      }
    });

    return Object.entries(buckets).map(([key, config]) => {
      const bytes = config.files.reduce((acc, curr) => acc + curr.sizeBytes, 0);
      const count = config.files.length;
      const percentage = (bytes / totalUsed) * 100;
      const sorted = [...config.files].sort((a, b) => b.sizeBytes - a.sizeBytes);
      const largestFile = sorted.length > 0 ? sorted[0] : undefined;

      return {
        key,
        nameAr: config.nameAr,
        nameEn: config.nameEn,
        bytes,
        count,
        percentage: Number(percentage.toFixed(1)),
        color: config.color,
        icon: config.icon,
        fileCategory: config.fileCategory,
        largestFile,
      };
    });
  }, [files, quota.usedBytes]);

  // Selected or Hovered Category
  const activeCategory = useMemo(() => {
    if (!activeCategoryKey) return null;
    return categoryData.find(c => c.key === activeCategoryKey) || null;
  }, [activeCategoryKey, categoryData]);

  // Chart dataset for Recharts
  const chartData = useMemo(() => {
    return categoryData.map(c => ({
      name: isAr ? c.nameAr : c.nameEn,
      nameShort: isAr
        ? c.key === 'images' ? 'الصور' : c.key === 'videos' ? 'الفيديو' : c.key === 'documents' ? 'المستندات' : c.key === 'archives' ? 'الأرشيف' : 'أخرى'
        : c.key,
      value: c.bytes,
      formattedSize: formatBytes(c.bytes, 1, isAr),
      count: c.count,
      percentage: c.percentage,
      color: c.color,
      key: c.key,
    }));
  }, [categoryData, isAr]);

  // Navigate to FileExplorer filtered by this category
  const handleNavigateToCategory = (fileCategory: FileCategory) => {
    setActiveCategory(fileCategory);
    setActiveTab('files');
  };

  // Remaining space
  const remainingBytes = Math.max(0, quota.totalBytes - quota.usedBytes);
  const usedPercent = Math.min(100, (quota.usedBytes / quota.totalBytes) * 100);

  // Custom Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 rounded-2xl shadow-xl space-y-1.5 text-xs z-50 min-w-44 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-[#1E1E24] dark:text-white">
              {data.name}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'المساحة:' : 'Size:'}
            </span>
            <span className="font-black text-[#1E1E24] dark:text-white">
              {data.formattedSize}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'النسبة:' : 'Share:'}
            </span>
            <span className="font-black text-[#4E115A] dark:text-purple-300">
              {data.percentage}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'عدد الملفات:' : 'Files count:'}
            </span>
            <span className="font-bold text-[#1E1E24] dark:text-white">
              {data.count} {isAr ? 'ملف' : 'files'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6 select-none transition-colors">
      
      {/* Dashboard Top Header with Title and Interactive Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCD3DF]/70 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4E115A]/15">
            <PieChartIcon className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-[#1E1E24] dark:text-white">
                {isAr ? 'لوحة استهلاك السعة التخزينية' : 'Storage Breakdown Dashboard'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1AD062]/10 text-[#1AD062] border border-[#1AD062]/30 font-mono">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isAr ? 'محدث لحظياً' : 'Live Synced'}</span>
              </span>
            </div>
            <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
              {isAr
                ? 'تحليل بياني تفاعلي لتوزيع المساحة حسب نوع الملفات (صور، فيديو، مستندات، أرشيف)'
                : 'Interactive chart breakdown of cloud storage distribution by media type'}
            </p>
          </div>
        </div>

        {/* Action Controls: Chart Mode Switcher + Analytics Deep Link */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center p-1 bg-[#F5EFF7] dark:bg-slate-800 rounded-2xl border border-[#DCD3DF] dark:border-slate-700">
            <button
              type="button"
              onClick={() => setChartType('donut')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartType === 'donut'
                  ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-purple-300 shadow-xs'
                  : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24]'
              }`}
              title={isAr ? 'مخطط دائري (Donut)' : 'Donut Chart'}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isAr ? 'دائري' : 'Donut'}</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-purple-300 shadow-xs'
                  : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24]'
              }`}
              title={isAr ? 'مخطط أعمدة (Bar)' : 'Bar Chart'}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isAr ? 'أعمدة' : 'Bars'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-[#F5EFF7] dark:hover:bg-slate-700 border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#1E1E24] dark:text-white transition-all cursor-pointer shadow-2xs hover:border-[#4E115A]"
            title={isAr ? 'الانتقال للتحليلات التفصيلية' : 'Open Detailed Insights'}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
            <span className="hidden sm:inline">{isAr ? 'التحليلات الكاملة' : 'Full Insights'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75]" />
          </button>
        </div>
      </div>

      {/* Main Grid: Recharts Interactive Area + Live Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Recharts Chart Viewport (7 Cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative p-3 sm:p-5 rounded-3xl bg-[#F5EFF7]/40 dark:bg-slate-800/40 border border-[#DCD3DF]/70 dark:border-slate-800/80">
          
          <div className="w-full h-64 sm:h-72 flex items-center justify-center relative">
            {chartType === 'donut' ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={104}
                    paddingAngle={4}
                    dataKey="value"
                    cursor="pointer"
                    onClick={(entry: any) => {
                      const targetKey = String(entry?.key || entry?.payload?.key || '');
                      if (targetKey) {
                        setActiveCategoryKey(prev => (prev === targetKey ? null : targetKey));
                      }
                    }}
                  >
                    {chartData.map((entry, index) => {
                      const isHighlighted = activeCategoryKey === entry.key;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={activeCategoryKey && !isHighlighted ? 0.45 : 1}
                          stroke={isHighlighted ? '#1E1E24' : 'transparent'}
                          strokeWidth={isHighlighted ? 2.5 : 0}
                          className="transition-all duration-200"
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis
                    dataKey="nameShort"
                    tick={{ fontSize: 11, fill: '#6E6A75' }}
                    axisLine={{ stroke: '#DCD3DF', opacity: 0.5 }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => formatBytes(val, 0, isAr)}
                    tick={{ fontSize: 10, fill: '#6E6A75' }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    cursor="pointer"
                    onClick={(entry: any) => {
                      const targetKey = String(entry?.key || entry?.payload?.key || '');
                      if (targetKey) {
                        setActiveCategoryKey(prev => (prev === targetKey ? null : targetKey));
                      }
                    }}
                  >
                    {chartData.map((entry, index) => {
                      const isHighlighted = activeCategoryKey === entry.key;
                      return (
                        <Cell
                          key={`bar-cell-${index}`}
                          fill={entry.color}
                          opacity={activeCategoryKey && !isHighlighted ? 0.45 : 1}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Dynamic Center Metric for Donut Chart */}
            {chartType === 'donut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                {activeCategory ? (
                  <div className="space-y-0.5 animate-in zoom-in-95 duration-150">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A75] dark:text-slate-400">
                      {isAr ? activeCategory.nameAr : activeCategory.nameEn}
                    </span>
                    <div className="text-xl font-black text-[#1E1E24] dark:text-white font-mono">
                      {formatBytes(activeCategory.bytes, 1, isAr)}
                    </div>
                    <span
                      className="inline-block text-[11px] font-black px-2 py-0.2 rounded-full text-white"
                      style={{ backgroundColor: activeCategory.color }}
                    >
                      {activeCategory.percentage}%
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A75] dark:text-slate-400 font-mono">
                      {isAr ? 'إجمالي المستهلك' : 'Total Used'}
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-[#4E115A] dark:text-purple-300 font-mono">
                      {formatBytes(quota.usedBytes, 1, isAr)}
                    </div>
                    <span className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-400 font-mono">
                      {usedPercent.toFixed(1)}% {isAr ? 'من الخطة' : 'of plan'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Chart Hint / Reset Filter */}
          <div className="mt-2 flex items-center justify-between w-full px-2 text-xs">
            <span className="text-[11px] text-[#6E6A75] dark:text-slate-400 flex items-center gap-1 font-mono">
              <Info className="w-3 h-3 text-[#A38540]" />
              <span>
                {activeCategory
                  ? (isAr ? `تحديد: ${activeCategory.nameAr} (انقر للإلغاء)` : `Filtered: ${activeCategory.nameEn} (click to reset)`)
                  : (isAr ? 'انقر على أي شريحة للتصفية ومعاينة التفاصيل' : 'Click any sector to inspect details')}
              </span>
            </span>

            {activeCategoryKey && (
              <button
                type="button"
                onClick={() => setActiveCategoryKey(null)}
                className="text-[11px] font-bold text-[#4E115A] dark:text-purple-300 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isAr ? 'إعادة تعيين' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Storage Summary & Quota Meters (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-3.5">
          
          {/* Card 1: Storage Quota Health Meter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
                <span>{isAr ? 'سعة الخطة السحابية' : 'Cloud Plan Capacity'}</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#4E115A] dark:text-purple-300 bg-[#F5EFF7] dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-[#4E115A]/20">
                {currentPlan.nameAr} ({currentPlan.storageGB} GB)
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex p-0.5 border border-[#DCD3DF]/50">
                {categoryData.map(cat => {
                  const shareOfTotal = (cat.bytes / quota.totalBytes) * 100;
                  if (shareOfTotal <= 0) return null;
                  return (
                    <div
                      key={cat.key}
                      style={{
                        width: `${shareOfTotal}%`,
                        backgroundColor: cat.color,
                      }}
                      className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                      title={`${isAr ? cat.nameAr : cat.nameEn}: ${formatBytes(cat.bytes, 1, isAr)}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6A75] dark:text-slate-400">
                <span>
                  {isAr ? 'المستخدم:' : 'Used:'}{' '}
                  <strong className="text-[#1E1E24] dark:text-white">
                    {formatBytes(quota.usedBytes, 1, isAr)}
                  </strong>
                </span>
                <span>
                  {isAr ? 'المتبقي:' : 'Free:'}{' '}
                  <strong className="text-[#1AD062]">
                    {formatBytes(remainingBytes, 1, isAr)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Highest Impact Category Insight */}
          {(() => {
            const topCategory = [...categoryData].sort((a, b) => b.bytes - a.bytes)[0];
            const Icon = topCategory ? topCategory.icon : HardDrive;
            return (
              <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-purple-950/30 border border-[#DCD3DF] dark:border-purple-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#6E6A75] dark:text-slate-400 font-mono">
                    {isAr ? 'أعلى استهلاك سحابي' : 'Highest Consuming Category'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4E115A] text-white">
                    {topCategory ? `${topCategory.percentage}%` : '0%'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${topCategory.color}20`, color: topCategory.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-[#1E1E24] dark:text-white truncate">
                        {isAr ? topCategory.nameAr : topCategory.nameEn}
                      </h4>
                      <p className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
                        {formatBytes(topCategory.bytes, 1, isAr)} · {topCategory.count} {isAr ? 'ملف' : 'files'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigateToCategory(topCategory.fileCategory)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#4E115A] hover:text-white dark:hover:bg-[#4E115A] text-[#4E115A] dark:text-purple-300 border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <span>{isAr ? 'تصفح' : 'View'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Card 3: Storage Optimization Tip */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#A38540]/10 text-[#A38540] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[#1E1E24] dark:text-white truncate">
                  {isAr ? 'تحرير وتفريغ المساحة الذكي' : 'Smart Space Reclaim'}
                </div>
                <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 truncate">
                  {isAr ? 'فحص تلقائي للملفات المكررة والمؤقتة' : 'Scan for duplicate files and temp cache'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('cleanup')}
              className="px-2.5 py-1.5 rounded-xl bg-[#F5EFF7] dark:bg-slate-700 text-[#4E115A] dark:text-purple-300 hover:bg-[#4E115A] hover:text-white text-[11px] font-bold transition-colors shrink-0 cursor-pointer"
            >
              {isAr ? 'فحص الآن' : 'Scan'}
            </button>
          </div>

        </div>

      </div>

      {/* Category Breakdown Cards Grid (Interactive click to drilldown) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#6E6A75] dark:text-slate-400 font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
            <span>{isAr ? 'تفاصيل الفئات التخزينية المباشرة' : 'Category Distribution Details'}</span>
          </h3>
          <span className="text-[11px] text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'انقر على الفئة لتصفح ملفاتها' : 'Click category to view files'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {categoryData.map(cat => {
            const Icon = cat.icon;
            const isSelected = activeCategoryKey === cat.key;

            return (
              <div
                key={cat.key}
                role="button"
                tabIndex={0}
                onClick={() => setActiveCategoryKey(prev => prev === cat.key ? null : cat.key)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveCategoryKey(prev => prev === cat.key ? null : cat.key);
                  }
                }}
                className={`group p-3.5 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-2 border-[#4E115A] shadow-md ring-2 ring-[#4E115A]/20 scale-[1.02]'
                    : 'bg-[#F5EFF7]/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/50 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-2xs"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      {cat.percentage}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#1E1E24] dark:text-white truncate">
                    {isAr ? cat.nameAr : cat.nameEn}
                  </h4>
                  <div className="text-sm font-black text-[#1E1E24] dark:text-white font-mono mt-0.5">
                    {formatBytes(cat.bytes, 1, isAr)}
                  </div>
                  <div className="text-[10px] text-[#6E6A75] dark:text-slate-400 font-mono">
                    {cat.count} {isAr ? 'ملف مسجل' : 'files stored'}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#DCD3DF]/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToCategory(cat.fileCategory);
                    }}
                    className="text-[#4E115A] dark:text-purple-300 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{isAr ? 'تصفح' : 'Browse'}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Category Drilldown Panel */}
      {activeCategory && activeCategory.largestFile && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[#4E115A]/30 dark:border-purple-800/40 shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: `${activeCategory.color}20`, color: activeCategory.color }}
              >
                <activeCategory.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? `أكبر ملف في ${activeCategory.nameAr}:` : `Largest file in ${activeCategory.nameEn}:`}
                  </span>
                  <span className="text-xs font-bold font-mono text-[#4E115A] dark:text-purple-300 bg-[#F5EFF7] dark:bg-slate-700 px-2 py-0.5 rounded-lg truncate max-w-xs">
                    {activeCategory.largestFile.name}
                  </span>
                  <span className="text-xs font-mono text-[#6E6A75] dark:text-slate-400">
                    ({formatBytes(activeCategory.largestFile.sizeBytes, 1, isAr)})
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-0.5">
                  {isAr
                    ? 'يمكنك معاينة هذا الملف مباشرة أو استعراض جميع الملفات في هذا التصنيف'
                    : 'Preview this file directly or explore all items in this category'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setPreviewFile(activeCategory.largestFile!)}
                className="px-3 py-1.5 rounded-xl bg-[#F5EFF7] dark:bg-slate-700 text-[#1E1E24] dark:text-white hover:bg-[#4E115A] hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? 'معاينة سريعة' : 'Preview'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigateToCategory(activeCategory.fileCategory)}
                className="px-3 py-1.5 rounded-xl bg-[#4E115A] text-white hover:bg-[#3D0D47] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض الكل في ملفاتي' : 'View in Files'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
