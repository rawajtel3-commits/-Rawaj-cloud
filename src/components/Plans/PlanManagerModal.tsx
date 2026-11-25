import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { PLAN_TIERS } from '../../data/mockData';
import { PlanTier } from '../../types/storage';
import {
  X,
  Check,
  Sparkles,
  CreditCard,
  Smartphone,
  Wallet,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const PlanManagerModal: React.FC = () => {
  const {
    lang,
    plansModalOpen,
    setPlansModalOpen,
    currentPlan,
    upgradePlan,
    allPlans,
    flexWalletBalance,
    topUpFlexWallet,
    showNotification,
  } = useStorage();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanTier | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'apple_pay' | 'card' | 'mada' | 'tamara' | 'stc_pay' | 'local_wallet'>('apple_pay');
  const [processingPayment, setProcessingPayment] = useState(false);

  if (!plansModalOpen) return null;
  const isAr = lang === 'ar';

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    setProcessingPayment(true);
    setTimeout(() => {
      upgradePlan(selectedPlanForCheckout.id);
      setProcessingPayment(false);
      setSelectedPlanForCheckout(null);
      showNotification(
        `تمت معالجة الدفع وتفعيل باقة "${selectedPlanForCheckout.nameAr}" فورياً!`,
        `Payment successful! "${selectedPlanForCheckout.nameEn}" plan is now active.`,
        'success'
      );
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'خطط التخزين المرنة بدون رسوم سحب' : 'Transparent Pricing · Zero Egress'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isAr ? 'اختر الباقة المثالية لاحتياجاتك التخزينية' : 'Upgrade Your Cloud Storage Capacity'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Monthly / Annual Toggle with 20% discount badge */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isAr ? 'شهري' : 'Monthly'}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{isAr ? 'سنوي' : 'Annual'}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                  {isAr ? 'خصم 20%' : 'Save 20%'}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                setPlansModalOpen(false);
                setSelectedPlanForCheckout(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Checkout View vs Plans Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          
          {selectedPlanForCheckout ? (
            
            /* Checkout & Regional Payment Gateways */
            <div className="max-w-xl mx-auto space-y-6">
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
              >
                <span>{isAr ? '← العودة إلى قائمة الباقات' : '← Back to Plans'}</span>
              </button>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-mono">
                    {isAr ? 'الباقة المختارة:' : 'Selected Plan:'}
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {isAr ? selectedPlanForCheckout.nameAr : selectedPlanForCheckout.nameEn} ({selectedPlanForCheckout.storageGB} GB)
                  </div>
                </div>

                <div className="text-right rtl:text-left font-mono">
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                    ${billingCycle === 'annual' ? selectedPlanForCheckout.priceAnnualUSD : selectedPlanForCheckout.priceMonthlyUSD}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {billingCycle === 'annual' ? (isAr ? 'تدفع سنوياً' : 'billed annually') : (isAr ? 'تدفع شهرياً' : 'billed monthly')}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-mono">
                  {isAr ? 'اختر بوابة الدفع المعتمدة:' : 'Select Payment Gateway:'}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  
                  {/* Apple Pay / Google Pay */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === 'apple_pay'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Apple / Google Pay</span>
                  </button>

                  {/* Credit Card / Stripe */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Stripe (Visa/Master)</span>
                  </button>

                  {/* Mada (مدى) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('mada')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === 'mada'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="font-black text-sm">مدى Mada</span>
                    <span className="text-[10px] text-slate-500">{isAr ? 'السعودية' : 'Saudi Arabia'}</span>
                  </button>

                  {/* Tamara (تمارا) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('tamara')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === 'tamara'
                        ? 'border-orange-600 bg-orange-50/50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 ring-2 ring-orange-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-sm">تمارا Tamara</span>
                    <span className="text-[10px] text-slate-500">{isAr ? 'تقسيط بدون فوائد' : 'Split in 4'}</span>
                  </button>

                  {/* STC Pay */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('stc_pay')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === 'stc_pay'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-sm">STC Pay</span>
                    <span className="text-[10px] text-slate-500">{isAr ? 'محفظة رقمية' : 'Digital Wallet'}</span>
                  </button>

                  {/* Local Wallets / Yemen */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('local_wallet')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === 'local_wallet'
                        ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span>{isAr ? 'المحافظ الإقليمية / اليمن' : 'Regional Wallets'}</span>
                  </button>

                </div>
              </div>

              {/* Grace Period & Guarantee Notice */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  {isAr
                    ? 'فترة سماح 14 يوماً مع ضمان استرجاع الأموال، ولن يتم حذف أي ملف عند تخفيض الباقة دون إشعار مسبق لإخلاء المساحة الزائدة.'
                    : '14-day grace period with money-back guarantee. No sudden file deletion on downgrades.'}
                </div>
              </div>

              {/* Submit Payment CTA */}
              <form onSubmit={handleCheckoutSubmit}>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <span>{isAr ? 'جاري معالجة الدفع الآمن المشفر...' : 'Processing Secure Payment...'}</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isAr
                          ? `إتمام الاشتراك وتفعيل السعة (${billingCycle === 'annual' ? `$${selectedPlanForCheckout.priceAnnualUSD}/سنة` : `$${selectedPlanForCheckout.priceMonthlyUSD}/شهر`})`
                          : `Complete Checkout ($${billingCycle === 'annual' ? selectedPlanForCheckout.priceAnnualUSD : selectedPlanForCheckout.priceMonthlyUSD})`}
                      </span>
                    </>
                  )}
                </button>
              </form>

            </div>

          ) : (

            /* Plans Comparison Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allPlans.filter(p => p.isActive !== false).map(plan => {
                const isCurrent = currentPlan.id === plan.id;
                const isPopular = plan.isPopular || plan.id === 'personal';

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 ${
                      isPopular
                        ? 'bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl ring-4 ring-blue-500/10'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Popular / Best Value Badge */}
                    {plan.badgeAr && (
                      <div className="absolute -top-3 rtl:left-6 ltr:right-6 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                        {isAr ? plan.badgeAr : plan.badgeEn}
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="mb-4">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {isAr ? plan.nameAr : plan.nameEn}
                        </h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {plan.id === 'flex'
                            ? (isAr ? 'الدفع حسب الاستهلاك الفعلي' : 'Pay strictly as you store')
                            : (isAr ? `سعة تخزين: ${plan.storageGB} جيجابايت` : `${plan.storageGB} GB Cloud Storage`)}
                        </div>
                      </div>

                      {/* Pricing Tag */}
                      <div className="mb-6 font-mono">
                        {plan.id === 'free' ? (
                          <div className="text-3xl font-black text-slate-900 dark:text-white">
                            $0
                            <span className="text-xs font-normal text-slate-500"> / {isAr ? 'مدى الحياة' : 'forever'}</span>
                          </div>
                        ) : plan.id === 'flex' ? (
                          <div className="text-3xl font-black text-slate-900 dark:text-white">
                            $0.008
                            <span className="text-xs font-normal text-slate-500"> / GB</span>
                          </div>
                        ) : (
                          <div className="text-3xl font-black text-slate-900 dark:text-white">
                            ${billingCycle === 'annual' ? (plan.priceAnnualUSD / 12).toFixed(2) : plan.priceMonthlyUSD}
                            <span className="text-xs font-normal text-slate-500"> / {isAr ? 'شهر' : 'mo'}</span>
                          </div>
                        )}
                        {plan.id !== 'free' && plan.id !== 'flex' && billingCycle === 'annual' && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                            {isAr ? `توفير سنوي ($${plan.priceAnnualUSD}/سنة)` : `Billed $${plan.priceAnnualUSD} annually`}
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {(isAr ? plan.featuresAr : plan.featuresEn).map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-6">
                      {isCurrent ? (
                        <div className="w-full py-2.5 px-4 text-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          {isAr ? 'باقتك الحالية النشطة' : 'Current Active Plan'}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPlanForCheckout(plan)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isPopular
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-[1.02]'
                              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                          }`}
                        >
                          {plan.id === 'free'
                            ? (isAr ? 'تفعيل البداية المجانية' : 'Activate Free')
                            : (isAr ? 'ترقية المساحة الآن' : 'Upgrade Plan')}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          )}

        </div>

      </div>
    </div>
  );
};
