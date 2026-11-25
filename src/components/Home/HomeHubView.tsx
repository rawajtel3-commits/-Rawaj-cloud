import React from 'react';
import { useStorage, ActiveTabType } from '../../context/StorageContext';
import { StorageBreakdownDashboard } from './StorageBreakdownDashboard';
import { HeroMediaSlider } from './HeroMediaSlider';
import {
  HardDrive,
  FolderLock,
  Camera,
  RefreshCw,
  Code2,
  Activity,
  Calculator,
  MessageSquareLock,
  PieChart,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Upload,
  Folder,
  Zap,
  Lock,
  Server,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface HomeHubViewProps {
  onUploadClick?: () => void;
  onNewFolderClick?: () => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  onUploadClick,
  onNewFolderClick,
}) => {
  const {
    lang,
    setActiveTab,
    files,
    folders,
    quota,
    currentPlan,
    subscriptions,
    uploadTasks,
    setPlansModalOpen,
  } = useStorage();

  const isAr = lang === 'ar';
  const activeSubscription = subscriptions[0];
  const activeUploadsCount = uploadTasks.filter(t => t.status === 'uploading' || t.status === 'hashing').length;
  const recentFiles = files.filter(f => !f.isTrash).slice(0, 3);

  // Main interactive cabins configuration
  const cabins: {
    id: ActiveTabType;
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    badgeTextAr?: string;
    badgeTextEn?: string;
    badgeColor?: string;
    metricLabelAr: string;
    metricLabelEn: string;
    metricValue: string;
    secondaryMetric?: string;
    actionLabelAr: string;
    actionLabelEn: string;
    accentBorder?: string;
  }[] = [
    {
      id: 'files',
      titleAr: 'ملفاتي ومستنداتي',
      titleEn: 'My Files & Drive',
      subtitleAr: 'تصفح وإدارة الملفات والمجلدات مع معاينة سريعة وروابط مشاركة محمية',
      subtitleEn: 'Browse and manage files, folders, shared links, and versions',
      icon: HardDrive,
      iconColor: 'text-[#4E115A] dark:text-purple-300',
      iconBg: 'bg-[#F5EFF7] dark:bg-purple-950/50',
      metricLabelAr: 'إجمالي الملفات',
      metricLabelEn: 'Total Files',
      metricValue: `${files.filter(f => !f.isTrash).length} ${isAr ? 'ملف' : 'files'}`,
      secondaryMetric: `${folders.length} ${isAr ? 'مجلد' : 'folders'}`,
      actionLabelAr: 'تصفح الملفات',
      actionLabelEn: 'Open Drive',
      accentBorder: 'hover:border-[#4E115A]',
    },
    {
      id: 'subscriptions',
      titleAr: 'اشتراكاتي وفواتيري',
      titleEn: 'My Subscriptions',
      subtitleAr: 'متابعة حالة الاشتراك النشط، سجل الفواتير، التجديد الفوري، والإشعارات',
      subtitleEn: 'Track active subscription, invoice history, renewals, and billing',
      icon: CreditCard,
      iconColor: 'text-[#A38540]',
      iconBg: 'bg-[#A38540]/10 dark:bg-amber-950/40',
      badgeTextAr: isAr ? 'نشط ومدفوع' : 'Active & Paid',
      badgeTextEn: 'Active & Paid',
      badgeColor: 'bg-[#1AD062]/10 text-[#1AD062] border border-[#1AD062]/30',
      metricLabelAr: 'قيمة الاشتراك',
      metricLabelEn: 'Current Plan',
      metricValue: `$${activeSubscription ? activeSubscription.priceUSD : currentPlan.priceMonthlyUSD} / ${isAr ? 'سنوياً' : 'yr'}`,
      secondaryMetric: isAr ? 'تجديد: 15 يناير 2027' : 'Renews: Jan 15, 2027',
      actionLabelAr: 'إدارة الاشتراكات',
      actionLabelEn: 'Manage Billing',
      accentBorder: 'hover:border-[#A38540]',
    },
    {
      id: 'my-plans',
      titleAr: 'باقاتي وسعة التخزين',
      titleEn: 'My Plans & Quota',
      subtitleAr: 'تفاصيل الباقة الحالية، استهلاك السعة، الميزات المفعلة، وأيام التجديد',
      subtitleEn: 'Current active plan resources, storage usage, and active features',
      icon: Layers,
      iconColor: 'text-[#4E115A] dark:text-purple-300',
      iconBg: 'bg-[#F5EFF7] dark:bg-purple-950/50',
      metricLabelAr: 'السعة المستخدمة',
      metricLabelEn: 'Used Space',
      metricValue: formatBytes(quota.usedBytes, 1, isAr),
      secondaryMetric: `${isAr ? 'من أصل' : 'of'} ${currentPlan.storageGB} GB`,
      actionLabelAr: 'عرض تفاصيل باقاتي',
      actionLabelEn: 'View Quotas',
      accentBorder: 'hover:border-[#4E115A]',
    },
    {
      id: 'available-plans',
      titleAr: 'الخطط والباقات المتاحة',
      titleEn: 'Available Plans & Store',
      subtitleAr: 'استعراض خطط التخزين، مقارنة الميزات، وبوابات الدفع مع تجربة مجانية 14 يوماً',
      subtitleEn: 'Explore storage tiers, feature matrix, payment gateways, and free trial',
      icon: Zap,
      iconColor: 'text-[#A38540]',
      iconBg: 'bg-[#A38540]/10 dark:bg-amber-950/40',
      badgeTextAr: isAr ? 'خصم 20% سنوي' : '20% Off Annual',
      badgeTextEn: '20% Off',
      badgeColor: 'bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 border border-[#4E115A]/30',
      metricLabelAr: 'الخطط المتاحة',
      metricLabelEn: 'Available Tiers',
      metricValue: isAr ? '4 باقات سحابية' : '4 Cloud Tiers',
      secondaryMetric: isAr ? 'تبدأ من $0 مجاناً' : 'Starts at $0 free',
      actionLabelAr: 'استعراض الخطط',
      actionLabelEn: 'Browse Plans',
      accentBorder: 'hover:border-[#A38540]',
    },
    {
      id: 'services',
      titleAr: 'الخدمات الرقمية وحلول السحابة',
      titleEn: 'Digital Services & Hostinger',
      subtitleAr: 'حجز دومينات هوستينجر (.com, .ye, .ai) وتفعيل اشتراكات منصات الذكاء الاصطناعي',
      subtitleEn: 'Hostinger domains registration, DNS, SSL, and official AI tools subscriptions',
      icon: Globe,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
      badgeTextAr: isAr ? 'دومينات وذكاء اصطناعي' : 'Domains & AI',
      badgeTextEn: 'Domains & AI',
      badgeColor: 'bg-cyan-600/10 text-cyan-600 border border-cyan-600/30',
      metricLabelAr: 'الدومينات والذكاء الاصطناعي',
      metricLabelEn: 'Services Catalog',
      metricValue: isAr ? 'هوستينجر + 8 منصات AI' : 'Hostinger + 8 AI Platforms',
      secondaryMetric: isAr ? 'دفع محلي وتفعيل فوري' : 'Local payment & instant activation',
      actionLabelAr: 'استعراض الخدمات',
      actionLabelEn: 'Explore Services',
      accentBorder: 'hover:border-cyan-600',
    },
    {
      id: 'vault',
      titleAr: 'الخزنة المشفرة كلياً',
      titleEn: 'Zero-Knowledge Vault',
      subtitleAr: 'حفظ المستندات الحساسة بتشفير العميل AES-256 و Argon2id دون معرفة السيرفر',
      subtitleEn: 'Client-side E2EE private storage protected by master password',
      icon: FolderLock,
      iconColor: 'text-[#1AD062]',
      iconBg: 'bg-[#1AD062]/10 dark:bg-emerald-950/40',
      badgeTextAr: 'E2EE',
      badgeTextEn: 'E2EE',
      badgeColor: 'bg-[#1AD062]/15 text-[#1AD062] border border-[#1AD062]/30',
      metricLabelAr: 'بروتوكول التشفير',
      metricLabelEn: 'Encryption Standard',
      metricValue: 'Argon2id + AES-256',
      secondaryMetric: isAr ? 'المفتاح محلي على جهازك' : 'Private Key Client-side',
      actionLabelAr: 'فتح الخزنة',
      actionLabelEn: 'Access Vault',
      accentBorder: 'hover:border-[#1AD062]',
    },
    {
      id: 'media',
      titleAr: 'نسخ الوسائط والصور',
      titleEn: 'Media & Camera Backup',
      subtitleAr: 'مزامنة تلقائية لمعرض الكاميرا 4K مع تقنيات الضغط الذكي بدون فقد الجودة',
      subtitleEn: 'Automatic camera roll sync with lossless smart compression',
      icon: Camera,
      iconColor: 'text-[#4E115A] dark:text-purple-300',
      iconBg: 'bg-[#F5EFF7] dark:bg-purple-950/50',
      metricLabelAr: 'الصور المتزامنة',
      metricLabelEn: 'Synced Media',
      metricValue: '1,420',
      secondaryMetric: isAr ? 'النسخ الذكي مفعل' : 'Auto-Sync Active',
      actionLabelAr: 'إدارة الوسائط',
      actionLabelEn: 'Open Media',
      accentBorder: 'hover:border-[#4E115A]',
    },
    {
      id: 'messages',
      titleAr: 'نسخ الواتساب والرسائل',
      titleEn: 'SMS & WhatsApp Backup',
      subtitleAr: 'أرشفة مشفرة E2EE لمحادثات الواتساب والرسائل النصية مع إمكانية التصدير',
      subtitleEn: 'Encrypted backup for WhatsApp conversations and SMS archives',
      icon: MessageSquareLock,
      iconColor: 'text-[#1AD062]',
      iconBg: 'bg-[#1AD062]/10 dark:bg-emerald-950/40',
      metricLabelAr: 'المحادثات المؤرشفة',
      metricLabelEn: 'Active Chats',
      metricValue: '3 محادثات E2EE',
      secondaryMetric: isAr ? 'محدثة اليوم' : 'Synced today',
      actionLabelAr: 'عرض المحادثات',
      actionLabelEn: 'View Messages',
      accentBorder: 'hover:border-[#1AD062]',
    },
    {
      id: 'insights',
      titleAr: 'رؤى وتحليلات الاستهلاك',
      titleEn: 'Storage Insights',
      subtitleAr: 'مخططات تفاعلية D3/Recharts توضح توزيع أنواع الملفات والنمو التاريخي',
      subtitleEn: 'Visual distribution charts showing storage allocation and trends',
      icon: PieChart,
      iconColor: 'text-[#4E115A] dark:text-purple-300',
      iconBg: 'bg-[#F5EFF7] dark:bg-purple-950/50',
      metricLabelAr: 'الفئة الأكثر استهلاكاً',
      metricLabelEn: 'Top Category',
      metricValue: isAr ? 'الوسائط والفيديو' : 'Media & Video',
      secondaryMetric: formatBytes(quota.breakdown.videos + quota.breakdown.images, 1, isAr),
      actionLabelAr: 'استعراض التحليلات',
      actionLabelEn: 'View Insights',
      accentBorder: 'hover:border-[#4E115A]',
    },
    {
      id: 'cleanup',
      titleAr: 'تنظيف وتحرير المساحة',
      titleEn: 'Storage Cleanup',
      subtitleAr: 'فحص فوري للملفات المكررة بالبصمة SHA-256 والملفات الكبيرة وذاكرة التخزين المؤقت',
      subtitleEn: 'Scan for duplicates, large unused files, and temporary cache',
      icon: Sparkles,
      iconColor: 'text-[#A38540]',
      iconBg: 'bg-[#A38540]/10 dark:bg-amber-950/40',
      badgeTextAr: isAr ? 'توفير محتمل: 652 MB' : 'Recoverable: 652 MB',
      badgeTextEn: '652 MB Recoverable',
      badgeColor: 'bg-[#A38540]/10 text-[#A38540] border border-[#A38540]/30',
      metricLabelAr: 'ملفات مكررة قابلة للحذف',
      metricLabelEn: 'Duplicate Files',
      metricValue: isAr ? '2 ملفات مكررة' : '2 Duplicates',
      secondaryMetric: isAr ? 'تنظيف آمن 100%' : '100% Safe',
      actionLabelAr: 'بدء فحص التنظيف',
      actionLabelEn: 'Start Cleanup',
      accentBorder: 'hover:border-[#A38540]',
    },
    {
      id: 'security',
      titleAr: 'الأمان وجلسات FIDO2',
      titleEn: 'Security & FIDO2',
      subtitleAr: 'إدارة أجهزة تسجيل الدخول، مفاتيح المرور Passkeys، والمصادقة الثنائية TOTP',
      subtitleEn: 'Manage active login sessions, hardware passkeys, and two-factor auth',
      icon: ShieldCheck,
      iconColor: 'text-[#1AD062]',
      iconBg: 'bg-[#1AD062]/10 dark:bg-emerald-950/40',
      metricLabelAr: 'حالة الأمان',
      metricLabelEn: 'Security Status',
      metricValue: isAr ? 'حماية قصوى مفعلة' : 'Hardware Backed',
      secondaryMetric: isAr ? '2 أجهزة نشطة' : '2 Active Sessions',
      actionLabelAr: 'إعدادات الأمان',
      actionLabelEn: 'Open Security',
      accentBorder: 'hover:border-[#1AD062]',
    },
    {
      id: 'developer',
      titleAr: 'المطورين و S3 API',
      titleEn: 'Developer Console & S3',
      subtitleAr: 'مفاتيح الربط البرمجي S3 Compatible، رموز الوصول، وتوثيق SDK',
      subtitleEn: 'S3-compatible API credentials, access tokens, and SDK code examples',
      icon: Code2,
      iconColor: 'text-[#4E115A] dark:text-purple-300',
      iconBg: 'bg-[#F5EFF7] dark:bg-purple-950/50',
      metricLabelAr: 'بروتوكول التوافق',
      metricLabelEn: 'Protocol Version',
      metricValue: 'AWS S3 API v4',
      secondaryMetric: isAr ? 'زمن الاستجابة <30ms' : 'Latency <30ms',
      actionLabelAr: 'لوحة المطورين',
      actionLabelEn: 'API Console',
      accentBorder: 'hover:border-[#4E115A]',
    },
    {
      id: 'sla',
      titleAr: 'الاعتمادية والمراقبة 99.9%',
      titleEn: 'SLA & Observability',
      subtitleAr: 'مراقبة حية لعقد التخزين، اختبارات الصحة الدورية، ومؤشرات الجاهزية',
      subtitleEn: 'Real-time uptime metrics, health check endpoints, and SLA telemetry',
      icon: Activity,
      iconColor: 'text-[#1AD062]',
      iconBg: 'bg-[#1AD062]/10 dark:bg-emerald-950/40',
      metricLabelAr: 'نسبة الجاهزية',
      metricLabelEn: 'Uptime SLA',
      metricValue: '99.98%',
      secondaryMetric: isAr ? '3 أقاليم سحابية متزامنة' : '3 Multi-Cloud Regions',
      actionLabelAr: 'لوحة المراقبة',
      actionLabelEn: 'View Metrics',
      accentBorder: 'hover:border-[#1AD062]',
    },
  ];

  return (
    <div
      className="flex-1 space-y-6 sm:space-y-8 overflow-y-auto pb-10"
      role="region"
      aria-label={isAr ? 'الصفحة الرئيسية ولوحة خدمات رواج' : 'Rawaj Cloud Home Hub'}
    >
      
      {/* 1. Curved Top Hero Section matching user screenshot */}
      <div className="bg-[#4E115A] dark:bg-purple-950 pb-8 pt-3 px-3 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-xl text-white">
        <div className="max-w-7xl mx-auto">
          {/* Dynamic Hero Media Slider for Ads, App Videos, Logos & Mockup */}
          <HeroMediaSlider />
        </div>
      </div>

      {/* 2. Middle Section: "خدمات رواج" matching user screenshot exactly */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Section Header */}
        <div className="space-y-1.5 text-right rtl:text-right ltr:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-[#4E115A] dark:text-purple-300 tracking-tight">
            {isAr ? 'خدمات رواج' : 'Rawaj Services'}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7585] dark:text-slate-400 font-medium">
            {isAr ? 'مساحة منظّمة لخدماتك الرقمية' : 'An organized space for your digital services'}
          </p>
          {/* Yellow/Golden Accent Bar matching screenshot */}
          <div className="w-14 h-1.5 bg-[#F5BA13] rounded-full mt-1" />
        </div>

        {/* 6 Large Rounded White Cards in a 2-Column Grid (3 on tablet/desktop) */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4.5 pt-1"
          role="grid"
          aria-label={isAr ? 'شبكة خدمات رواج الرئيسية' : 'Core Rawaj Services Grid'}
        >
          {cabins.slice(0, 6).map(cabin => {
            const Icon = cabin.icon;

            return (
              <div
                key={cabin.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab(cabin.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab(cabin.id);
                  }
                }}
                aria-label={isAr ? cabin.titleAr : cabin.titleEn}
                className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none min-h-[120px] sm:min-h-[145px] focus:outline-hidden focus:ring-2 focus:ring-[#4E115A]/30"
              >
                {/* Top Row: Icon + Badge / Arrow */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${cabin.iconBg} flex items-center justify-center shrink-0 border border-transparent group-hover:border-[#DCD3DF] transition-all`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cabin.iconColor} transition-transform group-hover:scale-110`} />
                  </div>

                  <span className="p-1 rounded-xl text-gray-400 group-hover:text-[#4E115A] dark:group-hover:text-purple-300 transition-colors">
                    <ArrowUpRight className="w-4 h-4 rtl:rotate-[-90deg] group-hover:scale-110 transition-transform" />
                  </span>
                </div>

                {/* Card Title & Subtitle */}
                <div className="mt-3">
                  <h3 className="text-xs sm:text-sm font-bold text-[#1E1E24] dark:text-white group-hover:text-[#4E115A] dark:group-hover:text-purple-300 transition-colors leading-snug">
                    {isAr ? cabin.titleAr : cabin.titleEn}
                  </h3>
                  <p className="text-[11px] text-[#7A7585] dark:text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                    {isAr ? cabin.subtitleAr : cabin.subtitleEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 3. Additional Workspace Tools & System Observability (Available below) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-2">
        
        {/* Quick Storage Status Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF]/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1AD062]" />
              <span className="text-xs font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'حالة السعة التخزينية الحالية' : 'Current Storage Allocation'}
              </span>
            </div>
            <div className="text-xs font-mono text-[#6E6A75] dark:text-slate-400">
              {formatBytes(quota.usedBytes, 1, isAr)} / {currentPlan.storageGB} GB (
              {((quota.usedBytes / quota.totalBytes) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4E115A] via-[#A38540] to-[#1AD062] transition-all duration-500"
                style={{
                  width: `${Math.min(100, (quota.usedBytes / quota.totalBytes) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onUploadClick && (
              <button
                type="button"
                onClick={onUploadClick}
                className="px-4 py-2 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'رفع ملف' : 'Upload'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('available-plans')}
              className="px-4 py-2 rounded-xl bg-[#A38540]/10 hover:bg-[#A38540]/20 text-[#A38540] font-bold text-xs border border-[#A38540]/30 transition-all cursor-pointer"
            >
              <span>{isAr ? 'ترقية الباقة' : 'Upgrade'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Visual Storage Breakdown Dashboard (Recharts) */}
        <StorageBreakdownDashboard />

        {/* Remaining Advanced Platform Cabins Grid Header */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1E1E24] dark:text-white flex items-center gap-2">
              <span className="w-2 h-5 rounded-full bg-[#A38540]" />
              <span>{isAr ? 'أدوات وكبائن إضافية للمنصة' : 'Advanced Workspace Cabins'}</span>
            </h3>
            <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
              {isAr
                ? 'خدمات الأمان FIDO2، تحليلات الاستهلاك، واجهة المطورين S3 API والموثوقية'
                : 'FIDO2 security, storage insights, S3 developer API and SLA monitoring'}
            </p>
          </div>
        </div>

        {/* Advanced Cabins Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="grid"
          aria-label={isAr ? 'شبكة الكبائن الإضافية' : 'Additional cabins grid'}
        >
          {cabins.slice(6).map(cabin => {
            const Icon = cabin.icon;

            return (
              <div
                key={cabin.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab(cabin.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab(cabin.id);
                  }
                }}
                aria-label={isAr ? cabin.titleAr : cabin.titleEn}
                className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 ${cabin.accentBorder} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-[#4E115A]/30`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-2xl ${cabin.iconBg} flex items-center justify-center shrink-0 border border-transparent group-hover:border-[#DCD3DF] transition-all`}>
                      <Icon className={`w-5 h-5 ${cabin.iconColor} transition-transform group-hover:scale-110`} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {cabin.badgeTextAr && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cabin.badgeColor}`}>
                          {isAr ? cabin.badgeTextAr : cabin.badgeTextEn}
                        </span>
                      )}
                      <ArrowUpRight className="w-4 h-4 text-[#6E6A75] group-hover:text-[#4E115A] rtl:rotate-[-90deg] transition-transform" />
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[#1E1E24] dark:text-white group-hover:text-[#4E115A] dark:group-hover:text-purple-300 transition-colors">
                    {isAr ? cabin.titleAr : cabin.titleEn}
                  </h4>
                  <p className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-1 line-clamp-2">
                    {isAr ? cabin.subtitleAr : cabin.subtitleEn}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#DCD3DF]/50 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[#6E6A75] dark:text-slate-400">
                    {cabin.metricValue}
                  </span>
                  <span className="font-bold text-[#4E115A] dark:text-purple-300 group-hover:underline">
                    {isAr ? cabin.actionLabelAr : cabin.actionLabelEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
