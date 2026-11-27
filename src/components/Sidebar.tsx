import React from 'react';
import { useStorage } from '../context/StorageContext';
import {
  HardDrive,
  FolderLock,
  Camera,
  RefreshCw,
  Share2,
  WifiOff,
  Trash2,
  ShieldCheck,
  Code2,
  Activity,
  Calculator,
  Scale,
  MessageSquareLock,
  Plus,
  FolderPlus,
  Upload,
  Zap,
  Sparkles,
  X,
  PieChart,
  Home,
  Receipt,
  Layers,
  Globe,
  User,
  LogOut,
  History,
  BadgeCheck,
} from 'lucide-react';
import { StorageQuotaWidget } from './Sidebar/StorageQuotaWidget';

interface SidebarProps {
  onNewFolderClick: () => void;
  onUploadClick: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewFolderClick,
  onUploadClick,
  mobileOpen = false,
  onMobileClose,
}) => {
  const {
    lang,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
  } = useStorage();

  const isAr = lang === 'ar';

  const hubItems = [
    {
      id: 'home',
      labelAr: 'الرئيسية (لوحة الكبائن)',
      labelEn: 'Home Hub',
      icon: Home,
      action: () => setActiveTab('home'),
      isActive: activeTab === 'home',
    },
    {
      id: 'subscriptions',
      labelAr: 'اشتراكاتي',
      labelEn: 'My Subscriptions',
      icon: Receipt,
      action: () => setActiveTab('subscriptions'),
      isActive: activeTab === 'subscriptions',
      badge: isAr ? 'نشط' : 'Active',
      badgeColor: 'text-[#1AD062] bg-[#1AD062]/10 border border-[#1AD062]/20',
    },
    {
      id: 'my-plans',
      labelAr: 'باقاتي ومخصصاتي',
      labelEn: 'My Plans & Quotas',
      icon: Layers,
      action: () => setActiveTab('my-plans'),
      isActive: activeTab === 'my-plans',
    },
    {
      id: 'available-plans',
      labelAr: 'الخطط المتاحة والترقية',
      labelEn: 'Available Plans',
      icon: Sparkles,
      action: () => setActiveTab('available-plans'),
      isActive: activeTab === 'available-plans' || activeTab === 'plans',
      badge: isAr ? 'خصم 20%' : '-20%',
      badgeColor: 'text-[#A38540] bg-[#A38540]/10 border border-[#A38540]/20',
    },
    {
      id: 'services',
      labelAr: 'الخدمات (دومينات & ذكاء اصطناعي)',
      labelEn: 'Digital Services',
      icon: Globe,
      action: () => setActiveTab('services'),
      isActive: activeTab === 'services',
      badge: isAr ? 'هوستينجر & AI' : 'Hostinger & AI',
      badgeColor: 'text-cyan-600 bg-cyan-50 border border-cyan-200 dark:bg-cyan-950/50 dark:border-cyan-800',
    },
    {
      id: 'social-verification',
      labelAr: 'توثيق حسابات التواصل الاجتماعي',
      labelEn: 'Social Media Verification',
      icon: BadgeCheck,
      action: () => setActiveTab('social-verification'),
      isActive: activeTab === 'social-verification',
      badge: isAr ? 'الشارة الزرقاء' : 'Verified',
      badgeColor: 'text-sky-600 bg-sky-50 border border-sky-200 dark:bg-sky-950/50 dark:border-sky-800',
    },
    {
      id: 'auth',
      labelAr: 'تسجيل الدخول / حساب جديد',
      labelEn: 'Sign In / Register',
      icon: User,
      action: () => setActiveTab('auth'),
      isActive: activeTab === 'auth',
      badge: isAr ? 'بوابة الحساب' : 'Portal',
      badgeColor: 'text-[#4E115A] bg-[#F5EFF7] border border-[#DCD3DF]',
    },
  ];

  const navItems = [
    {
      id: 'files',
      labelAr: 'جميع الملفات',
      labelEn: 'All Files',
      icon: HardDrive,
      action: () => {
        setActiveTab('files');
        setActiveCategory('all');
      },
      isActive: activeTab === 'files' && activeCategory === 'all',
      badge: undefined,
    },
    {
      id: 'vault',
      labelAr: 'الخزنة المشفرة كلياً',
      labelEn: 'Zero-Knowledge Vault',
      icon: FolderLock,
      action: () => {
        setActiveTab('vault');
      },
      isActive: activeTab === 'vault',
      badge: isAr ? 'E2EE' : 'E2EE',
      badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      id: 'media',
      labelAr: 'الصور والوسائط التلقائية',
      labelEn: 'Camera Roll & Media',
      icon: Camera,
      action: () => {
        setActiveTab('media');
      },
      isActive: activeTab === 'media',
    },
    {
      id: 'messages',
      labelAr: 'نسخ الرسائل والواتساب',
      labelEn: 'SMS & WhatsApp Backup',
      icon: MessageSquareLock,
      action: () => {
        setActiveTab('messages');
      },
      isActive: activeTab === 'messages',
      badge: 'E2EE',
      badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      id: 'sync',
      labelAr: 'المزامنة الانتقائية (الكاش)',
      labelEn: 'Selective Sync (Offline)',
      icon: RefreshCw,
      action: () => {
        setActiveTab('sync');
      },
      isActive: activeTab === 'sync',
    },
    {
      id: 'shared',
      labelAr: 'المشاركات والروابط',
      labelEn: 'Shared Links',
      icon: Share2,
      action: () => {
        setActiveTab('files');
        setActiveCategory('shared');
      },
      isActive: activeTab === 'files' && activeCategory === 'shared',
    },
    {
      id: 'offline',
      labelAr: 'متاح دون اتصال (Offline)',
      labelEn: 'Available Offline',
      icon: WifiOff,
      action: () => {
        setActiveTab('files');
        setActiveCategory('all');
      },
      isActive: false,
    },
    {
      id: 'trash',
      labelAr: 'سلة المحذوفات',
      labelEn: 'Trash',
      icon: Trash2,
      action: () => {
        setActiveTab('files');
        setActiveCategory('trash');
      },
      isActive: activeTab === 'files' && activeCategory === 'trash',
    },
  ];

  const adminItems = [
    {
      id: 'cloud-tools',
      labelAr: 'أدوات السحابة',
      labelEn: 'Cloud Tools',
      icon: Sparkles,
      action: () => setActiveTab('cloud-tools'),
      isActive: activeTab === 'cloud-tools',
    },
    {
      id: 'security',
      labelAr: 'الأمان والجلسات النشطة',
      labelEn: 'Security & Active Sessions',
      icon: ShieldCheck,
      action: () => setActiveTab('security'),
      isActive: activeTab === 'security',
    },
    {
      id: 'activity-log',
      labelAr: 'سجل النشاطات والتدقيق الأمني',
      labelEn: 'Activity & Audit Log',
      icon: History,
      action: () => setActiveTab('activity-log'),
      isActive: activeTab === 'activity-log',
      badge: isAr ? 'تدقيق' : 'Audit',
      badgeColor: 'text-[#1AD062] bg-[#1AD062]/10 border border-[#1AD062]/20',
    },
    {
      id: 'developer',
      labelAr: 'واجهة S3 API والمطورين',
      labelEn: 'S3 API & SDKs',
      icon: Code2,
      action: () => setActiveTab('developer'),
      isActive: activeTab === 'developer',
    },
    {
      id: 'sla',
      labelAr: 'الاعتمادية ومؤشرات SLA',
      labelEn: 'SLA (99.9%) & Durability',
      icon: Activity,
      action: () => setActiveTab('sla'),
      isActive: activeTab === 'sla',
    },
    {
      id: 'insights',
      labelAr: 'رؤى استهلاك التخزين (Insights)',
      labelEn: 'Storage Usage Insights',
      icon: PieChart,
      action: () => setActiveTab('insights'),
      isActive: activeTab === 'insights',
      badge: isAr ? 'جديد' : 'New',
      badgeColor: 'text-[#4E115A] bg-[#F5EFF7] border border-[#DCD3DF]',
    },
    {
      id: 'cleanup',
      labelAr: 'تنظيف وتحرير المساحة',
      labelEn: 'Storage Cleanup',
      icon: Sparkles,
      action: () => setActiveTab('cleanup'),
      isActive: activeTab === 'cleanup',
      badge: isAr ? 'تنظيف ذكي' : 'Smart Clean',
      badgeColor: 'text-[#4E115A] bg-[#F5EFF7] border border-[#DCD3DF]',
    },
    {
      id: 'finops',
      labelAr: 'المحاسبة وهوامش الباقات (FinOps)',
      labelEn: 'Cloud FinOps & Pricing',
      icon: Calculator,
      action: () => setActiveTab('finops'),
      isActive: activeTab === 'finops',
      badge: isAr ? 'هامش 15%' : '15% Margin',
      badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      id: 'reconciliation',
      labelAr: 'مطابقة فواتير السحابة (JSON)',
      labelEn: 'Billing Reconciliation',
      icon: Scale,
      action: () => setActiveTab('reconciliation'),
      isActive: activeTab === 'reconciliation',
      badge: isAr ? 'تدقيق' : 'Audit',
      badgeColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300',
    },
  ];

  const handleNavClick = (action: () => void) => {
    action();
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderContent = () => (
    <>
      <div className="space-y-6">
        
        {/* Quick Upload & Create Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onUploadClick();
              if (onMobileClose) onMobileClose();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-2xl font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>{isAr ? 'رفع ملف' : 'Upload File'}</span>
          </button>
          
          <button
            onClick={() => {
              onNewFolderClick();
              if (onMobileClose) onMobileClose();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-[#F5EFF7] text-[#1E1E24] rounded-2xl font-semibold text-xs transition-all border border-[#DCD3DF] active:scale-95 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#4E115A]" />
            <span>{isAr ? 'مجلد جديد' : 'New Folder'}</span>
          </button>
        </div>

        {/* Core Platform Hubs (Home, Subscriptions, Plans) */}
        <div>
          <div className="text-[11px] font-bold text-[#6E6A75] uppercase tracking-wider px-3 mb-2 font-mono">
            {isAr ? 'الكبائن والخدمات الأساسية' : 'Platform Hubs'}
          </div>
          <nav className="space-y-1">
            {hubItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.action)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                    item.isActive
                      ? 'bg-[#4E115A] text-white font-bold shadow-md shadow-[#4E115A]/20'
                      : 'text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.isActive ? 'text-white' : 'text-[#4E115A] dark:text-purple-300'}`} />
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${item.isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-[#B91C1C] text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Drive Navigation */}
        <div>
          <div className="text-[11px] font-bold text-[#6E6A75] uppercase tracking-wider px-3 mb-2 font-mono">
            {isAr ? 'المساحة السحابية والملفات' : 'Storage Drive'}
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.action)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                    item.isActive
                      ? 'bg-[#F5EFF7] text-[#4E115A] border border-[#DCD3DF] font-bold shadow-xs'
                      : 'text-[#6E6A75] hover:bg-[#F5EFF7] hover:text-[#1E1E24]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.isActive ? 'text-[#4E115A]' : 'text-[#6E6A75]'}`} />
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${item.badgeColor || 'bg-[#B91C1C] text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Platform & Enterprise Controls */}
        <div>
          <div className="text-[11px] font-bold text-[#6E6A75] uppercase tracking-wider px-3 mb-2 font-mono">
            {isAr ? 'الأمان والبنية التحتية' : 'Security & Infra'}
          </div>
          <nav className="space-y-1">
            {adminItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.action)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                    item.isActive
                      ? 'bg-[#F5EFF7] text-[#4E115A] border border-[#DCD3DF] font-bold shadow-xs'
                      : 'text-[#6E6A75] hover:bg-[#F5EFF7] hover:text-[#1E1E24]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.isActive ? 'text-[#4E115A]' : 'text-[#6E6A75]'}`} />
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-[#F5EFF7] text-[#4E115A] border border-[#DCD3DF]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Storage Quota Widget & Upgrade CTA */}
      <div className="pt-4 mt-6 border-t border-[#DCD3DF] dark:border-slate-800 space-y-3">
        <StorageQuotaWidget onUpgradeClick={onMobileClose} />

        {/* Security & Zero Egress badge */}
        <div className="flex items-center justify-between px-2 text-[10px] text-slate-400 dark:text-slate-500">
          <span>{isAr ? 'تشفير AES-256-GCM' : 'AES-256-GCM'}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {isAr ? 'بدون رسوم سحب' : 'Zero Egress'}
          </span>
        </div>

      </div>
    </>
  );

  if (!mobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onMobileClose}
      />
      <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-start duration-200">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <img
              src="/assets/aistudio/_________________20261107_140807______425b22ac.png"
              alt="Rawaj Cloud"
              className="w-7 h-7 object-contain rounded-md"
            />
            <span className="font-bold text-sm text-[#1E1E24] dark:text-white">
              {isAr ? 'رواج كلاود' : 'Rawaj Cloud'}
            </span>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {renderContent()}
      </aside>
    </div>
  );
};
