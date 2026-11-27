import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { formatBytes, formatDate } from '../../utils/formatters';
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
  Legend,
  Treemap,
  CartesianGrid,
} from 'recharts';
import {
  PieChart as PieChartIcon,
  BarChart3,
  Folder,
  HardDrive,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  FolderOpen,
  Filter,
  Eye,
  CheckCircle2,
  Trash2,
  Lock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { FileItem, FolderItem } from '../../types/storage';

// Color Palette consistent with user design instructions:
// Primary Brand Color: Deep Royal Plum (#4E115A)
// Lavender-Tinted Gray: #F5EFF7
// Lilac Border: #DCD3DF
// Charcoal: #1E1E24
// Muted Slate: #6E6A75
// WhatsApp / Eco: #1AD062
// Crimson Alert: #B91C1C
// Gold Accent: #A38540

const CATEGORY_COLORS: Record<string, string> = {
  video: '#8B2199', // Rich Magenta-Plum
  image: '#A38540', // Warm Gold/Bronze
  archive: '#4E115A', // Deep Royal Plum
  document: '#0284C7', // Sky Blue
  pdf: '#B91C1C', // Crimson Red
  spreadsheet: '#1AD062', // Vibrant Emerald
  code: '#6366F1', // Indigo
  other: '#6E6A75', // Muted Slate
};

const FOLDER_PALETTE = [
  '#4E115A',
  '#8B2199',
  '#A38540',
  '#1AD062',
  '#0284C7',
  '#F97316',
  '#6366F1',
  '#EC4899',
  '#10B981',
];

export const StorageUsageInsightsView: React.FC = () => {
  const {
    lang,
    files,
    folders,
    quota,
    currentPlan,
    setActiveTab,
    setCurrentFolderId,
    setActiveCategory,
    setPreviewFile,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';

  // Interactive filtering / drill-down states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'categories' | 'folders' | 'treemap'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'size' | 'name' | 'date'>('size');

  // Total metrics
  const activeFiles = useMemo(() => files.filter(f => !f.isTrash), [files]);
  const totalUsedBytes = quota.usedBytes;
  const totalCapacityBytes = quota.totalBytes;
  const freeBytes = Math.max(0, totalCapacityBytes - totalUsedBytes);
  const usedPercentage = totalCapacityBytes > 0 ? (totalUsedBytes / totalCapacityBytes) * 100 : 0;

  // 1. Category Distribution Calculation
  const categoryStats = useMemo(() => {
    const stats: Record<string, { bytes: number; count: number; labelAr: string; labelEn: string; color: string }> = {
      video: { bytes: 0, count: 0, labelAr: 'مقاطع الفيديو', labelEn: 'Videos', color: CATEGORY_COLORS.video },
      image: { bytes: 0, count: 0, labelAr: 'الصور الفوتوغرافية', labelEn: 'Photos & Images', color: CATEGORY_COLORS.image },
      archive: { bytes: 0, count: 0, labelAr: 'الأرشيف والحزم المضغوطة', labelEn: 'Archives & Backups', color: CATEGORY_COLORS.archive },
      document: { bytes: 0, count: 0, labelAr: 'المستندات والنصوص', labelEn: 'Documents & Notes', color: CATEGORY_COLORS.document },
      pdf: { bytes: 0, count: 0, labelAr: 'ملفات PDF', labelEn: 'PDF Documents', color: CATEGORY_COLORS.pdf },
      spreadsheet: { bytes: 0, count: 0, labelAr: 'جداول البيانات (Excel/Sheets)', labelEn: 'Spreadsheets', color: CATEGORY_COLORS.spreadsheet },
      code: { bytes: 0, count: 0, labelAr: 'أكواد ومخططات برمجية', labelEn: 'Code & Scripts', color: CATEGORY_COLORS.code },
      other: { bytes: 0, count: 0, labelAr: 'ملفات أخرى', labelEn: 'Other Files', color: CATEGORY_COLORS.other },
    };

    activeFiles.forEach(f => {
      let cat = 'other';
      if (f.type === 'video') cat = 'video';
      else if (f.type === 'image') cat = 'image';
      else if (f.type === 'archive') cat = 'archive';
      else if (f.type === 'pdf') cat = 'pdf';
      else if (f.type === 'spreadsheet') cat = 'spreadsheet';
      else if (['document', 'presentation'].includes(f.type)) cat = 'document';
      else if (f.type === 'code') cat = 'code';

      stats[cat].bytes += f.sizeBytes;
      stats[cat].count += 1;
    });

    return Object.entries(stats)
      .map(([key, data]) => ({
        id: key,
        name: isAr ? data.labelAr : data.labelEn,
        nameAr: data.labelAr,
        nameEn: data.labelEn,
        valueBytes: data.bytes,
        count: data.count,
        color: data.color,
        percentage: totalUsedBytes > 0 ? (data.bytes / totalUsedBytes) * 100 : 0,
        formattedSize: formatBytes(data.bytes, 1, isAr),
      }))
      .filter(item => item.valueBytes > 0)
      .sort((a, b) => b.valueBytes - a.valueBytes);
  }, [activeFiles, totalUsedBytes, isAr]);

  // 2. Folder Storage Breakdown Calculation
  const folderStats = useMemo(() => {
    // Map of folderId -> total bytes & count (including nested files)
    const folderMap: Record<string, { id: string; name: string; bytes: number; count: number; color: string; isVault?: boolean }> = {};

    // Pre-populate folders
    folders.forEach((folder, idx) => {
      folderMap[folder.id] = {
        id: folder.id,
        name: folder.name,
        bytes: 0,
        count: 0,
        color: folder.color || FOLDER_PALETTE[idx % FOLDER_PALETTE.length],
        isVault: folder.isVault,
      };
    });

    // Root virtual folder for orphan/root files
    const rootKey = 'root-directory';
    folderMap[rootKey] = {
      id: rootKey,
      name: isAr ? 'الملفات الجذرية (بدون مجلد)' : 'Root Directory (Uncategorized)',
      bytes: 0,
      count: 0,
      color: '#6E6A75',
    };

    // Helper: find all ancestor folder IDs for deep propagation
    const getFolderAncestors = (folderId: string): string[] => {
      const ancestors: string[] = [folderId];
      let current = folders.find(f => f.id === folderId);
      while (current && current.parentId) {
        ancestors.push(current.parentId);
        const parentId = current.parentId;
        current = folders.find(f => f.id === parentId);
      }
      return ancestors;
    };

    activeFiles.forEach(file => {
      if (file.folderId && folderMap[file.folderId]) {
        // Direct assignment
        folderMap[file.folderId].bytes += file.sizeBytes;
        folderMap[file.folderId].count += 1;
      } else {
        folderMap[rootKey].bytes += file.sizeBytes;
        folderMap[rootKey].count += 1;
      }
    });

    return Object.values(folderMap)
      .filter(f => f.bytes > 0 || folders.some(folder => folder.id === f.id))
      .map(f => ({
        ...f,
        percentageOfTotal: totalUsedBytes > 0 ? (f.bytes / totalUsedBytes) * 100 : 0,
        formattedSize: formatBytes(f.bytes, 1, isAr),
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }, [folders, activeFiles, totalUsedBytes, isAr]);

  // 3. Top Largest Heavyweight Files (candidates for cleanup)
  const largestFiles = useMemo(() => {
    let filtered = [...activeFiles];
    if (selectedCategory) {
      filtered = filtered.filter(f => {
        if (selectedCategory === 'video') return f.type === 'video';
        if (selectedCategory === 'image') return f.type === 'image';
        if (selectedCategory === 'archive') return f.type === 'archive';
        if (selectedCategory === 'pdf') return f.type === 'pdf';
        if (selectedCategory === 'spreadsheet') return f.type === 'spreadsheet';
        if (selectedCategory === 'document') return ['document', 'presentation'].includes(f.type);
        if (selectedCategory === 'code') return f.type === 'code';
        return true;
      });
    }

    if (selectedFolderId) {
      if (selectedFolderId === 'root-directory') {
        filtered = filtered.filter(f => !f.folderId);
      } else {
        filtered = filtered.filter(f => f.folderId === selectedFolderId);
      }
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return filtered.sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, 8);
  }, [activeFiles, selectedCategory, selectedFolderId, searchQuery]);

  // Treemap data format
  const treemapData = useMemo(() => {
    return [
      {
        name: isAr ? 'المساحة السحابية' : 'Cloud Storage',
        children: folderStats.map(f => ({
          name: f.name,
          size: f.bytes,
          formattedSize: f.formattedSize,
          count: f.count,
          color: f.color,
        })),
      },
    ];
  }, [folderStats, isAr]);

  // Handle navigate directly to folder or category
  const handleOpenFolder = (folderId: string) => {
    if (folderId === 'root-directory') {
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(folderId);
    }
    setActiveTab('files');
    setActiveCategory('all');
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedFolderId(null);
    setSearchQuery('');
    showNotification(
      'تمت إعادة تعيين مرشحات التحليل والاستهلاك',
      'Usage insight filters have been reset',
      'info'
    );
  };

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 pb-28 space-y-6 bg-white dark:bg-slate-950">
      
      {/* ============================================================== */}
      {/* 1. Header Banner & Quick Quota KPI Cards                        */}
      {/* ============================================================== */}
      <div className="rounded-2xl bg-gradient-to-br from-[#4E115A] via-[#3d0d46] to-slate-950 text-white p-6 sm:p-8 border border-[#DCD3DF]/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-mono font-semibold backdrop-blur-xs">
              <PieChartIcon className="w-3.5 h-3.5 text-[#1AD062]" />
              <span>{isAr ? 'مركز التحليلات الاستيعابية وتوزيع البيانات' : 'Storage Usage & Capacity Analytics'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isAr ? 'رؤى استهلاك التخزين وتوزيع المجلدات' : 'Storage Usage Insights & Media Analytics'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
              {isAr
                ? 'لوحة استكشافية متقدمة باستخدام مخططات Recharts التفاعلية لتحليل أحجام الملفات والوسائط والمجلدات الأكثر استهلاكاً لسعة حسابك السحابي بدقة متناهية.'
                : 'Interactive data visualization engine built on Recharts to dissect file types, folder footprints, and pinpoint the heaviest consumers of your cloud quota.'}
            </p>
          </div>

          {/* Quick Filter Reset & Active Plan Badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="text-right rtl:text-right ltr:text-left">
              <div className="text-[10px] text-purple-200 font-mono uppercase tracking-wider">
                {isAr ? 'الباقة السحابية النشطة' : 'Active Plan'}
              </div>
              <div className="text-sm font-bold text-white">
                {isAr ? currentPlan.nameAr : currentPlan.nameEn}
              </div>
              <div className="text-[11px] font-mono text-[#1AD062] font-semibold">
                {formatBytes(totalUsedBytes, 1, isAr)} / {formatBytes(totalCapacityBytes, 0, isAr)} ({usedPercentage.toFixed(1)}%)
              </div>
            </div>

            {(selectedCategory || selectedFolderId || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title={isAr ? 'إلغاء التصفية' : 'Clear Filters'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-[#1AD062]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Storage Cleanup Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F5EFF7] via-white to-[#F5EFF7] dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border border-[#4E115A]/30 dark:border-purple-800/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1E1E24] dark:text-white flex items-center gap-2">
              <span>{isAr ? 'هل تريد استعادة سعة التخزين وتحرير المساحة؟' : 'Looking to reclaim storage space?'}</span>
              <span className="text-[10px] bg-[#1AD062]/15 text-[#1AD062] px-2 py-0.2 rounded-full font-bold">
                {isAr ? 'فحص فوري' : 'Instant Scan'}
              </span>
            </div>
            <p className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-0.5">
              {isAr
                ? 'محرك تنظيف المساحة يكتشف الملفات المتطابقة بالبصمة والمخلفات المؤقتة لتفريغ المساحة بأمان.'
                : 'Run Storage Cleanup to scan for duplicate SHA-256 files, large unused files, and temporary cache.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('cleanup')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'الانتقال لأداة تنظيف المساحة' : 'Launch Storage Cleanup'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. Top Summary KPI Stats Grid                                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Used Capacity */}
        <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-medium text-[#6E6A75]">{isAr ? 'المساحة المستهلكة' : 'Used Storage'}</span>
            <HardDrive className="w-4 h-4 text-[#4E115A]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#1E1E24] dark:text-white">
            {formatBytes(totalUsedBytes, 1, isAr)}
          </div>
          <div className="w-full bg-[#DCD3DF] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usedPercentage >= 90 ? 'bg-[#B91C1C]' : usedPercentage >= 75 ? 'bg-[#A38540]' : 'bg-[#4E115A]'
              }`}
              style={{ width: `${Math.min(100, usedPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#6E6A75] font-mono pt-0.5">
            <span>{usedPercentage.toFixed(1)}% {isAr ? 'ممتلئ' : 'consumed'}</span>
            <span>{formatBytes(freeBytes, 1, isAr)} {isAr ? 'متبقي' : 'free'}</span>
          </div>
        </div>

        {/* KPI 2: Total Files & Folders */}
        <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-medium text-[#6E6A75]">{isAr ? 'إجمالي الملفات والمجلدات' : 'Files & Folders'}</span>
            <Folder className="w-4 h-4 text-[#A38540]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#1E1E24] dark:text-white">
            {activeFiles.length} <span className="text-xs font-normal text-[#6E6A75]">{isAr ? 'ملف' : 'files'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6E6A75]">
            <span className="font-semibold">{folders.length} {isAr ? 'مجلدات نشطة' : 'directories'}</span>
            <span>•</span>
            <span className="text-[#1AD062] font-semibold">{isAr ? 'متزامنة سحابياً' : 'Zero-Egress'}</span>
          </div>
        </div>

        {/* KPI 3: Heaviest Category */}
        <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-medium text-[#6E6A75]">{isAr ? 'النوع الأكثر استهلاكاً' : 'Heaviest Type'}</span>
            <Video className="w-4 h-4 text-[#8B2199]" />
          </div>
          <div className="text-lg font-black text-[#1E1E24] dark:text-white truncate">
            {categoryStats[0]?.name || (isAr ? 'لا يوجد بيانات' : 'None')}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-[#6E6A75]">
            <span className="font-bold text-[#4E115A] dark:text-purple-400">
              {categoryStats[0]?.formattedSize || '0 MB'}
            </span>
            <span>{categoryStats[0]?.percentage.toFixed(1) || 0}% {isAr ? 'من الإجمالي' : 'of quota'}</span>
          </div>
        </div>

        {/* KPI 4: Largest Single Directory */}
        <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-medium text-[#6E6A75]">{isAr ? 'أضخم مجلد حجماً' : 'Largest Folder'}</span>
            <FolderOpen className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-lg font-black text-[#1E1E24] dark:text-white truncate">
            {folderStats[0]?.name || (isAr ? 'الجذر الرئيسي' : 'Root')}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-[#6E6A75]">
            <span className="font-bold text-[#0284C7]">
              {folderStats[0]?.formattedSize || '0 MB'}
            </span>
            <span>{folderStats[0]?.count || 0} {isAr ? 'عناصر' : 'items'}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. Main Recharts Visualization Panels                          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Primary Interactive Charts */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-xs space-y-5">
            
            {/* Chart Mode Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#4E115A]" />
                <h2 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'الرسوم البيانية التوزيعية لاستهلاك السعة' : 'Visual Storage Distribution'}
                </h2>
              </div>

              <div className="flex items-center gap-1 bg-[#F5EFF7] dark:bg-slate-800 p-1 rounded-xl border border-[#DCD3DF] dark:border-slate-700">
                <button
                  onClick={() => setActiveChartTab('categories')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeChartTab === 'categories'
                      ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-xs'
                      : 'text-[#6E6A75] hover:text-[#1E1E24]'
                  }`}
                >
                  {isAr ? 'حسب نوع الملفات' : 'By File Type'}
                </button>
                <button
                  onClick={() => setActiveChartTab('folders')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeChartTab === 'folders'
                      ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-xs'
                      : 'text-[#6E6A75] hover:text-[#1E1E24]'
                  }`}
                >
                  {isAr ? 'حسب المجلدات' : 'By Folders'}
                </button>
                <button
                  onClick={() => setActiveChartTab('treemap')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeChartTab === 'treemap'
                      ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-xs'
                      : 'text-[#6E6A75] hover:text-[#1E1E24]'
                  }`}
                >
                  {isAr ? 'الخريطة الشجرية (Treemap)' : 'Treemap'}
                </button>
              </div>
            </div>

            {/* TAB A: By File Type (Donut Pie Chart + Breakdown Bar) */}
            {activeChartTab === 'categories' && (
              <div className="space-y-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#1E1E24] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 font-sans">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                  <span>{data.name}</span>
                                </div>
                                <div className="font-mono text-purple-200">
                                  {isAr ? 'الحجم الإجمالي:' : 'Total Size:'} <span className="text-white font-bold">{data.formattedSize}</span>
                                </div>
                                <div className="font-mono text-slate-300">
                                  {isAr ? 'عدد الملفات:' : 'File Count:'} <span className="text-white font-bold">{data.count}</span>
                                </div>
                                <div className="font-mono text-[#1AD062]">
                                  {isAr ? 'النسبة المئوية:' : 'Percentage:'} <span className="font-bold">{data.percentage.toFixed(1)}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={categoryStats}
                        dataKey="valueBytes"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={3}
                        onClick={(entry: any) => {
                          if (entry && entry.id) {
                            setSelectedCategory(entry.id === selectedCategory ? null : entry.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {categoryStats.map((entry) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={entry.color}
                            stroke={selectedCategory === entry.id ? '#1E1E24' : 'transparent'}
                            strokeWidth={selectedCategory === entry.id ? 3 : 1}
                            opacity={selectedCategory && selectedCategory !== entry.id ? 0.45 : 1}
                          />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => {
                          return (
                            <span className="text-xs text-[#1E1E24] dark:text-slate-300 font-medium px-1">
                              {value}
                            </span>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Breakdown Progress Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {categoryStats.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#F5EFF7] border-[#4E115A] shadow-xs ring-1 ring-[#4E115A]'
                            : 'bg-white dark:bg-slate-900 border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1 text-xs">
                          <span className="font-bold text-[#1E1E24] dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span>{cat.name}</span>
                          </span>
                          <span className="font-mono font-bold text-[#4E115A] dark:text-purple-300">
                            {cat.formattedSize}
                          </span>
                        </div>
                        <div className="w-full bg-[#DCD3DF] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#6E6A75] font-mono pt-1">
                          <span>{cat.count} {isAr ? 'ملفات' : 'files'}</span>
                          <span>{cat.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB B: By Folders (Horizontal Bar Chart) */}
            {activeChartTab === 'folders' && (
              <div className="space-y-4">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={folderStats}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#DCD3DF" opacity={0.6} />
                      <XAxis
                        type="number"
                        tickFormatter={val => formatBytes(val, 0, isAr)}
                        tick={{ fill: '#6E6A75', fontSize: 11, fontFamily: 'monospace' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fill: '#1E1E24', fontSize: 11, fontWeight: 600 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#1E1E24] text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700 font-sans">
                                <div className="font-bold flex items-center gap-1.5 text-white">
                                  <Folder className="w-3.5 h-3.5" style={{ color: data.color }} />
                                  <span>{data.name}</span>
                                </div>
                                <div className="font-mono text-purple-200">
                                  {isAr ? 'الحجم الإجمالي:' : 'Total Size:'} <span className="text-white font-bold">{data.formattedSize}</span>
                                </div>
                                <div className="font-mono text-slate-300">
                                  {isAr ? 'عدد العناصر:' : 'Items Count:'} <span className="text-white font-bold">{data.count}</span>
                                </div>
                                <div className="font-mono text-[#1AD062]">
                                  {isAr ? 'حصة الاستهلاك:' : 'Consumption Share:'} <span className="font-bold">{data.percentageOfTotal.toFixed(1)}%</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="bytes"
                        radius={[0, 8, 8, 0]}
                        onClick={(entry: any) => {
                          if (entry && entry.id) {
                            setSelectedFolderId(entry.id === selectedFolderId ? null : entry.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {folderStats.map((entry) => (
                          <Cell
                            key={`bar-${entry.id}`}
                            fill={entry.color}
                            stroke={selectedFolderId === entry.id ? '#4E115A' : 'transparent'}
                            strokeWidth={selectedFolderId === entry.id ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Folder Selection Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-[#6E6A75] font-semibold">{isAr ? 'تصفية حسب المجلد:' : 'Filter folder:'}</span>
                  {folderStats.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFolderId(f.id === selectedFolderId ? null : f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        selectedFolderId === f.id
                          ? 'bg-[#4E115A] text-white shadow-xs'
                          : 'bg-[#F5EFF7] text-[#1E1E24] hover:bg-white border border-[#DCD3DF]'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" style={{ color: selectedFolderId === f.id ? '#ffffff' : f.color }} />
                      <span>{f.name}</span>
                      <span className="font-mono text-[10px] opacity-80">({f.formattedSize})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB C: Treemap Spatial View */}
            {activeChartTab === 'treemap' && (
              <div className="space-y-3">
                <div className="h-80 w-full rounded-xl overflow-hidden border border-[#DCD3DF] dark:border-slate-800 p-2 bg-[#F5EFF7] dark:bg-slate-950">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={treemapData}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      fill="#4E115A"
                      content={((props: any) => {
                        const { x, y, width, height, index, name, size } = props;
                        if (!width || !height || width < 25 || height < 25) {
                          return <g />;
                        }
                        const folder = folderStats.find(f => f.name === name);
                        const bg = folder?.color || FOLDER_PALETTE[(index || 0) % FOLDER_PALETTE.length];

                        return (
                          <g>
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              style={{
                                fill: bg,
                                stroke: '#ffffff',
                                strokeWidth: 2,
                                rx: 6,
                                ry: 6,
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                if (folder) setSelectedFolderId(folder.id);
                              }}
                            />
                            {width > 60 && height > 40 && (
                              <text
                                x={x + width / 2}
                                y={y + height / 2 - 6}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={11}
                                fontWeight="bold"
                                pointerEvents="none"
                              >
                                {name && name.length > 14 ? `${name.substring(0, 12)}...` : name}
                              </text>
                            )}
                            {width > 60 && height > 40 && (
                              <text
                                x={x + width / 2}
                                y={y + height / 2 + 10}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={10}
                                opacity={0.9}
                                fontFamily="monospace"
                                pointerEvents="none"
                              >
                                {formatBytes(size || 0, 1, isAr)}
                              </text>
                            )}
                          </g>
                        );
                      }) as any}
                    />
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] text-[#6E6A75] text-center">
                  {isAr ? 'يمثل حجم كل مستطيل الحجم الفعلي للمجلد مقارنة بإجمالي السعة المستهلكة' : 'Rectangle area directly proportional to folder byte size'}
                </div>
              </div>
            )}

          </div>

          {/* Directory Hierarchy Breakdown Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#4E115A]" />
                <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'تفاصيل استهلاك المجلدات وإجراءات التصفح' : 'Folder Quota Breakdown & Navigation'}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#6E6A75]">
                {folderStats.length} {isAr ? 'مجلدات مصنفة' : 'indexed directories'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {folderStats.map(f => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800/50 border border-[#DCD3DF] dark:border-slate-700/60 flex items-center justify-between gap-3 hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: `${f.color}20`, color: f.color }}
                    >
                      {f.isVault ? <Lock className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#1E1E24] dark:text-white truncate" title={f.name}>
                        {f.name}
                      </div>
                      <div className="text-[10px] text-[#6E6A75] font-mono flex items-center gap-1.5 pt-0.5">
                        <span>{f.count} {isAr ? 'ملفات' : 'files'}</span>
                        <span>•</span>
                        <span className="font-bold text-[#4E115A] dark:text-purple-300">{f.formattedSize}</span>
                        <span>•</span>
                        <span>{f.percentageOfTotal.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenFolder(f.id)}
                    className="p-2 bg-white dark:bg-slate-700 hover:bg-[#4E115A] hover:text-white text-[#4E115A] dark:text-white rounded-xl border border-[#DCD3DF] dark:border-slate-600 transition-colors cursor-pointer shrink-0"
                    title={isAr ? 'فتح المجلد في مستعرض الملفات' : 'Open in File Explorer'}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Largest Heavyweight Files & Cleanup Recommendations */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Filter Info Box */}
          {(selectedCategory || selectedFolderId) && (
            <div className="p-4 rounded-2xl bg-[#F5EFF7] border border-[#4E115A]/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#4E115A]">
                <span className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4" />
                  <span>{isAr ? 'تصفية نشطة' : 'Active Filter Applied'}</span>
                </span>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] underline hover:text-[#3d0d46] cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Clear'}
                </button>
              </div>
              <div className="text-xs text-[#1E1E24]">
                {selectedCategory && (
                  <div>{isAr ? 'النوع:' : 'Type:'} <span className="font-bold uppercase font-mono">{selectedCategory}</span></div>
                )}
                {selectedFolderId && (
                  <div>{isAr ? 'المجلد:' : 'Folder:'} <span className="font-bold">{folderStats.find(f => f.id === selectedFolderId)?.name}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Heavyweight Files Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#A38540]" />
                <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'أضخم الملفات استهلاكاً للسعة' : 'Top Space Consumers'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#6E6A75]">
                {largestFiles.length} {isAr ? 'ملفات' : 'files'}
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute rtl:right-3 ltr:left-3 top-2.5 text-[#6E6A75]" />
              <input
                type="text"
                placeholder={isAr ? 'بحث في الملفات الضخمة...' : 'Search heavy files...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rtl:pr-9 ltr:pl-9 py-2 bg-white dark:bg-slate-950 border border-[#DCD3DF] dark:border-slate-800 rounded-xl text-xs text-[#1E1E24] dark:text-white placeholder:text-[#6E6A75] focus:outline-hidden focus:border-[#4E115A]"
              />
            </div>

            {/* List of heavyweight files */}
            <div className="space-y-2.5">
              {largestFiles.map(file => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl bg-[#F5EFF7] dark:bg-slate-800/40 border border-[#DCD3DF] dark:border-slate-800 flex items-center justify-between gap-2.5 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 border border-[#DCD3DF] dark:border-slate-600">
                      {file.type === 'video' && <Video className="w-4 h-4 text-[#8B2199]" />}
                      {file.type === 'image' && <ImageIcon className="w-4 h-4 text-[#A38540]" />}
                      {file.type === 'archive' && <FileArchive className="w-4 h-4 text-[#4E115A]" />}
                      {file.type === 'pdf' && <FileText className="w-4 h-4 text-[#B91C1C]" />}
                      {!['video', 'image', 'archive', 'pdf'].includes(file.type) && <FileText className="w-4 h-4 text-[#0284C7]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1E1E24] dark:text-white truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-[10px] text-[#6E6A75] font-mono flex items-center gap-1.5">
                        <span className="font-bold text-[#4E115A] dark:text-purple-400">
                          {formatBytes(file.sizeBytes, 1, isAr)}
                        </span>
                        <span>•</span>
                        <span>{file.extension.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title={isAr ? 'معاينة الملف' : 'Preview'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {file.folderId && (
                      <button
                        onClick={() => handleOpenFolder(file.folderId!)}
                        className="p-1.5 text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title={isAr ? 'الانتقال إلى المجلد الحاوي' : 'Go to Folder'}
                      >
                        <Folder className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {largestFiles.length === 0 && (
                <div className="text-center py-6 text-xs text-[#6E6A75]">
                  {isAr ? 'لا توجد ملفات مطابقة لمعايير التصفية الحالية.' : 'No files matched current criteria.'}
                </div>
              )}
            </div>

          </div>

          {/* Smart Storage Optimization Insights Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F5EFF7] to-white border border-[#DCD3DF] space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4E115A]" />
              <h4 className="text-xs font-bold text-[#1E1E24]">
                {isAr ? 'توصيات رواج لتحسين الاستهلاك' : 'Storage Optimization Insights'}
              </h4>
            </div>
            <ul className="text-xs text-[#6E6A75] space-y-2 list-disc rtl:pr-4 ltr:pl-4">
              <li>
                {isAr
                  ? 'تمثل مقاطع الفيديو والأرشيف أكثر من 70% من إجمالي المساحة؛ يمكنك تفعيل الضغط الذكي لتوفير ما يصل إلى 40%.'
                  : 'Videos and archives take over 70% of storage; consider enabling smart WebP/HEIC compression.'}
              </li>
              <li>
                {isAr
                  ? 'المزامنة الانتقائية تتيح لك الاحتفاظ بالملفات سحابياً فقط مع وصول فوري دون حجز مساحة القرص المحلي.'
                  : 'Selective sync lets you pin heavy files online only with zero egress penalty.'}
              </li>
            </ul>

            <button
              onClick={() => setActiveTab('files')}
              className="w-full py-2.5 px-3 bg-[#4E115A] hover:bg-[#3d0d46] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <FolderOpen className="w-4 h-4 text-white" />
              <span>{isAr ? 'إدارة وتنظيف الملفات الآن' : 'Manage Files in Explorer'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
