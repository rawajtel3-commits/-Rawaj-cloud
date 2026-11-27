import React, { useState, useMemo, useEffect } from 'react';
import { useStorage } from '../../context/StorageContext';
import { formatBytes, formatDate, getFileTypeInfo } from '../../utils/formatters';
import { DuplicateGroup, DuplicateFileInfo, LargeUnusedFile, TempCacheItem } from '../../types/cleanup';
import {
  Sparkles,
  Trash2,
  Copy,
  HardDrive,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  Music,
  Folder,
  Eye,
  Check,
  Zap,
  Info,
  Filter,
  ArrowRight,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const StorageCleanupView: React.FC = () => {
  const {
    lang,
    files,
    folders,
    deleteFilesBatch,
    tempCacheStats,
    clearTempCacheCategory,
    setPreviewFile,
    showNotification,
    setActiveTab,
  } = useStorage();

  const isAr = lang === 'ar';

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [activeFilter, setActiveFilter] = useState<'all' | 'duplicates' | 'large' | 'cache'>('all');
  
  // Selection states
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [selectedCacheKeys, setSelectedCacheKeys] = useState<string[]>(['offline_chunks', 'upload_staging', 'thumbnail_cache', 'preview_buffers']);
  
  // Confirmation Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [permanentDelete, setPermanentDelete] = useState(false);

  // Trigger scan animation
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanProgress(15);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Helper to get folder name
  const getFolderName = (folderId: string | null) => {
    if (!folderId) return isAr ? 'المساحة الرئيسية (Root)' : 'Root Drive';
    const f = folders.find(folder => folder.id === folderId);
    return f ? f.name : (isAr ? 'مجلد غير معروف' : 'Unknown Folder');
  };

  // 1. Compute Duplicate Files from actual files
  const duplicateGroups = useMemo<DuplicateGroup[]>(() => {
    const checksumMap = new Map<string, typeof files>();
    
    files.filter(f => !f.isTrash && !f.isVault).forEach(f => {
      const existing = checksumMap.get(f.checksum) || [];
      existing.push(f);
      checksumMap.set(f.checksum, existing);
    });

    const groups: DuplicateGroup[] = [];

    checksumMap.forEach((groupFiles, checksum) => {
      if (groupFiles.length > 1) {
        // Sort: oldest created is considered original
        const sorted = [...groupFiles].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        const filesInfo: DuplicateFileInfo[] = sorted.map((f, idx) => ({
          id: f.id,
          name: f.name,
          folderId: f.folderId,
          folderName: getFolderName(f.folderId),
          sizeBytes: f.sizeBytes,
          updatedAt: f.updatedAt || f.createdAt,
          checksum: f.checksum,
          isOriginal: idx === 0,
          selectedForDeletion: selectedFileIds.includes(f.id),
        }));

        const singleSize = sorted[0].sizeBytes;
        groups.push({
          id: `dup-${checksum.slice(0, 10)}`,
          checksum,
          baseName: sorted[0].name,
          sizeBytes: singleSize,
          copiesCount: sorted.length,
          recoverableBytes: singleSize * (sorted.length - 1),
          files: filesInfo,
        });
      }
    });

    return groups;
  }, [files, folders, selectedFileIds]);

  // 2. Compute Large Unused Files (> 50 MB, or largest files not modified recently)
  const largeUnusedFiles = useMemo<LargeUnusedFile[]>(() => {
    const thresholdBytes = 40 * 1024 * 1024; // 40 MB
    return files
      .filter(f => !f.isTrash && !f.isVault && f.sizeBytes >= thresholdBytes)
      .map(f => {
        const fileTime = new Date(f.updatedAt || f.createdAt).getTime();
        const now = new Date('2026-11-08T07:30:00Z').getTime();
        const daysDiff = Math.max(1, Math.round((now - fileTime) / (1000 * 60 * 60 * 24)));
        
        return {
          id: f.id,
          name: f.name,
          sizeBytes: f.sizeBytes,
          type: f.type,
          extension: f.extension,
          folderId: f.folderId,
          folderName: getFolderName(f.folderId),
          updatedAt: f.updatedAt || f.createdAt,
          daysInactive: daysDiff,
          selectedForDeletion: selectedFileIds.includes(f.id),
        };
      })
      .sort((a, b) => b.sizeBytes - a.sizeBytes);
  }, [files, folders, selectedFileIds]);

  // 3. Compute Temporary Cache Items
  const tempCacheItems = useMemo<TempCacheItem[]>(() => {
    return [
      {
        id: 'offline_chunks',
        nameAr: 'حزم المزامنة المؤقتة دون اتصال',
        nameEn: 'Offline Local Chunks & Cache',
        descriptionAr: 'كتل تخزين مشفرة مؤقتاً للتصفح بدون إنترنت يمكن إعادة تنزيلها عند الطلب',
        descriptionEn: 'Locally cached encrypted chunks that can be re-fetched on demand',
        sizeBytes: tempCacheStats.offlineChunksBytes,
        itemCount: 42,
        category: 'offline_chunks',
        selectedForDeletion: selectedCacheKeys.includes('offline_chunks'),
      },
      {
        id: 'upload_staging',
        nameAr: 'بقايا ومخلفات الرفع المجزأ (Orphan Chunks)',
        nameEn: 'Resumable Upload Staging Remnants',
        descriptionAr: 'أجزاء رفع غير مكتملة أو معلقة انتهت صلاحية جلستها',
        descriptionEn: 'Incomplete multipart upload chunks with expired sessions',
        sizeBytes: tempCacheStats.uploadStagingBytes,
        itemCount: 18,
        category: 'upload_staging',
        selectedForDeletion: selectedCacheKeys.includes('upload_staging'),
      },
      {
        id: 'thumbnail_cache',
        nameAr: 'ذاكرة الصور المصغرة المؤقتة (Thumbnails)',
        nameEn: 'Thumbnail Generation Cache',
        descriptionAr: 'معاينات الصور والفيديو المخزنة لتسريع التصفح في العرض الشبكي',
        descriptionEn: 'Generated image and video previews for fast grid browsing',
        sizeBytes: tempCacheStats.thumbnailCacheBytes,
        itemCount: 124,
        category: 'thumbnail_cache',
        selectedForDeletion: selectedCacheKeys.includes('thumbnail_cache'),
      },
      {
        id: 'preview_buffers',
        nameAr: 'مؤقتات فحص البصمة ومعاينة المستندات',
        nameEn: 'SHA-256 Buffers & Doc Previews',
        descriptionAr: 'ذاكرة وسيطة ناتجة عن احتساب هاش SHA-256 ومعاينة المستندات الكبيرة',
        descriptionEn: 'Transient stream buffers from client hashing and file previews',
        sizeBytes: tempCacheStats.previewBuffersBytes,
        itemCount: 6,
        category: 'preview_buffers',
        selectedForDeletion: selectedCacheKeys.includes('preview_buffers'),
      },
    ];
  }, [tempCacheStats, selectedCacheKeys]);

  // Total recoverable calculations
  const duplicatesTotalBytes = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + g.recoverableBytes, 0);
  }, [duplicateGroups]);

  const largeFilesTotalBytes = useMemo(() => {
    return largeUnusedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  }, [largeUnusedFiles]);

  const cacheTotalBytes = useMemo(() => {
    return tempCacheItems.reduce((acc, c) => acc + c.sizeBytes, 0);
  }, [tempCacheItems]);

  const grandTotalRecoverableBytes = duplicatesTotalBytes + largeFilesTotalBytes + cacheTotalBytes;

  // Selected for deletion size
  const selectedRecoverableBytes = useMemo(() => {
    let bytes = 0;
    // Add selected files size
    selectedFileIds.forEach(id => {
      const f = files.find(file => file.id === id);
      if (f) bytes += f.sizeBytes;
    });
    // Add selected cache size
    tempCacheItems.forEach(c => {
      if (selectedCacheKeys.includes(c.id)) {
        bytes += c.sizeBytes;
      }
    });
    return bytes;
  }, [selectedFileIds, selectedCacheKeys, files, tempCacheItems]);

  // Initial auto-selection of safe duplicates on first load
  useEffect(() => {
    const autoIds: string[] = [];
    duplicateGroups.forEach(g => {
      // Pick all copies except the original
      g.files.filter(f => !f.isOriginal).forEach(f => autoIds.push(f.id));
    });
    setSelectedFileIds(autoIds);
  }, [duplicateGroups.length]);

  // Handlers for selection
  const handleToggleFileSelection = (id: string) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleCacheSelection = (key: string) => {
    setSelectedCacheKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllSafe = () => {
    const allDupNonOriginals = duplicateGroups.flatMap(g => g.files.filter(f => !f.isOriginal).map(f => f.id));
    setSelectedFileIds(allDupNonOriginals);
    setSelectedCacheKeys(['offline_chunks', 'upload_staging', 'thumbnail_cache', 'preview_buffers']);
    showNotification(
      'تم تحديد كل العناصر الآمنة (النسخ المكررة وذاكرة التخزين المؤقت)',
      'Selected all safe recommendations (duplicates & cache remnants)',
      'info'
    );
  };

  const handleDeselectAll = () => {
    setSelectedFileIds([]);
    setSelectedCacheKeys([]);
  };

  // Execute Cleanup
  const handleExecuteCleanup = () => {
    const fileCount = selectedFileIds.length;
    const cacheCount = selectedCacheKeys.length;

    if (fileCount === 0 && cacheCount === 0) {
      showNotification('لم يتم تحديد أي عناصر للتنظيف', 'No items selected for cleanup', 'warning');
      return;
    }

    // 1. Delete selected files
    if (fileCount > 0) {
      deleteFilesBatch(selectedFileIds, permanentDelete);
    }

    // 2. Clear selected cache
    if (cacheCount > 0) {
      selectedCacheKeys.forEach(k => {
        clearTempCacheCategory(k as any);
      });
    }

    const freedBytes = selectedRecoverableBytes;
    setConfirmModalOpen(false);
    setSelectedFileIds([]);
    setSelectedCacheKeys([]);

    showNotification(
      `تم تنظيف المساحة بنجاح! تم تحرير ${formatBytes(freedBytes, 1, isAr)}`,
      `Storage cleaned successfully! Freed ${formatBytes(freedBytes, 1, isAr)}`,
      'success'
    );
  };

  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#A38540]" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-[#1AD062]" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-purple-500" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-slate-500" />;
      default:
        return <FileText className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white dark:bg-slate-950 p-4 sm:p-6 lg:p-8 pb-28 space-y-6">
      
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4E115A] via-[#3d0d46] to-[#25092a] text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#1AD062]" />
              <span>{isAr ? 'محرك الفحص والتحسين الذكي للمساحة' : 'Smart Storage Optimization Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isAr ? 'تنظيف وتحرير سعة التخزين' : 'Storage Cleanup & Space Recovery'}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {isAr
                ? 'فحص آمن يكشف الملفات المتطابقة بالبصمة الرقمية SHA-256، والملفات الكبيرة غير المستخدمة، ومخلفات الرفع المؤقتة لتحرير المساحة بنقرة واحدة.'
                : 'Scans for cryptographic byte-exact duplicates, dormant large files, and temporary cache chunks to safely reclaim cloud storage with 1-click.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#4E115A] font-bold text-xs hover:bg-[#F5EFF7] transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isScanning ? 'animate-spin text-[#4E115A]' : ''}`} />
              <span>{isScanning ? (isAr ? 'جاري الفحص الدقيق...' : 'Scanning Storage...') : (isAr ? 'إعادة الفحص الشامل' : 'Re-scan Storage')}</span>
            </button>
          </div>
        </div>

        {/* Scanning Progress Bar */}
        {isScanning && (
          <div className="mt-6 space-y-1 animate-in fade-in">
            <div className="flex justify-between text-xs font-mono text-white/80">
              <span>{isAr ? 'فحص البصمات، سجلات التعديل ومجلدات الكاش...' : 'Hashing chunks, analyzing access dates & caches...'}</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-[#1AD062] transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Overview Stat Cards (3 Core Categories) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Duplicates */}
        <div
          onClick={() => setActiveFilter('duplicates')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'duplicates'
              ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5EFF7] dark:bg-purple-950/60 text-[#4E115A] flex items-center justify-center border border-[#DCD3DF] dark:border-slate-700">
              <Copy className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300">
              {duplicateGroups.length} {isAr ? 'مجموعات' : 'groups'}
            </span>
          </div>
          <div className="text-xs font-semibold text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'الملفات المكررة (SHA-256)' : 'Duplicate Files'}
          </div>
          <div className="text-xl font-black text-[#1E1E24] dark:text-white font-mono mt-1">
            {formatBytes(duplicatesTotalBytes, 1, isAr)}
          </div>
          <div className="text-[11px] text-[#6E6A75] mt-1">
            {isAr ? 'نسخ متطابقة بنسبة 100% في مجلدات مختلفة' : 'Byte-exact copies stored in multiple directories'}
          </div>
        </div>

        {/* Card 2: Large Unused */}
        <div
          onClick={() => setActiveFilter('large')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'large'
              ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
              {largeUnusedFiles.length} {isAr ? 'ملفات ضخمة' : 'files'}
            </span>
          </div>
          <div className="text-xs font-semibold text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'الملفات الضخمة غير المستخدمة' : 'Large Unused Files'}
          </div>
          <div className="text-xl font-black text-[#1E1E24] dark:text-white font-mono mt-1">
            {formatBytes(largeFilesTotalBytes, 1, isAr)}
          </div>
          <div className="text-[11px] text-[#6E6A75] mt-1">
            {isAr ? 'ملفات تتجاوز 40MB لم يتم الوصول إليها مؤخراً' : 'Files >40MB with no recent access or changes'}
          </div>
        </div>

        {/* Card 3: Cache & Temp Chunks */}
        <div
          onClick={() => setActiveFilter('cache')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'cache'
              ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-md'
              : 'bg-white dark:bg-slate-900 border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[#1AD062]/10 text-[#1AD062]">
              4 {isAr ? 'فئات كاش' : 'categories'}
            </span>
          </div>
          <div className="text-xs font-semibold text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'الملفات المؤقتة والكاش' : 'Temporary Cache & Buffers'}
          </div>
          <div className="text-xl font-black text-[#1E1E24] dark:text-white font-mono mt-1">
            {formatBytes(cacheTotalBytes, 1, isAr)}
          </div>
          <div className="text-[11px] text-[#6E6A75] mt-1">
            {isAr ? 'بقايا رفع معلقة ومؤقتات تصفح آمنة للحذف' : 'Staging buffers and offline chunks safe to purge'}
          </div>
        </div>

      </div>

      {/* Batch Cleanup Toolbar (Sticky on desktop, scrolls naturally on mobile) */}
      <div className="md:sticky md:top-0 md:z-30 bg-[#F5EFF7] dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        
        {/* Left: Summary of selection */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-[#4E115A] border border-[#DCD3DF] dark:border-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs">
            {selectedFileIds.length + selectedCacheKeys.length}
          </div>
          <div>
            <div className="text-xs font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
              <span>{isAr ? 'المساحة القابلة للتحرير المحددة:' : 'Selected Space to Free:'}</span>
              <span className="font-mono text-[#4E115A] dark:text-purple-300 font-black">
                {formatBytes(selectedRecoverableBytes, 1, isAr)}
              </span>
            </div>
            <div className="text-[11px] text-[#6E6A75] mt-0.5">
              {isAr
                ? `${selectedFileIds.length} ملفات محددة · ${selectedCacheKeys.length} فئات كاش`
                : `${selectedFileIds.length} files selected · ${selectedCacheKeys.length} cache categories`}
            </div>
          </div>
        </div>

        {/* Right: Quick Selection and Clean Action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSelectAllSafe}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1E1E24] dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-[#F5EFF7] border border-[#DCD3DF] dark:border-slate-700 transition-colors cursor-pointer"
          >
            {isAr ? 'تحديد كل المقترحات الآمنة' : 'Select All Safe'}
          </button>

          <button
            onClick={handleDeselectAll}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6E6A75] hover:text-[#1E1E24] transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء التحديد' : 'Deselect All'}
          </button>

          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={selectedFileIds.length === 0 && selectedCacheKeys.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#4E115A] hover:bg-[#3d0d46] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isAr ? 'تنظيف آمن وتحرير المساحة' : 'Safely Clean Selected'}</span>
          </button>
        </div>

      </div>

      {/* Filter Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-[#F5EFF7] dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 max-w-fit">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-white dark:bg-slate-800 text-[#4E115A] dark:text-white shadow-2xs border border-[#DCD3DF] dark:border-transparent'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          {isAr ? `كافة المقترحات (${duplicateGroups.length + largeUnusedFiles.length + tempCacheItems.length})` : `All Recommendations (${duplicateGroups.length + largeUnusedFiles.length + tempCacheItems.length})`}
        </button>

        <button
          onClick={() => setActiveFilter('duplicates')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'duplicates'
              ? 'bg-white dark:bg-slate-800 text-[#4E115A] dark:text-white shadow-2xs border border-[#DCD3DF] dark:border-transparent'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          {isAr ? `الملفات المكررة (${duplicateGroups.length})` : `Duplicates (${duplicateGroups.length})`}
        </button>

        <button
          onClick={() => setActiveFilter('large')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'large'
              ? 'bg-white dark:bg-slate-800 text-[#4E115A] dark:text-white shadow-2xs border border-[#DCD3DF] dark:border-transparent'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          {isAr ? `الملفات الضخمة (${largeUnusedFiles.length})` : `Large Files (${largeUnusedFiles.length})`}
        </button>

        <button
          onClick={() => setActiveFilter('cache')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'cache'
              ? 'bg-white dark:bg-slate-800 text-[#4E115A] dark:text-white shadow-2xs border border-[#DCD3DF] dark:border-transparent'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          {isAr ? `الملفات المؤقتة والكاش (${tempCacheItems.length})` : `Cache & Temp (${tempCacheItems.length})`}
        </button>
      </div>

      {/* Main Content Sections */}

      {/* 1. DUPLICATE FILES SECTION */}
      {(activeFilter === 'all' || activeFilter === 'duplicates') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-[#4E115A]" />
              <h2 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'الملفات المكررة المتطابقة بالبصمة (Duplicate Files)' : 'Exact Duplicate Files'}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#6E6A75]">
              {duplicateGroups.length} {isAr ? 'مجموعات مكررة' : 'duplicate sets'} · {formatBytes(duplicatesTotalBytes, 1, isAr)}
            </span>
          </div>

          {duplicateGroups.length === 0 ? (
            <div className="p-8 text-center bg-[#F5EFF7]/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-[#DCD3DF] dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-[#1AD062] mx-auto mb-2" />
              <h3 className="text-xs font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'لا توجد ملفات مكررة حالياً' : 'No duplicate files found'}
              </h3>
              <p className="text-[11px] text-[#6E6A75] mt-1">
                {isAr ? 'جميع ملفاتك فريدة وتستخدم المساحة بكفاءة تامة.' : 'All files in your drive are unique.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {duplicateGroups.map(group => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                >
                  {/* Group Header */}
                  <div className="p-3.5 bg-[#F5EFF7]/80 dark:bg-slate-800/60 border-b border-[#DCD3DF] dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 border border-[#DCD3DF] dark:border-slate-600">
                        <Copy className="w-4 h-4 text-[#4E115A]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1E1E24] dark:text-white truncate" title={group.baseName}>
                          {group.baseName}
                        </div>
                        <div className="text-[10px] text-[#6E6A75] font-mono mt-0.5">
                          SHA-256: {group.checksum.slice(0, 12)}...{group.checksum.slice(-6)} · {formatBytes(group.sizeBytes, 1, isAr)} {isAr ? 'لكل نسخة' : 'per copy'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#4E115A] dark:text-purple-300 font-mono">
                        +{formatBytes(group.recoverableBytes, 1, isAr)}
                      </span>
                      <div className="text-[10px] text-[#6E6A75]">
                        {group.copiesCount} {isAr ? 'نسخ متطابقة' : 'identical copies'}
                      </div>
                    </div>
                  </div>

                  {/* Group Copies List */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {group.files.map((file, idx) => {
                      const isSelected = selectedFileIds.includes(file.id);
                      return (
                        <div
                          key={file.id}
                          className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                            file.isOriginal ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : 'hover:bg-[#F5EFF7]/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Checkbox for duplicate copy */}
                            {!file.isOriginal ? (
                              <button
                                type="button"
                                onClick={() => handleToggleFileSelection(file.id)}
                                className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                                  isSelected
                                    ? 'bg-[#B91C1C] border-[#B91C1C] text-white'
                                    : 'border-[#DCD3DF] hover:border-[#4E115A] bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </button>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-[#1AD062]/20 text-[#1AD062] flex items-center justify-center shrink-0" title={isAr ? 'النسخة الأصلية المعتمدة' : 'Original file (kept)'}>
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#1E1E24] dark:text-white truncate">
                                  {file.name}
                                </span>
                                {file.isOriginal ? (
                                  <span className="text-[10px] bg-[#1AD062]/15 text-[#1AD062] px-2 py-0.2 rounded-full font-bold shrink-0">
                                    {isAr ? 'النسخة الأصلية (موصى بالاحتفاظ بها)' : 'Original (Keep)'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-[#B91C1C]/10 text-[#B91C1C] px-2 py-0.2 rounded-full font-bold shrink-0">
                                    {isAr ? 'نسخة مكررة' : 'Duplicate'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#6E6A75] font-mono flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Folder className="w-3 h-3 text-[#A38540]" />
                                  <span>{file.folderName}</span>
                                </span>
                                <span>·</span>
                                <span>{formatDate(file.updatedAt, isAr)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono text-[#1E1E24] dark:text-white font-medium">
                              {formatBytes(file.sizeBytes, 1, isAr)}
                            </span>
                            <button
                              onClick={() => {
                                const realFile = files.find(f => f.id === file.id);
                                if (realFile) setPreviewFile(realFile);
                              }}
                              className="p-1.5 rounded-lg text-[#6E6A75] hover:text-[#4E115A] hover:bg-[#F5EFF7] transition-colors cursor-pointer"
                              title={isAr ? 'معاينة الملف' : 'Preview'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. LARGE UNUSED FILES SECTION */}
      {(activeFilter === 'all' || activeFilter === 'large') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'الملفات الضخمة غير المستخدمة (Large Unused Files)' : 'Large Inactive Files (>40MB)'}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#6E6A75]">
              {largeUnusedFiles.length} {isAr ? 'ملفات' : 'files'} · {formatBytes(largeFilesTotalBytes, 1, isAr)}
            </span>
          </div>

          <div className="rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/80 dark:bg-slate-800/50 text-[#6E6A75] font-mono">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 font-semibold">{isAr ? 'الملف' : 'File Name'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isAr ? 'المجلد' : 'Folder'}</th>
                    <th className="py-2.5 px-3 font-semibold text-right rtl:text-left">{isAr ? 'الحجم' : 'Size'}</th>
                    <th className="py-2.5 px-3 font-semibold text-center">{isAr ? 'أيام الخمول' : 'Inactive'}</th>
                    <th className="py-2.5 px-3 font-semibold text-center">{isAr ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {largeUnusedFiles.map(file => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr
                        key={file.id}
                        className={`hover:bg-[#F5EFF7]/50 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-[#F5EFF7] dark:bg-purple-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFileSelection(file.id)}
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer mx-auto ${
                              isSelected
                                ? 'bg-[#4E115A] border-[#4E115A] text-white'
                                : 'border-[#DCD3DF] hover:border-[#4E115A] bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#F5EFF7] dark:bg-slate-800 flex items-center justify-center shrink-0 border border-[#DCD3DF] dark:border-slate-700">
                              {renderFileIcon(file.type)}
                            </div>
                            <span className="font-semibold text-[#1E1E24] dark:text-white truncate max-w-xs md:max-w-md">
                              {file.name}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-[#6E6A75] font-mono">
                          <span className="flex items-center gap-1">
                            <Folder className="w-3.5 h-3.5 text-[#A38540]" />
                            <span className="truncate max-w-[150px]">{file.folderName}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[#1E1E24] dark:text-white font-mono font-bold text-right rtl:text-left">
                          {formatBytes(file.sizeBytes, 1, isAr)}
                        </td>

                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                            {file.daysInactive} {isAr ? 'يوم' : 'days'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              const realFile = files.find(f => f.id === file.id);
                              if (realFile) setPreviewFile(realFile);
                            }}
                            className="p-1.5 rounded-lg text-[#6E6A75] hover:text-[#4E115A] hover:bg-[#F5EFF7] transition-colors cursor-pointer"
                            title={isAr ? 'معاينة الملف' : 'Preview'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEMPORARY CACHE & ORPHAN CHUNKS SECTION */}
      {(activeFilter === 'all' || activeFilter === 'cache') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'الملفات المؤقتة وبقايا الرفع (Temporary Cache & Buffers)' : 'Temporary Cache & Orphan Chunks'}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#6E6A75]">
              {formatBytes(cacheTotalBytes, 1, isAr)} {isAr ? 'قابلة للحذف الفوري' : 'safe to purge'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tempCacheItems.map(item => {
              const isSelected = selectedCacheKeys.includes(item.id);
              const isEmpty = item.sizeBytes === 0;

              return (
                <div
                  key={item.id}
                  onClick={() => !isEmpty && handleToggleCacheSelection(item.id)}
                  className={`p-4 rounded-2xl border transition-all ${
                    isEmpty
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-default'
                      : isSelected
                      ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-xs cursor-pointer'
                      : 'bg-white dark:bg-slate-900 border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 border border-[#DCD3DF] dark:border-slate-700 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E1E24] dark:text-white">
                          {isAr ? item.nameAr : item.nameEn}
                        </div>
                        <div className="text-[10px] text-[#6E6A75] mt-0.5 leading-relaxed">
                          {isAr ? item.descriptionAr : item.descriptionEn}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold font-mono text-[#1E1E24] dark:text-white">
                        {isEmpty ? (isAr ? 'نظيف' : 'Clean') : formatBytes(item.sizeBytes, 1, isAr)}
                      </div>
                      {!isEmpty && (
                        <div className="text-[10px] text-[#6E6A75] font-mono">
                          {item.itemCount} {isAr ? 'ملف مؤقت' : 'cached'}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isEmpty && (
                    <div className="mt-3 pt-2.5 border-t border-[#DCD3DF]/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isAr ? 'آمن للحذف 100%' : '100% Safe to purge'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCacheSelection(item.id);
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-[#4E115A] text-white'
                            : 'bg-white border border-[#DCD3DF] text-[#1E1E24]'
                        }`}
                      >
                        {isSelected ? (isAr ? 'محدد للتنظيف' : 'Selected') : (isAr ? 'تحديد' : 'Select')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safety & Trash Policy Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#1AD062] shrink-0 mt-0.5" />
        <div className="text-xs text-[#6E6A75] dark:text-slate-400 space-y-1">
          <span className="font-bold text-[#1E1E24] dark:text-white block">
            {isAr ? 'سياسة الأمان والاستعادة (Safety & Rollback Protection):' : 'Safety & Rollback Protection:'}
          </span>
          <p className="leading-relaxed">
            {isAr
              ? 'افتراضياً، يتم نقل الملفات المحذوفة إلى سلة المهملات المشفرة مع إمكانية استعادتها لمدة 30 يوماً. يمكنك دائماً التراجع عن أي عملية تنظيف، بينما يتم مسح كتل الكاش والمؤقتات فوراً دون أي تأثير على بياناتك الأصلية.'
              : 'By default, cleaned files are moved to the Encrypted Trash and can be restored within 30 days. Temporary cache is safely purged with zero risk to original assets.'}
          </p>
        </div>
      </div>

      {/* Safety Confirmation Dialog Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'تأكيد تنظيف وتحرير المساحة' : 'Confirm Storage Cleanup'}
                </h3>
                <p className="text-xs text-[#6E6A75] mt-0.5">
                  {isAr ? 'مراجعة العناصر المحددة قبل التنفيذ' : 'Review selected items before proceeding'}
                </p>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800/60 border border-[#DCD3DF] dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#6E6A75]">{isAr ? 'إجمالي السعة المحررة:' : 'Total Space to Free:'}</span>
                <span className="font-bold text-[#4E115A] dark:text-purple-300 font-mono text-sm">
                  {formatBytes(selectedRecoverableBytes, 1, isAr)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6E6A75]">{isAr ? 'الملفات المحددة:' : 'Selected Files:'}</span>
                <span className="font-bold text-[#1E1E24] dark:text-white font-mono">
                  {selectedFileIds.length} {isAr ? 'ملف' : 'files'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6E6A75]">{isAr ? 'فئات الكاش المؤقت:' : 'Temporary Cache:'}</span>
                <span className="font-bold text-[#1E1E24] dark:text-white font-mono">
                  {selectedCacheKeys.length} {isAr ? 'فئات' : 'categories'}
                </span>
              </div>
            </div>

            {/* Permanent vs Trash Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#DCD3DF] dark:border-slate-800 bg-slate-50 dark:bg-slate-850 cursor-pointer">
              <input
                type="checkbox"
                checked={permanentDelete}
                onChange={e => setPermanentDelete(e.target.checked)}
                className="mt-0.5 rounded text-[#4E115A] focus:ring-[#4E115A]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#1E1E24] dark:text-white block">
                  {isAr ? 'حذف فوري ونهائي (تجاوز سلة المهملات)' : 'Permanent Delete (Bypass Trash)'}
                </span>
                <span className="text-[11px] text-[#6E6A75] block mt-0.5">
                  {isAr
                    ? 'سيتم مسح الملفات فوراً دون الاحتفاظ بها في سلة المهملات لمدة 30 يوماً.'
                    : 'Permanently shred files immediately without 30-day trash recovery.'}
                </span>
              </div>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-slate-200 text-xs font-semibold hover:bg-[#F5EFF7] transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteCleanup}
                className="px-5 py-2.5 rounded-xl bg-[#4E115A] hover:bg-[#3d0d46] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isAr ? 'تأكيد التنظيف والتحرير' : 'Confirm & Clean'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
