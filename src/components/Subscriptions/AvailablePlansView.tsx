import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { PlanTier } from '../../types/storage';
import {
  Sparkles,
  CheckCircle2,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Zap,
  HardDrive,
  Clock,
  Layers,
  ArrowRight,
  Flame,
  BadgePercent,
  Smartphone,
  Lock,
  Wallet,
  ChevronDown,
  Info,
} from 'lucide-react';

export const AvailablePlansView: React.FC = () => {
  const {
    lang,
    allPlans,
    currentPlan,
    upgradePlan,
    openPaymentGateway,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  
  // Mobile Feature Comparison Selected Plan
  const [mobileCompareTier, setMobileCompareTier] = useState<'free' | 'personal' | 'pro' | 'flex'>('pro');

  // Free Trial Modal State
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialEmail, setTrialEmail] = useState('user@rawajye.com');

  const handleSelectPlan = (plan: PlanTier) => {
    if (plan.id === 'free') {
      upgradePlan(plan.id, { billingCycle });
      return;
    }
    openPaymentGateway(plan, billingCycle);
  };

  const handleStartTrial = (e: React.FormEvent) => {
    e.preventDefault();
    const proPlan = allPlans.find(p => p.id === 'pro') || allPlans[2];
    if (proPlan) {
      upgradePlan(proPlan.id);
    }
    setTrialModalOpen(false);
    showNotification(
      'تم تفعيل الفترة التجريبية المجانية (14 يوماً) لباقة Pro Enterprise بنجاح!',
      '14-Day Free Trial for Pro Enterprise tier activated successfully!',
      'success'
    );
  };

  // Feature Comparison Matrix Data
  const comparisonFeatures = [
    {
      titleAr: 'المساحة السحابية الصافية',
      titleEn: 'Net Cloud Storage',
      free: '15 GB',
      personal: '200 GB',
      pro: '2,048 GB (2 TB)',
      flex: isAr ? 'مرن غير محدود' : 'Unlimited On-Demand',
    },
    {
      titleAr: 'أقصى حجم لرفع الملف الواحد',
      titleEn: 'Max Single File Size',
      free: '2 GB',
      personal: '20 GB',
      pro: '50 GB',
      flex: '100 GB',
    },
    {
      titleAr: 'تشفير الخزينة الحصين (Zero-Knowledge)',
      titleEn: 'Zero-Knowledge Vault (AES-256)',
      free: false,
      personal: true,
      pro: true,
      flex: true,
    },
    {
      titleAr: 'استرجاع الإصدارات السابقة (Version Retention)',
      titleEn: 'Version History Retention',
      free: isAr ? '7 أيام' : '7 Days',
      personal: isAr ? '30 يوماً' : '30 Days',
      pro: isAr ? '90 يوماً' : '90 Days',
      flex: isAr ? '365 يوماً' : '365 Days',
    },
    {
      titleAr: 'النسخ الاحتياطي التلقائي لمحادثات واتساب',
      titleEn: 'Auto WhatsApp Chats & Media Backup',
      free: false,
      personal: true,
      pro: true,
      flex: true,
    },
    {
      titleAr: 'مشاركة الباقة العائلية',
      titleEn: 'Family Sharing Seats',
      free: isAr ? 'عضو واحد' : '1 Seat',
      personal: isAr ? 'شخصين' : '2 Seats',
      pro: isAr ? '5 أعضاء' : '5 Seats',
      flex: isAr ? 'غير محدود' : 'Unlimited',
    },
    {
      titleAr: 'معدل نقل البيانات الشهري (Egress)',
      titleEn: 'Monthly Bandwidth Egress',
      free: '20 GB',
      personal: '150 GB',
      pro: '500 GB',
      flex: isAr ? 'حسب الاستهلاك ($0.02/GB)' : 'Metered ($0.02/GB)',
    },
    {
      titleAr: 'دعم فني مخصص ذو أولوية (SLA 99.99%)',
      titleEn: 'Priority SLA WhatsApp Support',
      free: false,
      personal: false,
      pro: true,
      flex: true,
    },
  ];

  return (
    <div className="w-full flex-1 flex flex-col bg-white dark:bg-slate-950">
      
      {/* View Header (Scrolls naturally with page content) */}
      <div className="border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/80 dark:bg-slate-900/80 px-3.5 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#4E115A]/20">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-[#1E1E24] dark:text-white truncate">
                  {isAr ? 'الخطط والباقات المتاحة' : 'Available Storage Plans'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#A38540]/15 text-[#A38540] border border-[#A38540]/30 shrink-0">
                  <BadgePercent className="w-3 h-3" />
                  <span>{isAr ? 'وفر 20% سنوياً' : '-20% Annual'}</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5 truncate max-w-xl">
                {isAr
                  ? 'اختر السعة المناسبة مع تشفير كامل بمفتاحك الخاص وتجربة مجانية 14 يوماً'
                  : 'Choose the ideal tier with zero-knowledge encryption & 14-day free trial'}
              </p>
            </div>
          </div>

          {/* Billing Cycle Switcher & Trial Button (Fully Responsive on Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end w-full md:w-auto pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => setTrialModalOpen(true)}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-xl border border-[#A38540] text-[#A38540] hover:bg-[#A38540]/10 text-xs font-bold transition-colors whitespace-nowrap text-center cursor-pointer shadow-2xs"
            >
              {isAr ? 'تجربة مجانية 14 يوم' : '14-Day Free Trial'}
            </button>

            <div className="flex items-center p-1 bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 rounded-2xl shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#4E115A] text-white shadow-xs'
                    : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24]'
                }`}
              >
                {isAr ? 'شهري' : 'Monthly'}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-[#4E115A] text-white shadow-xs'
                    : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24]'
                }`}
              >
                <span>{isAr ? 'سنوي' : 'Annual'}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#1AD062] text-[10px] text-white font-black">
                  -20%
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 py-6 sm:py-8 pb-28 space-y-8 sm:space-y-10">

        {/* Pricing Cards Grid (Responsive 1-col on mobile, 2-col on tablet, 4-col on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {allPlans.map((plan) => {
            const isCurrent = currentPlan.id === plan.id;
            const isPro = plan.id === 'pro';
            const price = billingCycle === 'annual' 
              ? (plan.priceAnnualUSD / 12).toFixed(2) 
              : plan.priceMonthlyUSD.toFixed(2);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300 ${
                  isPro
                    ? 'border-2 border-[#4E115A] bg-white dark:bg-slate-900 shadow-xl shadow-[#4E115A]/10 lg:scale-[1.02]'
                    : isCurrent
                    ? 'border-2 border-[#1AD062] bg-white dark:bg-slate-900 shadow-md'
                    : 'border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg'
                }`}
              >
                {/* Popular or Current Badge */}
                {isPro && (
                  <div className="absolute -top-3.5 inset-x-0 mx-auto w-fit px-3 py-0.5 rounded-full bg-[#4E115A] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>{isAr ? 'الأكثر طلباً واقتصاداً' : 'Most Popular'}</span>
                  </div>
                )}
                {isCurrent && !isPro && (
                  <div className="absolute -top-3.5 inset-x-0 mx-auto w-fit px-3 py-0.5 rounded-full bg-[#1AD062] text-white text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'باقتك الحالية' : 'Your Current Plan'}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-black text-[#1E1E24] dark:text-white truncate">
                      {isAr ? plan.nameAr : plan.nameEn}
                    </h3>
                    <span className="text-[11px] font-bold text-[#A38540] px-2 py-0.5 rounded-md bg-[#A38540]/10 shrink-0">
                      {isAr ? plan.badgeAr || 'أساسي' : plan.badgeEn || 'Standard'}
                    </span>
                  </div>

                  <div className="mt-3 sm:mt-4 mb-4 sm:mb-5">
                    {plan.id === 'flex' ? (
                      <div>
                        <div className="text-2xl font-black text-[#1E1E24] dark:text-white">
                          $0.015 <span className="text-xs font-normal text-[#6E6A75] dark:text-slate-400">/ GB / {isAr ? 'شهر' : 'mo'}</span>
                        </div>
                        <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-0.5">
                          {isAr ? 'ادفع فقط على قدر ما تستهلك' : 'Pay only for what you store'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-[#1E1E24] dark:text-white">
                            ${price}
                          </span>
                          <span className="text-xs text-[#6E6A75] dark:text-slate-400 font-medium">
                            / {isAr ? 'شهرياً' : 'mo'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-0.5">
                          {billingCycle === 'annual'
                            ? (isAr ? `تُدفع $${plan.priceAnnualUSD} سنوياً` : `Billed $${plan.priceAnnualUSD} annually`)
                            : (isAr ? 'تجديد شهري مرن' : 'Billed monthly')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Core Capacity Highlight */}
                  <div className="p-3 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800 border border-[#DCD3DF]/80 dark:border-slate-700 mb-4 sm:mb-5 text-center">
                    <div className="text-lg sm:text-xl font-black text-[#4E115A] dark:text-purple-300">
                      {plan.storageGB >= 1024 ? `${plan.storageGB / 1024} TB` : `${plan.storageGB} GB`}
                    </div>
                    <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-medium">
                      {isAr ? 'سعة تخزينية سحابية مشفرة' : 'Encrypted cloud storage'}
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2 mb-5 sm:mb-6">
                    {(isAr ? plan.featuresAr : plan.featuresEn).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1AD062] shrink-0 mt-0.5" />
                        <span className="text-[#1E1E24] dark:text-slate-200 leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action Button */}
                <div className="pt-3 sm:pt-4 border-t border-[#DCD3DF]/60 dark:border-slate-800">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-[#1AD062]/15 text-[#1AD062] font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAr ? 'الباقة المفعلة حالياً' : 'Current Active Plan'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                        isPro
                          ? 'bg-[#4E115A] hover:bg-[#3D0D47] text-white shadow-[#4E115A]/25'
                          : 'bg-[#1E1E24] hover:bg-black text-white dark:bg-white dark:text-[#1E1E24]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {plan.id === 'free'
                          ? (isAr ? 'التحويل إلى المجانية' : 'Switch to Free')
                          : (isAr ? 'ترقية الباقة الآن' : 'Upgrade Plan')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Section */}
        <div className="rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          
          <div className="p-4 sm:p-6 bg-[#F5EFF7]/60 dark:bg-slate-800/60 border-b border-[#DCD3DF] dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1E1E24] dark:text-white">
                {isAr ? 'مصفوفة المقارنة الشاملة لجميع الميزات' : 'Comprehensive Feature Comparison Matrix'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'قارن بين مختلف الباقات للعثور على الأنسب لاحتياجاتك الشخصية أو متطلبات فريق عملك'
                  : 'Compare technical limits, security standards, and SLA guarantees across all tiers'}
              </p>
            </div>

            {/* Mobile Tier Selector Tabs (Visible on small screens < md) */}
            <div className="flex md:hidden items-center p-1 bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setMobileCompareTier('free')}
                className={`flex-1 min-w-[70px] py-1 text-[11px] font-bold rounded-lg transition-all ${
                  mobileCompareTier === 'free'
                    ? 'bg-[#4E115A] text-white shadow-2xs'
                    : 'text-[#6E6A75] dark:text-slate-400'
                }`}
              >
                {isAr ? 'المجانية' : 'Free'}
              </button>
              <button
                type="button"
                onClick={() => setMobileCompareTier('personal')}
                className={`flex-1 min-w-[70px] py-1 text-[11px] font-bold rounded-lg transition-all ${
                  mobileCompareTier === 'personal'
                    ? 'bg-[#4E115A] text-white shadow-2xs'
                    : 'text-[#6E6A75] dark:text-slate-400'
                }`}
              >
                {isAr ? 'الشخصية' : 'Personal'}
              </button>
              <button
                type="button"
                onClick={() => setMobileCompareTier('pro')}
                className={`flex-1 min-w-[70px] py-1 text-[11px] font-bold rounded-lg transition-all ${
                  mobileCompareTier === 'pro'
                    ? 'bg-[#4E115A] text-white shadow-2xs'
                    : 'text-[#6E6A75] dark:text-slate-400'
                }`}
              >
                {isAr ? 'الاحترافية' : 'Pro'}
              </button>
              <button
                type="button"
                onClick={() => setMobileCompareTier('flex')}
                className={`flex-1 min-w-[70px] py-1 text-[11px] font-bold rounded-lg transition-all ${
                  mobileCompareTier === 'flex'
                    ? 'bg-[#4E115A] text-white shadow-2xs'
                    : 'text-[#6E6A75] dark:text-slate-400'
                }`}
              >
                {isAr ? 'المرنة' : 'Flex'}
              </button>
            </div>
          </div>

          {/* Mobile Comparison Card View (< md) */}
          <div className="block md:hidden divide-y divide-[#DCD3DF]/60 dark:divide-slate-800 p-2">
            {comparisonFeatures.map((row, idx) => {
              const val = row[mobileCompareTier];
              return (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-[#1E1E24] dark:text-white flex-1">
                    {isAr ? row.titleAr : row.titleEn}
                  </span>
                  <div className="shrink-0 text-center font-bold">
                    {typeof val === 'boolean' ? (
                      val ? (
                        <span className="inline-flex items-center gap-1 text-[#1AD062] bg-[#1AD062]/10 px-2 py-0.5 rounded-full text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAr ? 'متاح' : 'Included'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[11px]">
                          <X className="w-3.5 h-3.5" />
                          <span>{isAr ? 'غير مشمول' : 'Not Included'}</span>
                        </span>
                      )
                    ) : (
                      <span className="text-[#4E115A] dark:text-purple-300 font-mono text-xs">
                        {val}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Full Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/30 dark:bg-slate-900/30">
                  <th className="p-4 font-bold text-[#1E1E24] dark:text-white w-2/5">
                    {isAr ? 'الميزة / الخاصية' : 'Feature / Specification'}
                  </th>
                  <th className="p-4 font-bold text-[#6E6A75] dark:text-slate-300 text-center">
                    {isAr ? 'المجانية (15GB)' : 'Free (15GB)'}
                  </th>
                  <th className="p-4 font-bold text-[#6E6A75] dark:text-slate-300 text-center">
                    {isAr ? 'الشخصية (200GB)' : 'Personal (200GB)'}
                  </th>
                  <th className="p-4 font-bold text-[#4E115A] dark:text-purple-300 text-center bg-[#4E115A]/5">
                    {isAr ? 'الاحترافية (2TB)' : 'Pro (2TB)'}
                  </th>
                  <th className="p-4 font-bold text-[#A38540] dark:text-amber-400 text-center">
                    {isAr ? 'المرنة (Flex)' : 'Flex (On-Demand)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD3DF]/60 dark:divide-slate-800">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-medium text-[#1E1E24] dark:text-white">
                      {isAr ? row.titleAr : row.titleEn}
                    </td>

                    {/* Free */}
                    <td className="p-4 text-center text-[#6E6A75] dark:text-slate-300 font-mono">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-4 h-4 text-[#1AD062] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span>{row.free}</span>
                      )}
                    </td>

                    {/* Personal */}
                    <td className="p-4 text-center text-[#6E6A75] dark:text-slate-300 font-mono">
                      {typeof row.personal === 'boolean' ? (
                        row.personal ? (
                          <Check className="w-4 h-4 text-[#1AD062] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span>{row.personal}</span>
                      )}
                    </td>

                    {/* Pro */}
                    <td className="p-4 text-center font-bold text-[#4E115A] dark:text-purple-300 bg-[#4E115A]/5 font-mono">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="w-4 h-4 text-[#1AD062] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span>{row.pro}</span>
                      )}
                    </td>

                    {/* Flex */}
                    <td className="p-4 text-center font-semibold text-[#A38540] dark:text-amber-400 font-mono">
                      {typeof row.flex === 'boolean' ? (
                        row.flex ? (
                          <Check className="w-4 h-4 text-[#1AD062] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )
                      ) : (
                        <span>{row.flex}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Enterprise Security & Guarantee Banner (Responsive flex on mobile/desktop) */}
        <div className="rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7] dark:bg-slate-900 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'ضمان استرداد الأموال بنسبة 100% لمدة 30 يوماً' : '30-Day Money Back Guarantee'}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5 leading-relaxed max-w-xl">
                {isAr
                  ? 'جرب أي باقة مدفوعة لمدة شهر كامل. إذا لم تكن راضياً تماماً عن السرعة أو التشفير، نسترد أموالك فوراً دون أي شروط.'
                  : 'Try any paid plan risk-free. If not completely satisfied with our performance or privacy, get an instant full refund.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4E115A] dark:text-purple-300 shrink-0 self-end sm:self-center">
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'دفع آمن ومشفر 256-bit SSL' : '256-Bit SSL Encrypted'}</span>
          </div>
        </div>

      </div>

      {/* Free Trial Modal (Fully Scrollable and Responsive on Mobile) */}
      {trialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm sm:text-base font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'بدء فترة تجريبية مجانية 14 يوماً' : 'Start 14-Day Free Trial'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrialModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6E6A75] dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'استمتع بكافة ميزات باقة Pro Enterprise بسعة 2 تيرابايت وتشفير كامل دون الحاجة لإدخال بيانات بطاقة ائتمانية.'
                : 'Experience all features of Pro Enterprise 2TB tier without entering credit card details.'}
            </p>

            <form onSubmit={handleStartTrial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white mb-1.5">
                  {isAr ? 'البريد الإلكتروني للترقية' : 'Account Email'}
                </label>
                <input
                  type="email"
                  value={trialEmail}
                  onChange={(e) => setTrialEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#4E115A]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#1AD062]/10 border border-[#1AD062]/20 text-[11px] text-[#1AD062] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'لا يتطلب أي بطاقة بنكية • إلغاء تلقائي بعد 14 يوماً' : 'No credit card required • Auto-cancels in 14 days'}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTrialModalOpen(false)}
                  className="flex-1 py-2 sm:py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#6E6A75] dark:text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 sm:py-2.5 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold shadow-md shadow-[#4E115A]/25 transition-all cursor-pointer"
                >
                  {isAr ? 'تفعيل التجربة الآن' : 'Activate Free Trial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
