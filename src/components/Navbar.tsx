import React, { useState, useRef, useEffect } from 'react';
import { useStorage } from '../context/StorageContext';
import {
  Menu,
  ChevronDown,
  UploadCloud,
  Sparkles,
  Layers,
  HardDrive,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    lang,
    activeTab,
    setActiveTab,
    uploadTasks,
    setUploadQueueOpen,
    currentPlan,
    quota,
    openPaymentGateway,
  } = useStorage();

  const isAr = lang === 'ar';
  const [storageDropdownOpen, setStorageDropdownOpen] = useState(false);
  const storageDropdownRef = useRef<HTMLDivElement>(null);

  const activeUploadsCount = uploadTasks.filter(
    t => t.status === 'uploading' || t.status === 'hashing'
  ).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        storageDropdownRef.current &&
        !storageDropdownRef.current.contains(event.target as Node)
      ) {
        setStorageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const usedPercent = Math.min(100, Math.round((quota.usedBytes / quota.totalBytes) * 100));
  const usedGBLabel = formatBytes(quota.usedBytes, 0, false);
  const totalCapacityLabel =
    currentPlan.storageGB >= 1024
      ? `${currentPlan.storageGB / 1024} TB`
      : `${currentPlan.storageGB} GB`;

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-[#3B004E] text-white select-none">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Top Row: Compact Hamburger Menu + Centered "رواج كلاود" & White Rawaj Cloud Logo Pill */}
        <div className="h-11 flex items-center justify-between gap-2">
          
          {/* Right (RTL start): Menu Button */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={isAr ? 'فتح القائمة' : 'Open menu'}
            className="w-8 h-8 -mx-1 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" strokeWidth={2.2} />
          </button>

          {/* Center: رواج كلاود + Crisp Compact White Brand Badge */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center justify-center gap-2 cursor-pointer group"
            title={isAr ? 'رواج كلاود - الرئيسية' : 'Rawaj Cloud - Home'}
          >
            <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
              {isAr ? 'رواج كلاود' : 'Rawaj Cloud'}
            </span>

            {/* Compact White Rounded Pill Logo Mark */}
            <div className="bg-white rounded-lg px-1.5 py-0.5 flex items-center gap-1 shadow-xs transition-transform group-hover:scale-[1.03]">
              <svg viewBox="0 0 42 32" className="w-5.5 h-4 shrink-0" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="navCloudGrad" x1="2" y1="28" x2="38" y2="4" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3B004E" />
                    <stop offset="60%" stopColor="#6D28D9" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
                <path
                  d="M11 26H31C34.866 26 38 22.866 38 19C38 15.38 35.24 12.41 31.71 12.04C30.56 7.42 26.4 4 21.45 4C15.82 4 11.2 8.37 10.82 13.92C7.77 14.44 5.45 17.1 5.45 20.28C5.45 23.44 7.93 26 11 26Z"
                  stroke="url(#navCloudGrad)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 22L20 15L24 18.5L33 9.5M27.5 9.5H33V15"
                  stroke="url(#navCloudGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col leading-none text-left" dir="ltr">
                <span className="text-[9.5px] font-black text-[#3B004E] tracking-tight">Rawaj</span>
                <span className="text-[7px] font-bold text-[#6D28D9] -mt-0.5 text-right">Cloud</span>
              </div>
            </div>
          </button>

          {/* Left (RTL end): Balancing spacer or Active Upload Queue trigger */}
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            {uploadTasks.length > 0 && (
              <button
                type="button"
                onClick={() => setUploadQueueOpen(true)}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isAr ? 'مهام الرفع' : 'Upload Queue'}
              >
                <UploadCloud className="w-4 h-4" />
                {activeUploadsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-1 rounded-full bg-emerald-400 text-[#3B004E] text-[8.5px] font-black flex items-center justify-center">
                    {activeUploadsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Second Row (on Home): Compact Storage Bar "مساحة التخزين | ..." + Left Chevron */}
        {activeTab === 'home' && (
          <div className="relative pb-1.5" ref={storageDropdownRef}>
            <button
              type="button"
              onClick={() => setStorageDropdownOpen(prev => !prev)}
              aria-expanded={storageDropdownOpen}
              className="w-full py-0.5 px-1.5 flex items-center justify-between text-white/95 hover:text-white transition-colors cursor-pointer"
            >
              <span className="w-4 shrink-0" aria-hidden="true" />
              <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold tracking-tight">
                <span>{isAr ? 'مساحة التخزين' : 'Storage Space'}</span>
                <span className="text-white/50 font-light">|</span>
                <span dir="ltr" className="font-mono tabular-nums font-black">
                  {usedGBLabel}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-white/90 transition-transform duration-200 shrink-0 ${
                  storageDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Collapsible Storage Details Popover */}
            {storageDropdownOpen && (
              <div className="absolute top-full mt-1 inset-x-0 bg-white dark:bg-slate-900 text-[#1E1E24] dark:text-white rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#3B004E] dark:text-purple-300">
                    <HardDrive className="w-4 h-4" />
                    <span>{isAr ? currentPlan.nameAr : currentPlan.nameEn}</span>
                  </div>
                  <span dir="ltr" className="font-mono font-bold tabular-nums text-[#6E6A75] dark:text-slate-300">
                    {usedGBLabel} / {totalCapacityLabel} ({usedPercent}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#F3EFF6] dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3B004E] to-[#9333EA]"
                    style={{ width: `${Math.max(4, usedPercent)}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStorageDropdownOpen(false);
                      openPaymentGateway();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAr ? 'ترقية الباقة' : 'Upgrade Plan'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStorageDropdownOpen(false);
                      setActiveTab('my-plans');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#F5EFF7] dark:bg-slate-800 text-[#3B004E] dark:text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تفاصيل باقتي' : 'My Plan Details'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
