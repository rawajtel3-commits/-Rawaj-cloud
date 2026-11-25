import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useStorage } from '../../context/StorageContext';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { lang } = useStorage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isAr = lang === 'ar';

  // Suppress button when already running in standalone installed PWA mode
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop native install prompt
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#1AD062] hover:bg-[#17b856] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
        title={isAr ? 'تثبيت تطبيق رواج كلاود للعمل دون اتصال' : 'Install Rawaj Cloud App for offline access'}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">{isAr ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari guided install flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          title={isAr ? 'تثبيت التطبيق على iOS' : 'Install on iOS'}
        >
          <Download className="w-3.5 h-3.5 text-[#F5BA13]" />
          <span className="hidden sm:inline">{isAr ? 'تثبيت iOS' : 'Install iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-[#DCD3DF] dark:border-slate-800 text-[#1E1E24] dark:text-white space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black">
                  {isAr ? 'تثبيت رواج كلاود على iPhone / iPad' : 'Install Rawaj Cloud on iPhone / iPad'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5 text-xs text-[#6E6A75] dark:text-slate-300 leading-relaxed">
                <p className="flex items-center gap-2">
                  <Share className="w-4 h-4 text-[#4E115A] dark:text-purple-300 shrink-0" />
                  <span>
                    {isAr
                      ? '1. اضغط على زر المشاركة (Share) في شريط أدوات Safari.'
                      : '1. Tap the Share button in Safari toolbar.'}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <PlusSquare className="w-4 h-4 text-[#4E115A] dark:text-purple-300 shrink-0" />
                  <span>
                    {isAr
                      ? '2. مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                      : '2. Scroll down and tap Add to Home Screen.'}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#4E115A] hover:bg-[#3d0d46] py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                {isAr ? 'حسناً' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
