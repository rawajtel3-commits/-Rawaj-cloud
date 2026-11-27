import React, { useState, useRef, useEffect } from 'react';
import { useStorage, ActiveTabType } from '../context/StorageContext';
import {
  Home,
  LayoutGrid,
  MoreHorizontal,
  User,
  ShieldCheck,
  FolderLock,
  Camera,
  MessageSquareLock,
  Sparkles,
  Globe,
  Mail,
  PhoneCall,
  Headphones,
  Layers,
  Wallet,
  ArrowUpRight,
  LogOut,
  X,
  Receipt,
  History,
  PieChart,
  RefreshCw,
  Code2,
  Activity,
  Sun,
  Moon,
  Cloud,
  Scale,
  Calculator,
  BadgeCheck,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export const Footer: React.FC = () => {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    setPlansModalOpen,
    currentPlan,
    quota,
    flexWalletBalance,
    subscriptions,
    currentUser,
    isAuthenticated,
    logout,
  } = useStorage();

  const isAr = lang === 'ar';
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(target)
      ) {
        setMoreMenuOpen(false);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(target) &&
        accountButtonRef.current &&
        !accountButtonRef.current.contains(target)
      ) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moreLinks: {
    id: ActiveTabType;
    labelAr: string;
    labelEn: string;
    icon: React.ElementType;
  }[] = [
    { id: 'social-verification', labelAr: 'توثيق الحسابات', labelEn: 'Social Verify', icon: BadgeCheck },
    { id: 'vault', labelAr: 'الخزنة المشفرة', labelEn: 'Encrypted Vault', icon: FolderLock },
    { id: 'messages', labelAr: 'نسخ الواتساب', labelEn: 'WhatsApp Backup', icon: MessageSquareLock },
    { id: 'media', labelAr: 'نسخ الوسائط', labelEn: 'Media Backup', icon: Camera },
    { id: 'cleanup', labelAr: 'تنظيف المساحة', labelEn: 'Storage Cleanup', icon: Sparkles },
    { id: 'insights', labelAr: 'تحليلات التخزين', labelEn: 'Insights', icon: PieChart },
    { id: 'sync', labelAr: 'المزامنة الانتقائية', labelEn: 'Selective Sync', icon: RefreshCw },
    { id: 'activity-log', labelAr: 'سجل النشاطات', labelEn: 'Activity Log', icon: History },
    { id: 'reconciliation', labelAr: 'مطابقة الفواتير', labelEn: 'Billing Audit', icon: Scale },
    { id: 'finops', labelAr: 'المحاسبة FinOps', labelEn: 'Cloud FinOps', icon: Calculator },
    { id: 'developer', labelAr: 'واجهة المطورين', labelEn: 'Developer API', icon: Code2 },
    { id: 'sla', labelAr: 'الموثوقية SLA', labelEn: 'SLA Status', icon: Activity },
  ];

  // Active tab highlights for the 4 bottom tabs matching mockup:
  // 1- الرئيسية | 2- الخدمات | 3- المزيد | 4- حسابي
  const isHomeActive = activeTab === 'home' && !moreMenuOpen && !accountMenuOpen;
  const isServicesActive = activeTab === 'services' && !moreMenuOpen && !accountMenuOpen;
  const isMoreActive =
    moreMenuOpen ||
    ['cloud-tools', 'social-verification', 'vault', 'media', 'messages', 'sync', 'insights', 'cleanup', 'developer', 'sla', 'finops', 'reconciliation', 'activity-log'].includes(activeTab);
  const isAccountActive =
    accountMenuOpen ||
    ['auth', 'security', 'my-plans', 'subscriptions', 'available-plans', 'plans'].includes(activeTab);

  const activeSubscriptionsCount = subscriptions.filter(s => s.status === 'active').length;

  return (
    <footer className="relative shrink-0 bg-[#3B004E] transition-colors select-none z-40 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(59,0,78,0.22)]">
      
      {/* "المزيد" (More) Quick Tools Sheet */}
      {moreMenuOpen && (
        <div
          ref={moreMenuRef}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[calc(100vw-24px)] max-w-md max-h-[calc(100dvh-140px)] overflow-y-auto p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-bottom-3 zoom-in-95 duration-200 text-slate-900 dark:text-white"
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-extrabold text-[#2E0842] dark:text-white">
              {isAr ? 'المزيد من الأدوات والإعدادات' : 'More Tools & Preferences'}
            </span>
            <button
              type="button"
              onClick={() => setMoreMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-[#4A0E5C] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Featured Cloud Tools Page Entry */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('cloud-tools');
              setMoreMenuOpen(false);
            }}
            className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-[#4A0E5C] via-[#6D28D9] to-[#9333EA] text-white flex items-center justify-between gap-3 shadow-md shadow-purple-900/15 hover:opacity-95 transition-opacity cursor-pointer text-right rtl:text-right ltr:text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold leading-tight">
                  {isAr ? 'أدوات السحابة' : 'Cloud Tools'}
                </div>
                <div className="text-[11px] text-white/85 truncate mt-0.5">
                  {isAr ? 'جميع أدوات التشفير، النسخ، التحليلات والتنظيف' : 'All vault, backup, cleanup & analytics tools'}
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-white/90 shrink-0 rtl:rotate-[-90deg]" />
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {moreLinks.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMoreMenuOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-[#7C3AED]/40 text-[#4A0E5C] dark:text-purple-300 font-bold'
                      : 'bg-slate-50/70 dark:bg-slate-800/60 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#7C3AED] dark:text-purple-300" />
                  <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Direct Support & Preferences Strip */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <a
                href="https://wa.me/967730005955"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isAr ? 'دعم 24/7' : 'Support'}</span>
              </a>
              <a
                href="tel:+967780080555"
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title={isAr ? 'اتصال هاتفي' : 'Call'}
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:saad@rawajye.com"
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                title={isAr ? 'بريد إلكتروني' : 'Email'}
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLang(isAr ? 'en' : 'ar')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>{isAr ? 'EN' : 'عربي'}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                title={theme === 'dark' ? (isAr ? 'وضع فاتح' : 'Light') : (isAr ? 'وضع داكن' : 'Dark')}
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#4A0E5C]" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "حسابي" (My Account) Popover Sheet */}
      {accountMenuOpen && (
        <div
          ref={accountMenuRef}
          className="absolute bottom-full mb-2 rtl:left-3 ltr:right-3 sm:rtl:left-8 sm:ltr:right-8 w-[calc(100vw-24px)] sm:w-88 max-w-sm max-h-[calc(100dvh-140px)] overflow-y-auto p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-bottom-3 zoom-in-95 duration-200 text-slate-900 dark:text-white"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4A0E5C] text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <span className="text-xs font-extrabold text-[#2E0842] dark:text-white">
                {isAr ? 'حسابي' : 'My Account'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAccountMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-[#4A0E5C] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Account Summary */}
          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-slate-800 mb-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {currentUser?.email || 'rawajtel4@gmail.com'}
                </div>
                <div className="text-[11px] text-[#6D28D9] dark:text-purple-300 font-bold">
                  {currentUser?.name || 'م. سعد الحضرمي'} · {currentPlan.nameAr}
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                {isAuthenticated ? (isAr ? 'نشط' : 'Active') : (isAr ? 'زائر' : 'Guest')}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                <span>{isAr ? 'المساحة السحابية' : 'Storage Quota'}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatBytes(quota.usedBytes, 1, isAr)} / {currentPlan.storageGB} GB
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4A0E5C] to-[#9333EA]"
                  style={{
                    width: `${Math.min(100, (quota.usedBytes / quota.totalBytes) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-purple-200/50 dark:border-slate-800 flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>{isAr ? 'المحفظة المرنة:' : 'Flex Wallet:'}</span>
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                ${flexWalletBalance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('auth');
                setAccountMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#6D28D9]" />
                <span>{isAr ? 'بوابة الحساب وتسجيل الدخول' : 'Account Portal & Sign In'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('my-plans');
                setAccountMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#6D28D9]" />
                <span>{isAr ? 'باقاتي واستهلاك الموارد' : 'My Plans & Quotas'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('subscriptions');
                setAccountMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-[#6D28D9]" />
                <span>
                  {isAr ? 'الاشتراكات والفواتير' : 'Subscriptions & Invoices'}
                  {activeSubscriptionsCount > 0 ? ` (${activeSubscriptionsCount})` : ''}
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                setAccountMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#6D28D9]" />
                <span>{isAr ? 'الأمان وجلسات FIDO2' : 'Security & FIDO2'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                setPlansModalOpen(true);
                setAccountMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#4A0E5C] to-[#7C3AED] hover:opacity-95 font-bold transition-opacity cursor-pointer mt-2"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAr ? 'ترقية الباقة والتخزين' : 'Upgrade Plan'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

            <button
              type="button"
              onClick={() => {
                logout();
                setAccountMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Deep Royal Purple Bottom Tab Bar matching screenshot: الرئيسية | الخدمات | المزيد | حسابي */}
      <div className="max-w-2xl mx-auto px-2 sm:px-4">
        <nav
          role="navigation"
          aria-label={isAr ? 'التنقل الرئيسي في الفوتر' : 'Footer primary navigation'}
          className="h-[72px] grid grid-cols-4 items-center gap-1.5"
        >
          {/* 1. الرئيسية (Home) */}
          <button
            type="button"
            role="tab"
            aria-selected={isHomeActive}
            onClick={() => {
              setActiveTab('home');
              setMoreMenuOpen(false);
              setAccountMenuOpen(false);
            }}
            className={`h-[58px] w-full flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              isHomeActive
                ? 'bg-white text-[#3B004E] font-black shadow-md'
                : 'text-[#B59FC2] hover:text-white font-semibold'
            }`}
          >
            <Home
              className="w-5 h-5"
              strokeWidth={isHomeActive ? 2.4 : 1.9}
              fill={isHomeActive ? 'currentColor' : 'none'}
            />
            <span className="text-xs leading-none">
              {isAr ? 'الرئيسية' : 'Home'}
            </span>
          </button>

          {/* 2. الخدمات (Services) */}
          <button
            type="button"
            role="tab"
            aria-selected={isServicesActive}
            onClick={() => {
              setActiveTab('services');
              setMoreMenuOpen(false);
              setAccountMenuOpen(false);
            }}
            className={`h-[58px] w-full flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              isServicesActive
                ? 'bg-white text-[#3B004E] font-black shadow-md'
                : 'text-[#B59FC2] hover:text-white font-semibold'
            }`}
          >
            <LayoutGrid
              className="w-5 h-5"
              strokeWidth={isServicesActive ? 2.4 : 1.9}
            />
            <span className="text-xs leading-none">
              {isAr ? 'الخدمات' : 'Services'}
            </span>
          </button>

          {/* 3. المزيد (More) */}
          <button
            ref={moreButtonRef}
            type="button"
            role="tab"
            aria-selected={isMoreActive}
            onClick={() => {
              setMoreMenuOpen(!moreMenuOpen);
              setAccountMenuOpen(false);
            }}
            className={`h-[58px] w-full flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              isMoreActive
                ? 'bg-white text-[#3B004E] font-black shadow-md'
                : 'text-[#B59FC2] hover:text-white font-semibold'
            }`}
          >
            <MoreHorizontal
              className="w-6 h-5"
              strokeWidth={isMoreActive ? 2.6 : 2.1}
            />
            <span className="text-xs leading-none">
              {isAr ? 'المزيد' : 'More'}
            </span>
          </button>

          {/* 4. حسابي (My Account) */}
          <button
            ref={accountButtonRef}
            type="button"
            role="tab"
            aria-selected={isAccountActive}
            onClick={() => {
              setAccountMenuOpen(!accountMenuOpen);
              setMoreMenuOpen(false);
            }}
            className={`h-[58px] w-full flex flex-col items-center justify-center gap-1 rounded-2xl transition-all cursor-pointer whitespace-nowrap ${
              isAccountActive
                ? 'bg-white text-[#3B004E] font-black shadow-md'
                : 'text-[#B59FC2] hover:text-white font-semibold'
            }`}
          >
            <User
              className="w-5 h-5"
              strokeWidth={isAccountActive ? 2.4 : 1.9}
            />
            <span className="text-xs leading-none">
              {isAr ? 'حسابي' : 'Account'}
            </span>
          </button>
        </nav>
      </div>
    </footer>
  );
};
