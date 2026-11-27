import React, { useState, useMemo } from 'react';
import { useStorage, ActiveTabType } from '../../context/StorageContext';
import { StorageBreakdownDashboard } from '../Home/StorageBreakdownDashboard';
import {
  Cloud,
  Search,
  FolderLock,
  MessageSquareLock,
  Camera,
  Sparkles,
  PieChart,
  RefreshCw,
  ShieldCheck,
  History,
  Code2,
  Activity,
  Calculator,
  Scale,
  Upload,
  ArrowUpRight,
  Layers,
  X,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface CloudToolsViewProps {
  onUploadClick?: () => void;
}

type ToolCategory = 'all' | 'security' | 'backup' | 'analytics' | 'system';

interface CloudToolItem {
  id: ActiveTabType;
  category: Exclude<ToolCategory, 'all'>;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  metricAr: string;
  metricEn: string;
  icon: React.ElementType;
  accentClass: string;
}

export const CloudToolsView: React.FC<CloudToolsViewProps> = ({ onUploadClick }) => {
  const {
    lang,
    setActiveTab,
    quota,
    currentPlan,
    activityLogs,
    sessions,
    offlineCacheStats,
  } = useStorage();

  const isAr = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const usedPercent = Math.min(100, (quota.usedBytes / quota.totalBytes) * 100);
  const activeSessionsCount = sessions.length;

  const tools: CloudToolItem[] = useMemo(
    () => [
      {
        id: 'vault',
        category: 'security',
        titleAr: 'الخزنة المشفرة كلياً',
        titleEn: 'Zero-Knowledge Vault',
        subtitleAr: 'حفظ المستندات الحساسة بتشفير محلي AES-256 و Argon2id دون معرفة الخادم.',
        subtitleEn: 'Client-side AES-256 & Argon2id encrypted private storage.',
        metricAr: 'AES-256 · تشفير محلي',
        metricEn: 'AES-256 · Zero-Knowledge',
        icon: FolderLock,
        accentClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      },
      {
        id: 'messages',
        category: 'backup',
        titleAr: 'نسخ الواتساب والرسائل',
        titleEn: 'WhatsApp & SMS Backup',
        subtitleAr: 'أرشفة مشفرة طرفاً لطرف E2EE لمحادثات الواتساب والرسائل النصية مع التصدير.',
        subtitleEn: 'End-to-end encrypted WhatsApp chats and SMS cloud archive.',
        metricAr: '3 محادثات E2EE',
        metricEn: '3 E2EE Chats',
        icon: MessageSquareLock,
        accentClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-[#1AD062]',
      },
      {
        id: 'media',
        category: 'backup',
        titleAr: 'نسخ الوسائط والصور',
        titleEn: 'Camera & Media Sync',
        subtitleAr: 'مزامنة تلقائية لمعرض الكاميرا بدقة 4K مع الضغط الذكي وحفظ الجودة الأصلية.',
        subtitleEn: 'Lossless 4K camera roll backup with chronological albums.',
        metricAr: '1,420 صورة · تلقائي',
        metricEn: '1,420 Photos · Auto',
        icon: Camera,
        accentClass: 'bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300',
      },
      {
        id: 'sync',
        category: 'backup',
        titleAr: 'المزامنة الانتقائية',
        titleEn: 'Selective Sync & Offline',
        subtitleAr: 'تحديد المجلدات والملفات المتاحة دون اتصال بالإنترنت وإدارة ذاكرة التخزين المؤقت.',
        subtitleEn: 'Manage offline-pinned folders and local service-worker cache.',
        metricAr: `${offlineCacheStats.cachedFilesCount} ملفات متاحة أوفلاين`,
        metricEn: `${offlineCacheStats.cachedFilesCount} Offline Files`,
        icon: RefreshCw,
        accentClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300',
      },
      {
        id: 'cleanup',
        category: 'analytics',
        titleAr: 'تنظيف وتحرير المساحة',
        titleEn: 'Storage Cleanup',
        subtitleAr: 'فحص ذكي للملفات المكررة عبر البصمة SHA-256 والملفات الضخمة وذاكرة الكاش.',
        subtitleEn: 'Detect SHA-256 duplicates, oversized files, and safe cache.',
        metricAr: 'توفير محتمل 652 MB',
        metricEn: '652 MB Recoverable',
        icon: Sparkles,
        accentClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      },
      {
        id: 'insights',
        category: 'analytics',
        titleAr: 'رؤى وتحليلات الاستهلاك',
        titleEn: 'Storage Usage Insights',
        subtitleAr: 'مخططات تفاعلية دقيقة لتوزيع أنواع الملفات واتجاهات النمو الشهري للسحابة.',
        subtitleEn: 'Interactive charts breaking down file distribution and growth.',
        metricAr: `${usedPercent.toFixed(1)}% مستخدم`,
        metricEn: `${usedPercent.toFixed(1)}% Used`,
        icon: PieChart,
        accentClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-300',
      },
      {
        id: 'security',
        category: 'security',
        titleAr: 'الأمان وجلسات FIDO2',
        titleEn: 'Security & FIDO2 Sessions',
        subtitleAr: 'إدارة الأجهزة المتصلة ومفاتيح المرور Passkeys والمصادقة الثنائية TOTP.',
        subtitleEn: 'Manage active login devices, hardware passkeys, and 2FA.',
        metricAr: `${activeSessionsCount} جلسات نشطة`,
        metricEn: `${activeSessionsCount} Active Sessions`,
        icon: ShieldCheck,
        accentClass: 'bg-purple-50 dark:bg-purple-950/40 text-[#4A0E5C] dark:text-purple-300',
      },
      {
        id: 'activity-log',
        category: 'security',
        titleAr: 'سجل النشاطات والتدقيق',
        titleEn: 'Activity & Audit Log',
        subtitleAr: 'مسار تدقيق زمني متكامل لعمليات الرفع والحذف وإنشاء المجلدات والمشاركة.',
        subtitleEn: 'Chronological security audit trail of uploads, deletes & shares.',
        metricAr: `${activityLogs.length} حدث مسجل`,
        metricEn: `${activityLogs.length} Audit Events`,
        icon: History,
        accentClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      },
      {
        id: 'finops',
        category: 'analytics',
        titleAr: 'المحاسبة السحابية (FinOps)',
        titleEn: 'Cloud FinOps & Margins',
        subtitleAr: 'حساب تكاليف التخزين ونقل البيانات ومراقبة حدود الإنفاق السحابي الشهري.',
        subtitleEn: 'Track cloud cost allocation, margins, and spend thresholds.',
        metricAr: 'مراقبة التكاليف',
        metricEn: 'Cost Telemetry',
        icon: Calculator,
        accentClass: 'bg-amber-50 dark:bg-amber-950/40 text-[#A38540]',
      },
      {
        id: 'reconciliation',
        category: 'analytics',
        titleAr: 'مطابقة فواتير السحابة',
        titleEn: 'Cloud Billing Reconciliation',
        subtitleAr: 'رفع فواتير المزودين بصيغة JSON ومطابقتها آلياً مع سجلات الاستهلاك لكشف الفروقات وإصدار تقارير التباين.',
        subtitleEn: 'Upload JSON cloud provider invoices to detect billing discrepancies against usage logs and export variance reports.',
        metricAr: 'فحص JSON · تقارير تباين',
        metricEn: 'JSON Audit · Variance Reports',
        icon: Scale,
        accentClass: 'bg-purple-50 dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300',
      },
      {
        id: 'developer',
        category: 'system',
        titleAr: 'واجهة المطورين و S3 API',
        titleEn: 'Developer Console & S3',
        subtitleAr: 'مفاتيح الربط البرمجي المتوافقة مع AWS S3 API v4 وأمثلة التكامل البرمجي.',
        subtitleEn: 'S3-compatible API credentials, access tokens, and SDK guides.',
        metricAr: 'AWS S3 v4 · <30ms',
        metricEn: 'AWS S3 v4 · <30ms',
        icon: Code2,
        accentClass: 'bg-purple-50 dark:bg-purple-950/40 text-[#6D28D9] dark:text-purple-300',
      },
      {
        id: 'sla',
        category: 'system',
        titleAr: 'الاعتمادية والمراقبة SLA',
        titleEn: 'SLA & Observability',
        subtitleAr: 'متابعة جاهزية العقد السحابية والنسخ الجغرافي المتعدد ومؤشرات الأداء الحية.',
        subtitleEn: 'Live uptime metrics, multi-region replication, and node health.',
        metricAr: 'جاهزية 99.98%',
        metricEn: '99.98% Uptime',
        icon: Activity,
        accentClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      },
    ],
    [activityLogs.length, activeSessionsCount, offlineCacheStats.cachedFilesCount, usedPercent]
  );

  const categories: { id: ToolCategory; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All Tools' },
    { id: 'security', labelAr: 'الأمان والخصوصية', labelEn: 'Security' },
    { id: 'backup', labelAr: 'النسخ والمزامنة', labelEn: 'Backup & Sync' },
    { id: 'analytics', labelAr: 'التحليلات والتنظيف', labelEn: 'Analytics' },
    { id: 'system', labelAr: 'المطورين والنظام', labelEn: 'System & API' },
  ];

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tools.filter(tool => {
      const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        tool.titleAr.toLowerCase().includes(q) ||
        tool.titleEn.toLowerCase().includes(q) ||
        tool.subtitleAr.toLowerCase().includes(q) ||
        tool.subtitleEn.toLowerCase().includes(q)
      );
    });
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div
      className="w-full flex-1 flex flex-col bg-white dark:bg-slate-950"
      role="region"
      aria-label={isAr ? 'أدوات السحابة المتقدمة' : 'Cloud Tools'}
    >
      {/* Clean Non-Sticky Header Banner */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-purple-50/70 to-white dark:from-purple-950/20 dark:to-slate-950 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A0E5C] to-[#7C3AED] text-white flex items-center justify-center shadow-md shadow-purple-900/20 shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2E0842] dark:text-white tracking-tight">
                {isAr ? 'أدوات السحابة' : 'Cloud Tools'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {isAr
                  ? 'إدارة التشفير الصفري، النسخ الاحتياطي، التنظيف الذكي، التحليلات وواجهة المطورين في مكان واحد'
                  : 'Manage zero-knowledge vault, automated backups, cleanup, insights, and developer APIs'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {onUploadClick && (
              <button
                type="button"
                onClick={onUploadClick}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A0E5C] hover:bg-[#3B0764] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Upload className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'رفع ملف سريع' : 'Quick Upload'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('my-plans')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#2E0842] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>{isAr ? 'تفاصيل الباقة' : 'My Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6">
        
        {/* Storage Allocation Strip */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-[#2E0842] dark:text-white">
              {isAr ? 'السعة التخزينية المستهلكة' : 'Active Cloud Storage Usage'}
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {formatBytes(quota.usedBytes, 1, isAr)} / {currentPlan.storageGB} GB ({usedPercent.toFixed(1)}%)
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4A0E5C] via-[#7C3AED] to-[#C026D3] transition-all duration-500"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('available-plans')}
            className="px-4 py-2 rounded-xl bg-purple-100/80 dark:bg-purple-950/60 hover:bg-purple-200/80 dark:hover:bg-purple-900/60 text-[#4A0E5C] dark:text-purple-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            {isAr ? 'ترقية المساحة' : 'Upgrade Storage'}
          </button>
        </div>

        {/* Search & Interactive Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#4A0E5C] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-3.5 ltr:left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في أدوات السحابة...' : 'Search cloud tools...'}
              className="w-full rtl:pr-10 rtl:pl-8 ltr:pl-10 ltr:pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 -translate-y-1/2 rtl:left-2.5 ltr:right-2.5 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                aria-label={isAr ? 'مسح البحث' : 'Clear search'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Cloud Tools Responsive Grid */}
        {filteredTools.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'لا توجد أدوات مطابقة لبحثك' : 'No matching cloud tools found'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-bold text-[#7C3AED] hover:underline cursor-pointer"
            >
              {isAr ? 'إعادة عرض جميع الأدوات' : 'Show all tools'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTab(tool.id)}
                  className="group p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#7C3AED]/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-right rtl:text-right ltr:text-left flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${tool.accentClass} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#7C3AED] rtl:rotate-[-90deg] transition-colors shrink-0" />
                    </div>

                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold text-[#2E0842] dark:text-white group-hover:text-[#6D28D9] dark:group-hover:text-purple-300 transition-colors">
                        {isAr ? tool.titleAr : tool.titleEn}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {isAr ? tool.subtitleAr : tool.subtitleEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {isAr ? tool.metricAr : tool.metricEn}
                    </span>
                    <span className="font-bold text-[#6D28D9] dark:text-purple-300 group-hover:underline">
                      {isAr ? 'فتح الأداة' : 'Open Tool'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Interactive Visual Storage Breakdown Dashboard */}
        <div className="pt-2">
          <StorageBreakdownDashboard />
        </div>
      </div>
    </div>
  );
};
