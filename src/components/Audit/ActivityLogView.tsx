import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { ActivityActionType, ActivitySeverity, ActivityLogItem } from '../../types/activity';
import {
  History,
  Upload,
  Trash2,
  FolderPlus,
  Share2,
  Lock,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Laptop,
  Globe,
  Copy,
  Check,
  RotateCcw,
  FileText,
  FileCode,
  Folder,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Hash,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export const ActivityLogView: React.FC = () => {
  const { lang, activityLogs, clearActivityLogs, logActivity, showNotification, currentUser } = useStorage();
  const isAr = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | ActivityActionType>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | ActivitySeverity>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<ActivityLogItem | null>(null);

  // Copy helper
  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification(
      `تم نسخ ${label} إلى الحافظة بنجاح`,
      `Copied ${label} to clipboard`,
      'success'
    );
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered and sorted activity logs
  const filteredLogs = useMemo(() => {
    return activityLogs
      .filter(log => {
        // Type filter
        if (selectedType !== 'all' && log.type !== selectedType) return false;
        // Severity filter
        if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (isAr ? log.titleAr : log.titleEn).toLowerCase().includes(q);
          const matchDesc = (isAr ? log.descriptionAr : log.descriptionEn).toLowerCase().includes(q);
          const matchTarget = log.targetName.toLowerCase().includes(q);
          const matchIp = log.ipAddress.toLowerCase().includes(q);
          const matchActor = log.actor.toLowerCase().includes(q);
          const matchHash = log.metadata?.sha256?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchTarget && !matchIp && !matchActor && !matchHash) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [activityLogs, selectedType, selectedSeverity, searchQuery, sortOrder, isAr]);

  // Aggregate KPI metrics
  const stats = useMemo(() => {
    const total = activityLogs.length;
    const uploads = activityLogs.filter(l => l.type === 'upload').length;
    const deletions = activityLogs.filter(l => l.type === 'delete').length;
    const folders = activityLogs.filter(l => l.type === 'create_folder').length;
    const shares = activityLogs.filter(l => l.type === 'share').length;
    const security = activityLogs.filter(l => l.type === 'security' || l.type === 'vault').length;
    return { total, uploads, deletions, folders, shares, security };
  }, [activityLogs]);

  // Format relative timestamp helper
  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return isAr ? 'الآن فوراً' : 'Just now';
    if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  // Format exact date & time
  const formatExactDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(isAr ? 'ar-YE' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // Get Action Icon and Colors
  const getActionBadge = (type: ActivityActionType) => {
    switch (type) {
      case 'upload':
        return {
          icon: Upload,
          labelAr: 'رفع ملف',
          labelEn: 'File Upload',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        };
      case 'delete':
        return {
          icon: Trash2,
          labelAr: 'حذف / سلة',
          labelEn: 'Deletion',
          bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        };
      case 'create_folder':
        return {
          icon: FolderPlus,
          labelAr: 'إنشاء مجلد',
          labelEn: 'Create Folder',
          bg: 'bg-purple-50 dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'share':
        return {
          icon: Share2,
          labelAr: 'مشاركة رابط',
          labelEn: 'Share Link',
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-[#A38540] dark:text-amber-400 border-amber-200 dark:border-amber-800',
        };
      case 'rename':
        return {
          icon: FileCode,
          labelAr: 'إعادة تسمية',
          labelEn: 'Rename',
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        };
      case 'vault':
        return {
          icon: Lock,
          labelAr: 'الخزنة المشفرة',
          labelEn: 'Vault Security',
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        };
      case 'security':
        return {
          icon: ShieldCheck,
          labelAr: 'مصادقة وأمان',
          labelEn: 'Security Auth',
          bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
        };
      default:
        return {
          icon: ActivityActionIconFallback,
          labelAr: 'نشاط نظام',
          labelEn: 'System Action',
          bg: 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700',
        };
    }
  };

  const ActivityActionIconFallback = FileText;

  // Severity pill
  const getSeverityPill = (severity: ActivitySeverity) => {
    switch (severity) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{isAr ? 'ناجح' : 'Success'}</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>{isAr ? 'تحذير' : 'Warning'}</span>
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>{isAr ? 'حذف أمني' : 'Critical'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#4E115A] dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            <Info className="w-3 h-3 text-[#4E115A] dark:text-purple-300" />
            <span>{isAr ? 'معلومات' : 'Info'}</span>
          </span>
        );
    }
  };

  // Export audit logs as CSV or JSON
  const handleExport = (format: 'json' | 'csv') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(activityLogs, null, 2);
      filename = `rawaj-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
      mimeType = 'application/json';
    } else {
      // CSV format
      const headers = ['ID', 'Type', 'Title', 'Timestamp', 'IP Address', 'Device', 'Actor', 'Severity', 'Target'];
      const rows = activityLogs.map(l => [
        l.id,
        l.type,
        `"${(isAr ? l.titleAr : l.titleEn).replace(/"/g, '""')}"`,
        l.timestamp,
        l.ipAddress,
        `"${l.device.replace(/"/g, '""')}"`,
        `"${l.actor.replace(/"/g, '""')}"`,
        l.severity,
        `"${l.targetName.replace(/"/g, '""')}"`,
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `rawaj-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(
      `تم تصدير سجل التدقيق بصيغة ${format.toUpperCase()} بنجاح`,
      `Audit log exported as ${format.toUpperCase()} successfully`,
      'success'
    );
  };

  // Simulate an audit event for testing & verification
  const handleSimulateAuditEvent = () => {
    const testActions = [
      {
        type: 'upload' as const,
        titleAr: 'رفع ملف تجريبي: تقرير_الفحص_الأمني_SOC2.pdf',
        titleEn: 'Uploaded test file: SOC2_Security_Audit_Report.pdf',
        descriptionAr: 'تم فحص بصمة الملف SHA-256 وتخزينه في السحابة المشفرة.',
        descriptionEn: 'File SHA-256 verified and securely vaulted in cloud storage.',
        targetName: 'تقرير_الفحص_الأمني_SOC2.pdf',
        targetType: 'file' as const,
        severity: 'success' as const,
        metadata: {
          fileSize: 3450000,
          mimeType: 'application/pdf',
          sha256: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
        },
      },
      {
        type: 'create_folder' as const,
        titleAr: 'إنشاء مجلد آمن: وثائق_الاعتماد_2026',
        titleEn: 'Created secure folder: Accreditation_Docs_2026',
        descriptionAr: 'تم إنشاء مجلد مشفر بنجاح مع تسجيل البصمة الزمنية.',
        descriptionEn: 'Encrypted folder created with immutable audit trail registration.',
        targetName: 'وثائق_الاعتماد_2026',
        targetType: 'folder' as const,
        severity: 'info' as const,
      },
      {
        type: 'delete' as const,
        titleAr: 'حذف ملف وسائط: تسجيل_تجريبي_مؤقت.mp4',
        titleEn: 'Deleted media file: Temporary_Test_Recording.mp4',
        descriptionAr: 'تم نقل التسجيل إلى سلة المحذوفات المؤقتة.',
        descriptionEn: 'Recording moved to temporary trash bin.',
        targetName: 'تسجيل_تجريبي_مؤقت.mp4',
        targetType: 'file' as const,
        severity: 'warning' as const,
        metadata: {
          fileSize: 18400000,
        },
      },
    ];

    const randomAction = testActions[Math.floor(Math.random() * testActions.length)];
    logActivity({
      ...randomAction,
      ipAddress: '185.191.171.12',
      device: 'Chrome 131 on macOS (Apple Silicon M3)',
      actor: currentUser?.email || 'saad@rawajye.com (م. سعد الحضرمي)',
    });

    showNotification(
      'تم تسجيل حدث تدقيق جديد لحظياً في السجل',
      'New audit event recorded in real-time',
      'success'
    );
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-0 bg-[#F9F8FA] dark:bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none"
      role="region"
      aria-label={isAr ? 'سجل التدقيق والنشاطات' : 'Security Audit & Activity Log'}
    >
      
      {/* ======================================================== */}
      {/* 1. VIEW HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCD3DF]/80 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shadow-md shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1E1E24] dark:text-white tracking-tight">
                {isAr ? 'سجل النشاطات والتدقيق الأمني' : 'Security Audit & Activity Log'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1AD062]/15 text-[#1AD062] border border-[#1AD062]/30 text-xs font-mono font-bold">
                SOC2 / ISO
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6E6A75] dark:text-slate-400 mt-0.5">
              {isAr
                ? 'سجل زمني لجميع عمليات الرفع والحذف وإنشاء المجلدات والمشاركات مع البصمات الزمنية وعناوين IP'
                : 'Immutable audit trail of uploads, deletions, folder creations, and shares with timestamps and IP addresses'}
            </p>
          </div>
        </div>

        {/* Action Controls: Export CSV/JSON, Simulate, Clear */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSimulateAuditEvent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#A38540]/40 text-[#A38540] hover:bg-[#A38540]/10 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title={isAr ? 'محاكاة تسجيل نشاط تدقيقي جديد' : 'Simulate a new audit action'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'محاكاة حدث أمني' : 'Simulate Event'}</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-[#DCD3DF] dark:border-slate-800 p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1E1E24] dark:text-white hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
              <span>CSV</span>
            </button>
            <span className="w-px h-4 bg-gray-300 dark:bg-slate-700" />
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1E1E24] dark:text-white hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
              <span>JSON</span>
            </button>
          </div>

          {/* Clear Logs */}
          <button
            type="button"
            onClick={clearActivityLogs}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shadow-xs"
            title={isAr ? 'مسح السجل' : 'Clear activity log'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. STATS OVERVIEW CARDS                                  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Events */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A75] dark:text-slate-400">
            <span className="text-[11px] font-semibold">{isAr ? 'إجمالي السجلات' : 'Total Logs'}</span>
            <History className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
          </div>
          <div className="mt-2 text-xl font-black text-[#1E1E24] dark:text-white font-mono">
            {stats.total}
          </div>
        </div>

        {/* Uploads */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A75] dark:text-slate-400">
            <span className="text-[11px] font-semibold">{isAr ? 'عمليات الرفع' : 'Uploads'}</span>
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.uploads}
          </div>
        </div>

        {/* Deletions */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A75] dark:text-slate-400">
            <span className="text-[11px] font-semibold">{isAr ? 'الحذف والسلة' : 'Deletions'}</span>
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-2 text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {stats.deletions}
          </div>
        </div>

        {/* Folders */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A75] dark:text-slate-400">
            <span className="text-[11px] font-semibold">{isAr ? 'إنشاء مجلدات' : 'Folders'}</span>
            <FolderPlus className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
          </div>
          <div className="mt-2 text-xl font-black text-[#4E115A] dark:text-purple-300 font-mono">
            {stats.folders}
          </div>
        </div>

        {/* Shares */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A75] dark:text-slate-400">
            <span className="text-[11px] font-semibold">{isAr ? 'روابط المشاركة' : 'Shared Links'}</span>
            <Share2 className="w-4 h-4 text-[#A38540] dark:text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-black text-[#A38540] dark:text-amber-400 font-mono">
            {stats.shares}
          </div>
        </div>

        {/* Security & Vault */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6E6A75] dark:text-slate-400">
            <span className="text-[11px] font-semibold">{isAr ? 'أمان وتشفير' : 'Security / E2EE'}</span>
            <ShieldCheck className="w-4 h-4 text-[#1AD062]" />
          </div>
          <div className="mt-2 text-xl font-black text-[#1AD062] font-mono">
            {stats.security}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. SEARCH & FILTER TOOLBAR                               */}
      {/* ======================================================== */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs space-y-3.5">
        
        {/* Top Search Input & Sort Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'بحث في السجلات بالاسم، نوع العملية، عنوان IP، أو بصمة SHA-256...'
                  : 'Search audit logs by file name, action type, IP address, or SHA-256...'
              }
              className="w-full h-10 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-[#DCD3DF] dark:border-slate-700 text-xs sm:text-sm text-[#1E1E24] dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#4E115A]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 -translate-y-1/2 rtl:left-3 ltr:right-3 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-xs font-bold text-[#1E1E24] dark:text-white border border-[#DCD3DF] dark:border-slate-700 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
            <span>{sortOrder === 'desc' ? (isAr ? 'الأحدث أولاً' : 'Newest First') : (isAr ? 'الأقدم أولاً' : 'Oldest First')}</span>
          </button>

        </div>

        {/* Action Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-gray-400 ml-1 rtl:ml-2">
            {isAr ? 'تصفية النوع:' : 'Type:'}
          </span>
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'upload', labelAr: 'رفع الملفات', labelEn: 'Uploads' },
            { id: 'delete', labelAr: 'الحذف والسلة', labelEn: 'Deletions' },
            { id: 'create_folder', labelAr: 'إنشاء مجلدات', labelEn: 'Folder Creations' },
            { id: 'share', labelAr: 'المشاركات', labelEn: 'Shares' },
            { id: 'rename', labelAr: 'إعادة تسمية', labelEn: 'Renames' },
            { id: 'vault', labelAr: 'الخزنة المشفرة', labelEn: 'Vault' },
            { id: 'security', labelAr: 'الأمان والمصادقة', labelEn: 'Security' },
          ].map(tab => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#4E115A] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            );
          })}
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. ACTIVITY TIMELINE LIST                                */}
      {/* ======================================================== */}
      <div className="space-y-3">
        
        <div className="flex items-center justify-between text-xs text-[#6E6A75] dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#1E1E24] dark:text-white font-mono">{filteredLogs.length}</span>
            <span>{isAr ? 'عملية مسجلة' : 'audit records found'}</span>
          </div>
          <span className="text-[11px] font-mono">
            {isAr ? 'التوقيت المحلي والتاريخ القياسي UTC' : 'All timestamps logged with IP verification'}
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300 mx-auto flex items-center justify-center">
              <History className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-[#1E1E24] dark:text-white">
              {isAr ? 'لا توجد سجلات مطابقة لمعايير البحث' : 'No activity records match your filter'}
            </h3>
            <p className="text-xs text-[#6E6A75] dark:text-slate-400 max-w-md mx-auto">
              {isAr
                ? 'جرب تغيير شروط البحث أو التصفية، أو انقر على "محاكاة حدث أمني" لتسجيل إجراء جديد فوراً.'
                : 'Try adjusting search terms or click "Simulate Event" to generate a live audit entry.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map(log => {
              const actionBadge = getActionBadge(log.type);
              const ActionIcon = actionBadge.icon;

              return (
                <div
                  key={log.id}
                  className="group relative p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF]/80 dark:border-slate-800 hover:border-[#4E115A]/40 dark:hover:border-purple-400/40 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 select-text"
                >
                  
                  {/* Left (RTL Right) side: Icon + Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    
                    {/* Action Icon Badge */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${actionBadge.bg} shadow-2xs group-hover:scale-105 transition-transform`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>

                    {/* Main Text Content */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      
                      {/* Top Badges: Action Type + Severity */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${actionBadge.bg}`}>
                          {isAr ? actionBadge.labelAr : actionBadge.labelEn}
                        </span>

                        {getSeverityPill(log.severity)}

                        <span className="text-[11px] font-mono text-[#6E6A75] dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(log.timestamp)}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-black text-[#1E1E24] dark:text-white leading-snug">
                        {isAr ? log.titleAr : log.titleEn}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#6E6A75] dark:text-slate-300 leading-relaxed">
                        {isAr ? log.descriptionAr : log.descriptionEn}
                      </p>

                      {/* Audit Details Row: IP, Device, Actor, SHA-256 */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#6E6A75] dark:text-slate-400">
                        
                        {/* IP Address Pill */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono">
                          <Globe className="w-3 h-3 text-[#4E115A] dark:text-purple-300" />
                          <span className="font-bold">{log.ipAddress}</span>
                        </span>

                        {/* Device Pill */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                          <Laptop className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[180px] sm:max-w-[260px]">{log.device}</span>
                        </span>

                        {/* File Size (if present) */}
                        {log.metadata?.fileSize && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-mono">
                            <span>{formatBytes(log.metadata.fileSize, 1, isAr)}</span>
                          </span>
                        )}

                        {/* SHA-256 Hash Chip */}
                        {log.metadata?.sha256 && (
                          <button
                            type="button"
                            onClick={() => handleCopy(log.metadata!.sha256!, log.id, 'بصمة SHA-256')}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-[10px] hover:bg-emerald-100 transition-colors cursor-pointer"
                            title={isAr ? 'انقر لنسخ بصمة التشفير' : 'Click to copy SHA-256'}
                          >
                            <Hash className="w-3 h-3" />
                            <span>SHA: {log.metadata.sha256.slice(0, 10)}...</span>
                            {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* Right side: Exact Timestamp & Inspection Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                    <div className="text-right rtl:text-right ltr:text-left">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                        {isAr ? 'التاريخ والتوقيت الدقيق' : 'Logged Timestamp'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#1E1E24] dark:text-slate-200 block" dir="ltr">
                        {formatExactDate(log.timestamp)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedLogForDetails(log)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-[#4E115A] hover:text-white dark:hover:bg-purple-900 text-[#1E1E24] dark:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isAr ? 'فحص السجل' : 'Inspect'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 5. AUDIT LOG INSPECTION MODAL                            */}
      {/* ======================================================== */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-[#DCD3DF] dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#4E115A] to-[#3a0c43] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {isAr ? 'تفاصيل سجل التدقيق الأمني' : 'Security Audit Trail Details'}
                  </h3>
                  <span className="text-[10px] font-mono text-white/80">ID: {selectedLogForDetails.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLogForDetails(null)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#1E1E24] dark:text-slate-200">
              
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">{isAr ? 'الحدث' : 'Event Action'}</span>
                  <span className="font-bold text-sm text-[#4E115A] dark:text-purple-300">{selectedLogForDetails.type}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">{isAr ? 'المستوى' : 'Severity'}</span>
                  <span className="font-bold">{selectedLogForDetails.severity}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">{isAr ? 'عنوان IP' : 'IP Address'}</span>
                  <span className="font-mono font-bold">{selectedLogForDetails.ipAddress}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</span>
                  <span className="font-mono">{selectedLogForDetails.timestamp}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">{isAr ? 'الجهاز والعميل' : 'Client Agent'}</span>
                  <span className="font-mono text-[11px]">{selectedLogForDetails.device}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono">{isAr ? 'المستخدم / المسؤول' : 'Actor'}</span>
                  <span className="font-bold">{selectedLogForDetails.actor}</span>
                </div>
              </div>

              {/* Raw JSON Audit Payload */}
              <div>
                <span className="text-xs font-bold text-[#1E1E24] dark:text-white block mb-1.5 font-mono">
                  {isAr ? 'البيانات الوصفية للتدقيق (Audit Metadata JSON):' : 'Raw Audit Payload (JSON):'}
                </span>
                <pre className="p-3.5 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800 select-text" dir="ltr">
                  {JSON.stringify(selectedLogForDetails, null, 2)}
                </pre>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(selectedLogForDetails, null, 2), selectedLogForDetails.id, 'بيانات التدقيق JSON')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-xs font-bold cursor-pointer hover:bg-gray-100"
              >
                <Copy className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
                <span>{isAr ? 'نسخ JSON' : 'Copy JSON'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-1.5 rounded-xl bg-[#4E115A] text-white font-bold text-xs hover:bg-[#3d0d46] cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
