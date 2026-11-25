import React, { useState, useRef, useEffect } from 'react';
import { useStorage } from '../context/StorageContext';
import {
  Home,
  Receipt,
  HardDrive,
  User,
  ShieldCheck,
  FolderLock,
  Camera,
  MessageSquareLock,
  Sparkles,
  ChevronUp,
  Globe,
  Lock,
  Mail,
  PhoneCall,
  Headphones,
  Copy,
  Check,
  MessageCircle,
  Layers,
  Wallet,
  ArrowUpRight,
  LogOut,
  X,
  CreditCard,
  CheckCircle2,
  Compass,
  LayoutGrid,
  Info,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export const Footer: React.FC = () => {
  const {
    lang,
    setLang,
    activeTab,
    setActiveTab,
    setActiveCategory,
    setPlansModalOpen,
    currentPlan,
    quota,
    flexWalletBalance,
    subscriptions,
    currentUser,
    isAuthenticated,
    logout,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    showNotification(
      `تم نسخ ${label} إلى الحافظة: ${text}`,
      `Copied ${label} to clipboard: ${text}`,
      'success'
    );
    setTimeout(() => {
      setCopiedItem(null);
    }, 2500);
  };

  const contactChannels = [
    {
      id: 'email',
      titleAr: 'البريد الإلكتروني للإدارة',
      titleEn: 'Official Management Email',
      value: 'saad@rawajye.com',
      displayValue: 'saad@rawajye.com',
      href: 'mailto:saad@rawajye.com',
      icon: Mail,
      iconColor: 'text-[#4E115A] dark:text-purple-300',
      bgColor: 'bg-[#F5EFF7] dark:bg-purple-950/40',
      borderColor: 'border-[#4E115A]/30',
      actionLabelAr: 'إرسال بريد',
      actionLabelEn: 'Send Email',
    },
    {
      id: 'wa-admin',
      titleAr: 'واتساب الإدارة المباشر',
      titleEn: 'Management WhatsApp',
      value: '770600046',
      displayValue: '770600046 (00967)',
      href: 'https://wa.me/967770600046',
      icon: MessageCircle,
      iconColor: 'text-[#1AD062]',
      bgColor: 'bg-[#1AD062]/10 dark:bg-emerald-950/40',
      borderColor: 'border-[#1AD062]/30',
      actionLabelAr: 'محادثة الإدارة',
      actionLabelEn: 'Chat WhatsApp',
    },
    {
      id: 'call-admin',
      titleAr: 'اتصال الإدارة المباشر',
      titleEn: 'Direct Management Call',
      value: '00967780080555',
      displayValue: '00967780080555',
      href: 'tel:+967780080555',
      icon: PhoneCall,
      iconColor: 'text-[#A38540]',
      bgColor: 'bg-[#A38540]/10 dark:bg-amber-950/40',
      borderColor: 'border-[#A38540]/30',
      actionLabelAr: 'اتصال هاتفي',
      actionLabelEn: 'Call Now',
    },
    {
      id: 'wa-cs',
      titleAr: 'واتساب خدمة العملاء 24/7',
      titleEn: 'Customer Support WhatsApp',
      value: '730005955',
      displayValue: '730005955 (00967)',
      href: 'https://wa.me/967730005955',
      icon: Headphones,
      iconColor: 'text-[#1AD062]',
      bgColor: 'bg-[#1AD062]/10 dark:bg-emerald-950/40',
      borderColor: 'border-[#1AD062]/30',
      actionLabelAr: 'خدمة العملاء',
      actionLabelEn: 'Support Chat',
    },
  ];

  // The 4 Core Navigation Items matching the mockup:
  // 1- الرئيسية (Home)
  // 2- الخدمات (Services)
  // 3- التصنيفات (Categories)
  // 4- المزيد (More)
  const isHomeActive = activeTab === 'home';
  const isServicesActive = activeTab === 'services';
  const isCategoriesActive = ['files', 'vault', 'media', 'messages', 'sync', 'insights', 'cleanup', 'developer', 'sla', 'finops'].includes(activeTab);
  const isMoreActive = ['my-plans', 'available-plans', 'plans', 'subscriptions', 'security', 'auth'].includes(activeTab) || userMenuOpen;

  const activeSubscriptionsCount = subscriptions.filter(s => s.status === 'active').length;

  return (
    <footer className="relative shrink-0 bg-[#4E115A] dark:bg-slate-900 border-t border-purple-950/40 transition-colors select-none z-30">
      
      {/* User Profile Popover Sheet (Docked right above footer) */}
      {userMenuOpen && (
        <div
          ref={userMenuRef}
          className="absolute bottom-full mb-2 rtl:left-3 ltr:right-3 sm:rtl:left-8 sm:ltr:right-8 w-[calc(100vw-24px)] sm:w-88 max-w-sm p-4 bg-white dark:bg-slate-900 rounded-3xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-bottom-3 zoom-in-95 duration-200 text-[#1E1E24] dark:text-white"
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF]/60 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#4E115A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                R
              </div>
              <span className="text-xs font-bold font-mono text-[#1E1E24] dark:text-white">
                {isAr ? 'حساب المستخدم' : 'User Account'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUserMenuOpen(false)}
              className="p-1 rounded-lg text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-white hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="p-3 bg-[#F5EFF7] dark:bg-purple-950/30 rounded-2xl border border-[#DCD3DF]/70 dark:border-slate-800 mb-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-black text-[#1E1E24] dark:text-white truncate">
                  {currentUser?.email || 'rawajtel4@gmail.com'}
                </div>
                <div className="text-[11px] text-[#4E115A] dark:text-purple-300 font-bold font-mono">
                  {currentUser?.name || 'م. سعد الحضرمي'} · {currentPlan.nameAr}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1AD062]/15 text-[#1AD062] border border-[#1AD062]/30 text-[10px] font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1AD062]" />
                <span>{isAuthenticated ? (isAr ? 'نشط' : 'Active') : (isAr ? 'زائر' : 'Guest')}</span>
              </span>
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#6E6A75] dark:text-slate-400 font-mono">
                <span>{isAr ? 'المساحة السحابية' : 'Storage Quota'}</span>
                <span className="font-bold text-[#1E1E24] dark:text-white">
                  {formatBytes(quota.usedBytes, 1, isAr)} / {currentPlan.storageGB} GB
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white dark:bg-slate-800 overflow-hidden border border-[#DCD3DF]/50">
                <div
                  className="h-full rounded-full bg-[#4E115A]"
                  style={{
                    width: `${Math.min(100, (quota.usedBytes / quota.totalBytes) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Flex Wallet Balance */}
            <div className="pt-2 border-t border-[#DCD3DF]/40 dark:border-slate-700/40 flex items-center justify-between text-xs font-mono">
              <span className="text-[#6E6A75] dark:text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#A38540]" />
                <span>{isAr ? 'المحفظة المرنة:' : 'Flex Wallet:'}</span>
              </span>
              <span className="font-black text-[#1AD062]">
                ${flexWalletBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Links */}
          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('auth');
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>{isAr ? 'بوابة الحساب (تسجيل الدخول / جديد)' : 'Account Portal & Sign In'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75] group-hover:text-[#4E115A] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>{isAr ? 'إعدادات الأمان وجلسات FIDO2' : 'Security & FIDO2 Sessions'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75] group-hover:text-[#4E115A] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('my-plans');
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#A38540]/10 text-[#A38540] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span>{isAr ? 'باقاتي واستهلاك الموارد' : 'My Plans & Quotas'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75] group-hover:text-[#A38540] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('subscriptions');
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1AD062]/10 text-[#1AD062] flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>{isAr ? 'إدارة الاشتراكات والفواتير' : 'Subscriptions & Invoices'}</span>
                  {activeSubscriptionsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#1AD062]/15 text-[#1AD062] font-mono text-[10px] font-bold">
                      {activeSubscriptionsCount}
                    </span>
                  )}
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75] group-hover:text-[#1AD062] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => {
                setPlansModalOpen(true);
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-white bg-[#4E115A] hover:bg-[#3D0D47] font-bold transition-colors cursor-pointer mt-2 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A38540]" />
                <span>{isAr ? 'ترقية الباقة والتخزين' : 'Upgrade Plan & Storage'}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
            </button>

            <div className="h-px bg-[#DCD3DF]/50 dark:bg-slate-800 my-1" />

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

      {/* Expandable Support & Direct Contact Drawer */}
      {isExpanded && (
        <div className="border-b border-[#DCD3DF] dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4E115A] text-white flex items-center justify-center shadow-xs">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1E1E24] dark:text-white uppercase tracking-wider font-mono">
                    {isAr ? 'معلومات التواصل والدعم الفني المباشر' : 'Official Direct Contact Channels'}
                  </h4>
                  <p className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                    {isAr ? 'تواصل مباشر مع الإدارة وخدمة العملاء' : 'Direct management outreach and 24/7 customer support'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-xl text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-white hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Interactive Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {contactChannels.map(channel => {
                const Icon = channel.icon;
                const isCopied = copiedItem === channel.id;

                return (
                  <div
                    key={channel.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700/80 hover:border-[#4E115A]/60 dark:hover:border-purple-400 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${channel.bgColor} flex items-center justify-center shrink-0 border ${channel.borderColor}`}>
                          <Icon className={`w-4 h-4 ${channel.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-[#6E6A75] dark:text-slate-400 block truncate">
                            {isAr ? channel.titleAr : channel.titleEn}
                          </span>
                          <span className="text-xs font-bold text-[#1E1E24] dark:text-white block font-mono truncate" dir="ltr">
                            {channel.displayValue}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(channel.value, isAr ? channel.titleAr : channel.titleEn)}
                        className="p-1 text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-white rounded-lg hover:bg-[#F5EFF7] dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                        title={isAr ? 'نسخ إلى الحافظة' : 'Copy'}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-[#1AD062]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <a
                      href={channel.href}
                      target={channel.href.startsWith('http') ? '_blank' : undefined}
                      rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#F5EFF7] dark:bg-slate-700/60 hover:bg-[#4E115A] hover:text-white text-[#1E1E24] dark:text-slate-200 border border-[#DCD3DF] dark:border-slate-600 hover:border-[#4E115A] text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{isAr ? channel.actionLabelAr : channel.actionLabelEn}</span>
                    </a>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Main Docked Footer Tab Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-4">
          
          {/* Desktop Brand Indicator */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <span className="font-bold text-xs text-white whitespace-nowrap">
              {isAr ? 'رواج كلاود © 2026' : 'Rawaj Cloud © 2026'}
            </span>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-semibold text-[11px] hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title={isAr ? 'قنوات التواصل المباشر' : 'Direct Contact Channels'}
            >
              <Headphones className="w-3 h-3 text-[#1AD062]" />
              <span>{isAr ? 'الدعم والتواصل' : 'Support'}</span>
            </button>
          </div>

          {/* Central 4 Navigation Items: الرئيسية | الخدمات | التصنيفات | المزيد */}
          <nav
            role="navigation"
            aria-label={isAr ? 'التنقل الرئيسي في الفوتر' : 'Footer primary navigation'}
            className="flex-1 max-w-xl mx-auto grid grid-cols-4 items-center justify-items-center gap-1 sm:gap-3"
          >
            
            {/* 1. الرئيسية (Home) */}
            <button
              type="button"
              role="tab"
              aria-selected={isHomeActive}
              onClick={() => {
                setActiveTab('home');
                setUserMenuOpen(false);
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
                isHomeActive
                  ? 'bg-white text-[#4E115A] font-extrabold py-1 px-3.5 sm:py-1.5 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-white/50'
                  : 'text-white/80 hover:text-white py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl hover:bg-white/10'
              }`}
            >
              <Home className={`w-5 h-5 ${isHomeActive ? 'text-[#4E115A]' : 'text-white/80'}`} />
              <span className="text-[11px] sm:text-xs tracking-tight mt-0.5">
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
                setUserMenuOpen(false);
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
                isServicesActive
                  ? 'bg-white text-[#4E115A] font-extrabold py-1 px-3.5 sm:py-1.5 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-white/50'
                  : 'text-white/80 hover:text-white py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl hover:bg-white/10'
              }`}
            >
              <Compass className={`w-5 h-5 ${isServicesActive ? 'text-[#4E115A]' : 'text-white/80'}`} />
              <span className="text-[11px] sm:text-xs tracking-tight mt-0.5">
                {isAr ? 'الخدمات' : 'Services'}
              </span>
            </button>

            {/* 3. التصنيفات (Categories) */}
            <button
              type="button"
              role="tab"
              aria-selected={isCategoriesActive}
              onClick={() => {
                setActiveTab('files');
                setActiveCategory('all');
                setUserMenuOpen(false);
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
                isCategoriesActive
                  ? 'bg-white text-[#4E115A] font-extrabold py-1 px-3.5 sm:py-1.5 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-white/50'
                  : 'text-white/80 hover:text-white py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl hover:bg-white/10'
              }`}
            >
              <LayoutGrid className={`w-5 h-5 ${isCategoriesActive ? 'text-[#4E115A]' : 'text-white/80'}`} />
              <span className="text-[11px] sm:text-xs tracking-tight mt-0.5">
                {isAr ? 'التصنيفات' : 'Categories'}
              </span>
            </button>

            {/* 4. المزيد (More) */}
            <button
              ref={userButtonRef}
              type="button"
              role="tab"
              aria-selected={isMoreActive}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
                isMoreActive
                  ? 'bg-white text-[#4E115A] font-extrabold py-1 px-3.5 sm:py-1.5 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-white/50'
                  : 'text-white/80 hover:text-white py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-xl hover:bg-white/10'
              }`}
            >
              <Info className={`w-5 h-5 ${isMoreActive ? 'text-[#4E115A]' : 'text-white/80'}`} />
              <span className="text-[11px] sm:text-xs tracking-tight mt-0.5">
                {isAr ? 'المزيد' : 'More'}
              </span>
            </button>

          </nav>

          {/* Desktop Right Utilities (Language & Direct Support Drawer) */}

          {/* Desktop Right Utilities (Language & Direct Support Drawer) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Quick Contact Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-[#4E115A] dark:text-purple-300 border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title={isAr ? 'الدعم والتواصل' : 'Support & Contact'}
            >
              <Headphones className="w-3.5 h-3.5 text-[#1AD062]" />
              <ChevronUp className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-white border border-[#A38540] text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3 h-3 text-[#A38540]" />
              <span className="font-mono text-[11px]">{isAr ? 'EN' : 'عربي'}</span>
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
};
