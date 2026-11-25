import React from 'react';
import { useStorage, ActiveTabType } from '../context/StorageContext';
import { ArrowRight, ArrowLeft, Home, ChevronLeft, ChevronRight } from 'lucide-react';

const TAB_LABELS: Record<ActiveTabType, { ar: string; en: string }> = {
  home: { ar: 'الرئيسية', en: 'Home' },
  files: { ar: 'ملفاتي ومستنداتي', en: 'My Files' },
  subscriptions: { ar: 'اشتراكاتي وفواتيري', en: 'My Subscriptions' },
  'my-plans': { ar: 'باقاتي وسعة التخزين', en: 'My Plans & Quotas' },
  'available-plans': { ar: 'الخطط والباقات المتاحة', en: 'Available Plans' },
  plans: { ar: 'الخطط والباقات المتاحة', en: 'Available Plans' },
  services: { ar: 'الخدمات الرقمية', en: 'Digital Services' },
  vault: { ar: 'الخزنة المشفرة كلياً', en: 'Zero-Knowledge Vault' },
  media: { ar: 'نسخ الوسائط والصور', en: 'Media & Camera Backup' },
  messages: { ar: 'نسخ الواتساب والرسائل', en: 'WhatsApp & SMS Backup' },
  sync: { ar: 'المزامنة الانتقائية', en: 'Selective Sync' },
  security: { ar: 'الأمان والجلسات النشطة', en: 'Security & Sessions' },
  developer: { ar: 'واجهة المطورين و S3 API', en: 'Developer API & S3' },
  sla: { ar: 'الاعتمادية ومؤشرات SLA', en: 'SLA & Observability' },
  finops: { ar: 'المحاسبة السحابية (FinOps)', en: 'Cloud FinOps' },
  insights: { ar: 'رؤى وتحليلات الاستهلاك', en: 'Storage Insights' },
  cleanup: { ar: 'تنظيف وتحرير المساحة', en: 'Storage Cleanup' },
  auth: { ar: 'بوابة الحساب وتسجيل الدخول', en: 'Account & Sign In' },
  'activity-log': { ar: 'سجل النشاطات والتدقيق الأمني', en: 'Activity & Audit Log' },
};

export const SubPageBackBar: React.FC = () => {
  const {
    lang,
    activeTab,
    setActiveTab,
    previousTab,
    goBack,
    currentFolderId,
    setCurrentFolderId,
    folders,
  } = useStorage();

  if (activeTab === 'home') return null;

  const isAr = lang === 'ar';
  const currentLabel = TAB_LABELS[activeTab] || { ar: 'صفحة فرعية', en: 'Subpage' };
  const currentFolder =
    activeTab === 'files' && currentFolderId
      ? folders.find(f => f.id === currentFolderId) || null
      : null;

  const handleBackClick = () => {
    if (activeTab === 'files' && currentFolderId) {
      const parentId = currentFolder?.parentId ?? null;
      setCurrentFolderId(parentId);
      return;
    }
    goBack();
  };

  const backTargetLabel = (() => {
    if (activeTab === 'files' && currentFolderId) {
      if (currentFolder?.parentId) {
        const parent = folders.find(f => f.id === currentFolder.parentId);
        if (parent) return parent.name;
      }
      return isAr ? 'ملفاتي' : 'My Files';
    }
    if (previousTab && previousTab !== activeTab) {
      return isAr ? TAB_LABELS[previousTab].ar : TAB_LABELS[previousTab].en;
    }
    return isAr ? 'الرئيسية' : 'Home';
  })();

  const BackIcon = isAr ? ArrowRight : ArrowLeft;
  const BreadcrumbSep = isAr ? ChevronLeft : ChevronRight;

  return (
    <div
      className="shrink-0 bg-[#F9F6FB] dark:bg-slate-900/95 border-b border-[#DCD3DF]/80 dark:border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none"
      role="navigation"
      aria-label={isAr ? 'شريط الرجوع للصفحة الفرعية' : 'Sub-page back navigation'}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Primary Back Button */}
        <button
          type="button"
          onClick={handleBackClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#4E115A] text-[#4E115A] dark:text-purple-200 hover:text-white border border-[#DCD3DF] dark:border-slate-700 hover:border-[#4E115A] font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
          title={isAr ? `رجوع إلى ${backTargetLabel}` : `Back to ${backTargetLabel}`}
        >
          <BackIcon className="w-4 h-4 shrink-0" />
          <span>{isAr ? 'رجوع' : 'Back'}</span>
        </button>

        {/* Context Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#6E6A75] dark:text-slate-400 min-w-0 overflow-hidden">
          <span className="hidden sm:inline truncate max-w-[140px]">
            {backTargetLabel}
          </span>
          <BreadcrumbSep className="w-3.5 h-3.5 shrink-0 hidden sm:inline opacity-60" />
          <span className="font-extrabold text-[#1E1E24] dark:text-white truncate">
            {currentFolder
              ? currentFolder.name
              : isAr
                ? currentLabel.ar
                : currentLabel.en}
          </span>
        </div>
      </div>

      {/* Quick Home Button when previous page isn't Home */}
      {(previousTab && previousTab !== 'home') || currentFolder ? (
        <button
          type="button"
          onClick={() => {
            setCurrentFolderId(null);
            setActiveTab('home');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#4E115A] dark:text-purple-300 border border-[#DCD3DF]/80 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
          title={isAr ? 'العودة إلى الرئيسية' : 'Return to Home'}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAr ? 'الرئيسية' : 'Home'}</span>
        </button>
      ) : null}
    </div>
  );
};
