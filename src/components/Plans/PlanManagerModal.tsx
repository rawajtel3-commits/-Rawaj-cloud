import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { PlanTier } from '../../types/storage';
import {
  X,
  Check,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export const PlanManagerModal: React.FC = () => {
  const {
    lang,
    plansModalOpen,
    setPlansModalOpen,
    currentPlan,
    upgradePlan,
    openPaymentGateway,
    allPlans,
  } = useStorage();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!plansModalOpen) return null;
  const isAr = lang === 'ar';

  const handleSelectPlan = (plan: PlanTier) => {
    if (plan.id === 'free') {
      upgradePlan(plan.id, { billingCycle });
      return;
    }
    openPaymentGateway(plan, billingCycle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[92dvh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#DCD3DF] dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#DCD3DF] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F4FA] dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2 text-[#4A0E5C] dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'خطط التخزين المرنة بدون رسوم سحب' : 'Transparent Pricing · Zero Egress'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-[#1E1E24] dark:text-white tracking-tight">
              {isAr ? 'اختر الباقة المثالية لاحتياجاتك التخزينية' : 'Upgrade Your Cloud Storage Capacity'}
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Monthly / Annual Toggle with 20% discount badge */}
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-[#4A0E5C] text-white shadow-xs'
                    : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
                }`}
              >
                {isAr ? 'شهري' : 'Monthly'}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-[#4A0E5C] text-white shadow-xs'
                    : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
                }`}
              >
                <span>{isAr ? 'سنوي' : 'Annual'}</span>
                <span className="text-[10px] bg-[#1AD062] text-white font-black px-1.5 py-0.2 rounded">
                  -20%
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPlansModalOpen(false)}
              aria-label={isAr ? 'إغلاق' : 'Close'}
              className="p-2 text-slate-400 hover:text-[#4A0E5C] dark:hover:text-slate-200 rounded-xl hover:bg-[#ECE1F0]/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plans Comparison Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {allPlans.filter(p => p.isActive !== false).map(plan => {
              const isCurrent = currentPlan.id === plan.id;
              const isPopular = plan.isPopular || plan.id === 'pro';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 ${
                    isPopular
                      ? 'bg-white dark:bg-slate-900 border-2 border-[#4A0E5C] shadow-xl shadow-[#4A0E5C]/10'
                      : isCurrent
                      ? 'bg-white dark:bg-slate-900 border-2 border-[#1AD062] shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Popular / Best Value Badge */}
                  {plan.badgeAr && (
                    <div className="absolute -top-3 rtl:left-5 ltr:right-5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-l from-[#4A0E5C] to-[#7C3AED] text-white shadow-xs">
                      {isAr ? plan.badgeAr : plan.badgeEn}
                    </div>
                  )}

                  <div>
                    {/* Plan Header */}
                    <div className="mb-4">
                      <h3 className="text-base font-black text-[#1E1E24] dark:text-white">
                        {isAr ? plan.nameAr : plan.nameEn}
                      </h3>
                      <div className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
                        {plan.id === 'flex'
                          ? (isAr ? 'الدفع حسب الاستهلاك الفعلي' : 'Pay strictly as you store')
                          : (isAr
                              ? `سعة تخزين: ${plan.storageGB >= 1024 ? `${plan.storageGB / 1024} تيرابايت` : `${plan.storageGB} جيجابايت`}`
                              : `${plan.storageGB >= 1024 ? `${plan.storageGB / 1024} TB` : `${plan.storageGB} GB`} Cloud Storage`)}
                      </div>
                    </div>

                    {/* Pricing Tag */}
                    <div className="mb-5 font-mono tabular-nums">
                      {plan.id === 'free' ? (
                        <div className="text-3xl font-black text-[#1E1E24] dark:text-white">
                          $0
                          <span className="text-xs font-normal text-[#6E6A75] dark:text-slate-400"> / {isAr ? 'مدى الحياة' : 'forever'}</span>
                        </div>
                      ) : plan.id === 'flex' ? (
                        <div className="text-3xl font-black text-[#1E1E24] dark:text-white">
                          $0.015
                          <span className="text-xs font-normal text-[#6E6A75] dark:text-slate-400"> / GB</span>
                        </div>
                      ) : (
                        <div className="text-3xl font-black text-[#1E1E24] dark:text-white">
                          ${billingCycle === 'annual' ? (plan.priceAnnualUSD / 12).toFixed(2) : plan.priceMonthlyUSD.toFixed(2)}
                          <span className="text-xs font-normal text-[#6E6A75] dark:text-slate-400"> / {isAr ? 'شهر' : 'mo'}</span>
                        </div>
                      )}
                      {plan.id !== 'free' && plan.id !== 'flex' && billingCycle === 'annual' && (
                        <div className="text-[11px] text-[#1AD062] font-bold mt-1">
                          {isAr ? `تُدفع $${plan.priceAnnualUSD} سنوياً (وفر 20%)` : `Billed $${plan.priceAnnualUSD} annually`}
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 text-xs text-[#1E1E24] dark:text-slate-300 pb-5 border-b border-[#DCD3DF]/60 dark:border-slate-800">
                      {(isAr ? plan.featuresAr : plan.featuresEn).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#1AD062] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-5">
                    {isCurrent ? (
                      <div className="w-full py-2.5 px-4 text-center text-xs font-bold text-[#1AD062] bg-[#1AD062]/10 border border-[#1AD062]/25 rounded-xl flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? 'باقتك الحالية النشطة' : 'Current Active Plan'}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                          isPopular
                            ? 'bg-gradient-to-l from-[#4A0E5C] to-[#6D28D9] hover:from-[#3B0A4B] hover:to-[#5B21B6] text-white shadow-[#4A0E5C]/25'
                            : 'bg-[#1E1E24] dark:bg-white text-white dark:text-[#1E1E24] hover:bg-black dark:hover:bg-slate-100'
                        }`}
                      >
                        {plan.id !== 'free' && <Lock className="w-3.5 h-3.5 text-emerald-300" />}
                        <span>
                          {plan.id === 'free'
                            ? (isAr ? 'تفعيل البداية المجانية' : 'Activate Free')
                            : (isAr ? 'ترقية الباقة الآن' : 'Upgrade Plan')}
                        </span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
