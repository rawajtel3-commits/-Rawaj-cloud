import React, { useState, useEffect, useMemo } from 'react';
import { useStorage, ActiveTabType } from '../../context/StorageContext';

interface PromoSlide {
  id: string;
  line1Ar: string;
  line2Ar: string;
  line1En: string;
  line2En: string;
  targetTab: ActiveTabType;
}

export const HeroMediaSlider: React.FC = () => {
  const { lang, setActiveTab } = useStorage();
  const isAr = lang === 'ar';

  const slides: PromoSlide[] = useMemo(
    () => [
      {
        id: 'welcome-rawaj',
        line1Ar: 'رواج كلاود - مساحتك',
        line2Ar: 'السحابية المتكاملة',
        line1En: 'Rawaj Cloud — Your',
        line2En: 'All-in-One Cloud Space',
        targetTab: 'files',
      },
      {
        id: 'annual-discount',
        line1Ar: 'وفر 20% على الباقات',
        line2Ar: 'السنوية الاحترافية',
        line1En: 'Save 20% on Annual',
        line2En: 'Pro Cloud Storage Plans',
        targetTab: 'available-plans',
      },
      {
        id: 'vault-e2ee',
        line1Ar: 'تشفير كامل لملفاتك',
        line2Ar: 'ومحادثات الواتساب',
        line1En: 'Zero-Knowledge Vault',
        line2En: '& WhatsApp Backup',
        targetTab: 'messages',
      },
      {
        id: 'services-hub',
        line1Ar: 'خدمات الدومينات والذكاء',
        line2Ar: 'الاصطناعي في مكان واحد',
        line1En: 'Domains & AI Services',
        line2En: 'Activated Instantly',
        targetTab: 'services',
      },
      {
        id: 'fast-sync',
        line1Ar: 'رفع فائق السرعة بدون',
        line2Ar: 'رسوم نقل بيانات',
        line1En: 'High-Speed Cloud Sync',
        line2En: 'With Zero Egress Fees',
        targetTab: 'my-plans',
      },
    ],
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  const activeSlide = slides[currentIndex];

  return (
    <section
      aria-label={isAr ? 'العرض الرئيسي' : 'Featured Banner'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full select-none"
    >
      {/* Full-Width Deep Royal Purple Promo Banner Card */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveTab(activeSlide.targetTab)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveTab(activeSlide.targetTab);
          }
        }}
        className="relative w-full min-h-[168px] sm:min-h-[192px] rounded-2xl bg-gradient-to-br from-[#2B003A] via-[#4B0862] to-[#6B1586] text-white overflow-hidden shadow-lg shadow-black/25 border border-white/10 cursor-pointer"
      >
        {/* Decorative Cloud & Rising Diagonal Arrows Artwork (Left in RTL, Right in LTR) */}
        <svg
          viewBox="0 0 280 180"
          className="absolute inset-y-0 rtl:left-0 ltr:right-0 h-full w-48 sm:w-64 pointer-events-none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroArrowMain" x1="25" y1="150" x2="210" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E879F9" stopOpacity="0.98" />
            </linearGradient>
            <linearGradient id="heroCloudWhite" x1="0" y1="125" x2="230" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.92" />
            </linearGradient>
          </defs>

          {/* Soft floating white clouds */}
          <path
            d="M22 52H70C75 52 79 48.2 79 43.8C79 39.7 75.7 36.4 71.5 35.9C70 30.8 65.2 27 59.5 27C53.1 27 47.9 31.8 47.2 38C43.6 38.7 40.8 41.7 40.8 45.3C40.8 49 43.9 52 47.8 52H22Z"
            fill="#FFFFFF"
            opacity="0.88"
          />
          <path
            d="M168 34H202C205.5 34 208 31.4 208 28.4C208 25.6 205.7 23.3 202.8 23C201.8 19.5 198.5 17 194.5 17C190.1 17 186.5 20.3 186 24.5C183.5 25 181.5 27 181.5 29.5C181.5 32 183.7 34 186.4 34H168Z"
            fill="#FFFFFF"
            opacity="0.75"
          />

          {/* Glowing Cloud Emblem */}
          <path
            d="M36 132C21 132 10 121 10 107C10 94 20 83 33 82C39 65 55 53 74 53C96 53 114 69 117 90C128 92 136 101 136 112C136 123 127 132 115 132H36Z"
            fill="#3B004E"
            stroke="#C084FC"
            strokeWidth="2.5"
            opacity="0.9"
          />

          {/* Rising Growth Arrows */}
          <path
            d="M46 138L154 42M154 42H132M154 42V64"
            stroke="url(#heroArrowMain)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M94 146L182 68M182 68H163M182 68V87"
            stroke="#C084FC"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M134 150L198 94M198 94H183M198 94V109"
            stroke="#E879F9"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />

          {/* White foreground cloud bank along bottom-left */}
          <circle cx="24" cy="166" r="30" fill="url(#heroCloudWhite)" />
          <circle cx="68" cy="170" r="28" fill="url(#heroCloudWhite)" />
          <circle cx="116" cy="164" r="34" fill="url(#heroCloudWhite)" />
          <circle cx="164" cy="172" r="26" fill="url(#heroCloudWhite)" />
          <circle cx="204" cy="176" r="20" fill="url(#heroCloudWhite)" opacity="0.6" />
        </svg>

        {/* Right Side Content (White Brand Pill + Bold Headline) */}
        <div className="relative z-10 h-full flex flex-col justify-center rtl:items-start ltr:items-start px-5 sm:px-7 py-5 rtl:pl-40 sm:rtl:pl-56 ltr:pr-40 sm:ltr:pr-56">
          {/* Crisp White Brand Pill inside Banner */}
          <div className="inline-flex items-center gap-2 bg-white rounded-xl px-2.5 py-1 shadow-sm mb-3">
            <div className="flex flex-col leading-tight text-right">
              <span className="text-[11px] font-black text-[#3B004E]">
                {isAr ? 'رواج كلاود -' : 'Rawaj Cloud'}
              </span>
              <span className="text-[10px] font-extrabold text-[#5B1879]" dir="ltr">
                Rawaj Cloud
              </span>
            </div>
            <svg viewBox="0 0 42 32" className="w-7 h-5.5 shrink-0" fill="none" aria-hidden="true">
              <path
                d="M11 26H31C34.866 26 38 22.866 38 19C38 15.38 35.24 12.41 31.71 12.04C30.56 7.42 26.4 4 21.45 4C15.82 4 11.2 8.37 10.82 13.92C7.77 14.44 5.45 17.1 5.45 20.28C5.45 23.44 7.93 26 11 26Z"
                stroke="#4B0862"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 22L20 15L24 18.5L33 9.5M27.5 9.5H33V15"
                stroke="#7E22CE"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-snug">
            <span className="block">{isAr ? activeSlide.line1Ar : activeSlide.line1En}</span>
            <span className="block mt-0.5">{isAr ? activeSlide.line2Ar : activeSlide.line2En}</span>
          </h2>
        </div>
      </div>

      {/* Circular Pagination Dots Row matching the screenshot */}
      <div
        className="flex items-center justify-center gap-2 mt-3.5"
        role="tablist"
        aria-label={isAr ? 'مؤشر الشرائح' : 'Slide indicators'}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${isAr ? 'شريحة' : 'Slide'} ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white scale-110'
                  : 'bg-white/35 hover:bg-white/60'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
};
