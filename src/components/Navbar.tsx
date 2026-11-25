import React, { useState, useRef, useEffect } from 'react';
import { useStorage } from '../context/StorageContext';
import {
  FolderLock,
  HardDrive,
  Camera,
  RefreshCw,
  Code2,
  Activity,
  Sun,
  Moon,
  Sparkles,
  Globe,
  UploadCloud,
  ChevronDown,
  Menu,
  Calculator,
  MessageSquareLock,
  PieChart,
  ShieldCheck,
  Check,
  User,
  ArrowUpRight,
  ExternalLink,
  Home,
  Receipt,
  Layers,
  LogOut,
  Cloud,
  History,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    setPlansModalOpen,
    uploadTasks,
    setUploadQueueOpen,
    quota,
    currentPlan,
    currentUser,
    isAuthenticated,
    logout,
  } = useStorage();

  const isAr = lang === 'ar';
  const activeUploadsCount = uploadTasks.filter(t => t.status === 'uploading' || t.status === 'hashing').length;

  // Dropdown states for navigation overflow and user profile
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary core navigation items (Single-Line, clean whitespace)
  const coreNavItems = [
    {
      id: 'home' as const,
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      icon: Home,
    },
    {
      id: 'files' as const,
      labelAr: 'ملفاتي',
      labelEn: 'My Files',
      icon: HardDrive,
    },
    {
      id: 'subscriptions' as const,
      labelAr: 'اشتراكاتي',
      labelEn: 'Subscriptions',
      icon: Receipt,
    },
    {
      id: 'my-plans' as const,
      labelAr: 'باقاتي',
      labelEn: 'My Plans',
      icon: Layers,
    },
    {
      id: 'available-plans' as const,
      labelAr: 'الخطط المتاحة',
      labelEn: 'Plans',
      icon: Sparkles,
      badge: isAr ? 'خصم 20%' : '-20%',
    },
    {
      id: 'services' as const,
      labelAr: 'الخدمات الرقمية',
      labelEn: 'Services',
      icon: Globe,
      badge: isAr ? 'دومينات & AI' : 'Domains & AI',
    },
  ];

  // Secondary views housed in the clean "More" dropdown
  const secondaryNavItems = [
    {
      id: 'vault' as const,
      labelAr: 'الخزنة المشفرة (Zero-Knowledge)',
      labelEn: 'Zero-Knowledge Vault',
      icon: FolderLock,
    },
    {
      id: 'media' as const,
      labelAr: 'نسخ الوسائط والصور التلقائي',
      labelEn: 'Media & Camera Backup',
      icon: Camera,
    },
    {
      id: 'messages' as const,
      labelAr: 'نسخ الرسائل والواتساب المشفر',
      labelEn: 'SMS & WhatsApp Backup',
      icon: MessageSquareLock,
    },
    {
      id: 'cleanup' as const,
      labelAr: 'تنظيف المساحة السحابية',
      labelEn: 'Storage Cleanup',
      icon: Sparkles,
    },
    {
      id: 'insights' as const,
      labelAr: 'رؤى استهلاك التخزين والنمو',
      labelEn: 'Storage Usage Insights',
      icon: PieChart,
    },
    {
      id: 'finops' as const,
      labelAr: 'المحاسبة السحابية وحساب الهوامش',
      labelEn: 'Cloud FinOps & Margins',
      icon: Calculator,
    },
    {
      id: 'sync' as const,
      labelAr: 'المزامنة الانتقائية والملفات الافتراضية',
      labelEn: 'Selective Sync & Virtual Files',
      icon: RefreshCw,
    },
    {
      id: 'developer' as const,
      labelAr: 'واجهة المطورين و S3 API',
      labelEn: 'Developer API & S3',
      icon: Code2,
    },
    {
      id: 'sla' as const,
      labelAr: 'لوحة الموثوقية والأداء 99.9%',
      labelEn: 'SLA & System Metrics',
      icon: Activity,
    },
    {
      id: 'activity-log' as const,
      labelAr: 'سجل النشاطات والتدقيق الأمني',
      labelEn: 'Activity & Audit Log',
      icon: History,
    },
  ];

  const isSecondaryActive = secondaryNavItems.some(item => item.id === activeTab);

  return (
    <div className="sticky top-0 z-40 shrink-0 select-none">
      {/* Very Top Sub-header: Rawaj Cloud | حلول رقمية لأعمالك */}
      <div className="bg-[#300638] text-white/90 py-1 px-3 sm:px-6 lg:px-8 border-b border-white/10 flex items-center justify-between text-xs font-semibold">
        <span className="font-bold tracking-tight text-[11px] sm:text-xs">
          {isAr ? 'حلول رقمية لأعمالك' : 'Digital Solutions For Your Business'}
        </span>
        <span className="font-mono text-[11px] sm:text-xs text-white/80" dir="ltr">
          Rawaj Cloud
        </span>
      </div>

      <header className="bg-[#4E115A] dark:bg-slate-900 text-white backdrop-blur-md border-b border-[#3D0D47] dark:border-slate-800 transition-colors shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Zone 1: Brand Wordmark with Official Cloud Logo (Matches Screenshot exactly) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            
            {/* Hamburger Menu on Left */}
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="p-2 sm:p-2.5 text-white hover:bg-white/10 dark:hover:bg-slate-800 rounded-2xl border border-white/20 transition-all cursor-pointer shadow-2xs"
              title={isAr ? 'القائمة الجانبية' : 'Open navigation menu'}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Logo + Brand Wordmark */}
            <div
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
              title={isAr ? 'رواج كلاود - حلول رقمية لأعمالك' : 'Rawaj Cloud - Digital Solutions'}
            >
              {/* White Rounded Square Logo with Cloud Outline */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white shadow-md flex items-center justify-center p-1.5 shrink-0 transition-transform group-hover:scale-105 border border-white/40">
                <Cloud className="w-6 h-6 text-[#4E115A]" strokeWidth={2.4} />
              </div>

              {/* Stacked Typography: رواج كلاود / RAWAJ CLOUD */}
              <div className="flex flex-col text-right rtl:text-right ltr:text-left">
                <span className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  {isAr ? 'رواج كلاود' : 'Rawaj Cloud'}
                </span>
                <span className="text-[10px] font-mono tracking-widest text-white/80 font-bold uppercase -mt-0.5" dir="ltr">
                  RAWAJ CLOUD
                </span>
              </div>
            </div>
          </div>

        {/* Zone 2: Navigation Links (Single-Line, 4-6 Clean Tabs + Overflow More) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {coreNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs lg:text-sm rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white/20 text-white font-bold shadow-2xs ring-1 ring-white/30 backdrop-blur-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10 dark:text-slate-300 dark:hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/80'}`} />
                <span>{isAr ? item.labelAr : item.labelEn}</span>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1AD062]/20 text-[#1AD062] border border-[#1AD062]/40 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Clean 'More' Dropdown for secondary workspace views */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`px-2.5 py-1.5 text-xs lg:text-sm rounded-xl transition-all flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                isSecondaryActive
                  ? 'bg-white/20 text-white font-bold shadow-2xs ring-1 ring-white/30'
                  : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
              }`}
              title={isAr ? 'المزيد من الخدمات والخصائص' : 'More workspace views'}
            >
              <span>{isAr ? 'المزيد' : 'More'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* More Menu Popover */}
            {moreMenuOpen && (
              <div className="absolute top-full mt-2 rtl:left-0 ltr:right-0 w-64 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A75] dark:text-slate-400 px-3 py-1.5 font-mono">
                  {isAr ? 'خدمات إضافية' : 'Advanced Services'}
                </div>
                <div className="space-y-1">
                  {secondaryNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left rtl:text-right transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#F5EFF7] dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300 font-bold'
                            : 'text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7]/60 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4E115A] dark:text-purple-300' : 'text-[#6E6A75]'}`} />
                        <span className="flex-1 truncate">{isAr ? item.labelAr : item.labelEn}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Utility Controls & Primary CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Active Uploads Queue Indicator with Gold Outline Accent & Crimson Badge */}
          {uploadTasks.length > 0 && (
            <button
              type="button"
              onClick={() => setUploadQueueOpen(true)}
              className="relative p-2 text-white/90 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-[#A38540] dark:border-slate-800 transition-all cursor-pointer shadow-2xs"
              title={isAr ? 'مدير مهام الرفع والتخزين' : 'Upload Queue Manager'}
            >
              <UploadCloud className="w-4 h-4 text-white" />
              {activeUploadsCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B91C1C] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#4E115A] animate-pulse shadow-xs">
                  {activeUploadsCount}
                </span>
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1AD062] ring-2 ring-[#4E115A]" />
              )}
            </button>
          )}

          {/* Language Switcher with Warm Muted Gold/Bronze (#A38540) outline accent */}
          <button
            type="button"
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-white/5 hover:bg-white/10 rounded-xl border border-[#A38540] transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95"
            title={isAr ? 'Switch Language to English' : 'التحويل إلى اللغة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#A38540]" />
            <span className="font-mono">{isAr ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Switcher with Warm Muted Gold/Bronze (#A38540) outline accent */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-[#A38540] transition-all cursor-pointer shadow-2xs active:scale-95"
            title={theme === 'dark' ? (isAr ? 'تفعيل الوضع الفاتح' : 'Switch to Light Mode') : (isAr ? 'تفعيل الوضع الداكن' : 'Switch to Dark Mode')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#A38540]" />
            ) : (
              <Moon className="w-4 h-4 text-[#A38540]" />
            )}
          </button>

          {/* Primary Brand CTA Button: 'ترقية المساحة' / 'Upgrade Plan' */}
          <button
            type="button"
            onClick={() => setPlansModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#4E115A] to-[#681878] hover:from-[#5A1467] hover:to-[#781B8A] border border-[#A38540] rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer ring-1 ring-white/15"
            title={isAr ? 'استعراض باقات الاشتراك وترقية السعة التخزينية' : 'Upgrade your storage capacity & features'}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
            <span>{isAr ? 'ترقية الباقة' : 'Upgrade Plan'}</span>
          </button>

          {/* User Profile Quick Card & Menu */}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => setActiveTab('auth')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#4E115A] hover:bg-[#F5EFF7] font-bold text-xs shadow-xs transition-all cursor-pointer border border-transparent active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الدخول / حساب جديد' : 'Sign In / Register'}</span>
            </button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all cursor-pointer shadow-2xs active:scale-95"
                title={isAr ? 'الملف الشخصي وإعدادات الأمان' : 'Account profile & security'}
              >
                <div className="w-7 h-7 rounded-xl bg-white text-[#4E115A] flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <div className="hidden xl:flex flex-col text-left rtl:text-right leading-tight">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {currentUser?.email || 'rawajtel4@gmail.com'}
                  </span>
                  <span className="text-[10px] text-[#1AD062] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#1AD062]" />
                    <span>{isAr ? 'موثق FIDO2' : 'FIDO2 Verified'}</span>
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Profile Popover */}
              {userMenuOpen && (
                <div className="absolute top-full mt-2 rtl:left-0 ltr:right-0 w-72 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-[#1E1E24] dark:text-white">
                  
                  {/* Header User Summary */}
                  <div className="p-2.5 bg-[#F5EFF7] dark:bg-purple-950/30 rounded-xl border border-[#DCD3DF]/60 dark:border-slate-800 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#4E115A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'R'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#1E1E24] dark:text-white truncate">
                          {currentUser?.email || 'rawajtel4@gmail.com'}
                        </div>
                        <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
                          {currentUser?.name || 'م. سعد الحضرمي'} · {currentPlan.nameAr}
                        </div>
                      </div>
                    </div>

                    {/* Storage Bar Indicator */}
                    <div className="mt-2.5 pt-2 border-t border-[#DCD3DF]/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-[10px] text-[#6E6A75] font-mono mb-1">
                        <span>{isAr ? 'المساحة المستخدمة' : 'Used Storage'}</span>
                        <span className="font-bold text-[#1E1E24] dark:text-white">
                          {formatBytes(quota.usedBytes, 1, isAr)} / {currentPlan.storageGB} GB
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white dark:bg-slate-800 overflow-hidden border border-[#DCD3DF]/40">
                        <div
                          className="h-full rounded-full bg-[#4E115A]"
                          style={{
                            width: `${Math.min(100, (quota.usedBytes / quota.totalBytes) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Quick Links */}
                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('auth');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
                        <span>{isAr ? 'بوابة الحساب (تسجيل الدخول / جديد)' : 'Account Portal & Sign In'}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('security');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
                        <span>{isAr ? 'إعدادات الأمان وجلسات FIDO2' : 'Security & FIDO2 Sessions'}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPlansModalOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A38540]" />
                        <span>{isAr ? 'إدارة الباقة والاشتراك السحابي' : 'Manage Subscription & Plan'}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75]" />
                    </button>

                    <div className="h-px bg-[#DCD3DF]/60 dark:bg-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                      </div>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  </div>
);
};
