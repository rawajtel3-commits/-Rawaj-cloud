import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Layers,
  HardDrive,
  Cpu,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Lock,
  Wallet,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Sliders,
  ChevronRight,
  Check,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export const MyActivePlansView: React.FC = () => {
  const {
    lang,
    currentPlan,
    quota,
    flexWalletBalance,
    topUpFlexWallet,
    setActiveTab,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(25);

  const usedPercentage = Math.min(100, Math.round((quota.usedBytes / quota.totalBytes) * 100));
  const remainingBytes = Math.max(0, quota.totalBytes - quota.usedBytes);

  // Bandwidth simulation
  const monthlyBandwidthLimitGB = currentPlan.bandwidthEgressGB || 500;
  const usedBandwidthGB = 142.4;
  const bandwidthPercentage = Math.round((usedBandwidthGB / monthlyBandwidthLimitGB) * 100);

  const handleRechargeWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (rechargeAmount > 0) {
      topUpFlexWallet(rechargeAmount);
      setRechargeModalOpen(false);
      showNotification(
        `تم شحن رصيد المحفظة المرنة بنجاح بقيمة $${rechargeAmount}.00 USD`,
        `Successfully charged Flex Wallet with $${rechargeAmount}.00 USD`,
        'success'
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950 overflow-y-auto">
      {/* View Header (Scrolls naturally with page content) */}
      <div className="border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/60 dark:bg-slate-900/60 px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shadow-md shadow-[#4E115A]/20 shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'باقاتي ومخصصات التخزين' : 'My Plans & Quotas'}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1AD062] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'الباقة مفعلة' : 'Active Plan'}</span>
                </span>
              </div>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5 leading-relaxed">
                {isAr
                  ? 'مراقبة سعة التخزين المستهلكة، ميزات الباقة الحالية، استهلاك البيانات وإدارة الترقية'
                  : 'Monitor consumed storage, active plan features, data quotas, and upgrade management'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('available-plans')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold shadow-md shadow-[#4E115A]/25 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{isAr ? 'ترقية / تغيير الباقة' : 'Upgrade / Change Plan'}</span>
              <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#1E1E24] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#A38540] shrink-0" />
              <span>{isAr ? 'بيانات التجديد والفواتير' : 'Billing & Renewal'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 pb-20 sm:pb-8 space-y-6">
        
        {/* Active Plan Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-gradient-to-br from-[#4E115A] via-[#3a0c43] to-[#25082b] text-white p-7 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#1AD062]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/15 text-white backdrop-blur-sm border border-white/20">
                  {isAr ? currentPlan.badgeAr || 'باقة احترافية' : currentPlan.badgeEn || 'Pro Enterprise'}
                </span>
                <span className="text-xs text-white/70">
                  {isAr ? 'اشتراك سنوي مسبق الدفع' : 'Prepaid Annual Plan'}
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                {isAr ? currentPlan.nameAr : currentPlan.nameEn}
                <span className="text-xl font-normal text-white/80">
                  ({currentPlan.storageGB >= 1024 ? `${currentPlan.storageGB / 1024} TB` : `${currentPlan.storageGB} GB`})
                </span>
              </h2>
              <p className="text-xs text-white/80 max-w-xl mt-1">
                {isAr
                  ? 'باقة سحابية مؤمنة بنظام التشفير بدون معرفة (Zero-Knowledge) مع إمكانية مشاركة عائلية وسرعات رفع متزامنة غير مقيدة.'
                  : 'Zero-knowledge end-to-end encrypted cloud storage with family access and unthrottled concurrent uploads.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-right sm:text-left rtl:sm:text-right bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15">
                <div className="text-xs text-white/70">{isAr ? 'تكلفة التجديد السنوي' : 'Annual Renewal Cost'}</div>
                <div className="text-2xl font-black text-white">
                  ${currentPlan.priceAnnualUSD} <span className="text-xs font-normal text-white/70">/ {isAr ? 'سنة' : 'year'}</span>
                </div>
                <div className="text-[11px] text-[#1AD062] font-bold">
                  {isAr ? 'توفير 20% مقارنة بالشهري' : 'Save 20% vs monthly'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Usage Meters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Storage Meter */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-1.5 font-bold text-white/90">
                  <HardDrive className="w-4 h-4 text-amber-300" />
                  {isAr ? 'المساحة التخزينية' : 'Storage Quota'}
                </span>
                <span className="font-mono text-white/80">
                  {usedPercentage}%
                </span>
              </div>
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-300 to-[#1AD062] transition-all duration-500 rounded-full"
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/75">
                <span>{formatBytes(quota.usedBytes)} {isAr ? 'مستخدمة' : 'used'}</span>
                <span>{formatBytes(quota.totalBytes)} {isAr ? 'الإجمالي' : 'total'}</span>
              </div>
              <div className="text-[11px] text-emerald-300 mt-1">
                {isAr ? `متبقي ${formatBytes(remainingBytes)} متوفرة للحفظ` : `${formatBytes(remainingBytes)} available`}
              </div>
            </div>

            {/* Bandwidth Egress Meter */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-1.5 font-bold text-white/90">
                  <Zap className="w-4 h-4 text-cyan-300" />
                  {isAr ? 'نقل البيانات الشهري (Egress)' : 'Monthly Egress'}
                </span>
                <span className="font-mono text-white/80">
                  {bandwidthPercentage}%
                </span>
              </div>
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${bandwidthPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/75">
                <span>{usedBandwidthGB} GB {isAr ? 'مستهلكة' : 'consumed'}</span>
                <span>{monthlyBandwidthLimitGB} GB {isAr ? 'الحد الشهري' : 'monthly limit'}</span>
              </div>
              <div className="text-[11px] text-cyan-200 mt-1">
                {isAr ? 'تتجدد الحصة في الأول من كل شهر' : 'Resets on the 1st of each month'}
              </div>
            </div>

            {/* Flex Wallet Balance */}
            <div className="bg-black/20 rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-white/90">
                    <Wallet className="w-4 h-4 text-[#1AD062]" />
                    {isAr ? 'محفظة الدفع المرن (Flex)' : 'Flex Wallet Balance'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1AD062]/20 text-[#1AD062]">
                    {isAr ? 'مفعلة' : 'Active'}
                  </span>
                </div>
                <div className="text-2xl font-black text-white">
                  ${flexWalletBalance.toFixed(2)} USD
                </div>
                <p className="text-[11px] text-white/70 mt-1">
                  {isAr
                    ? 'رصيد تلقائي لتغطية أي استهلاك إضافي دون انقطاع الخدمة'
                    : 'Auto-funds any overages seamlessly with no service pause'}
                </p>
              </div>

              <button
                onClick={() => setRechargeModalOpen(true)}
                className="mt-3 w-full py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? 'شحن المحفظة المرنة' : 'Top-up Wallet'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#6E6A75] dark:text-slate-400 font-medium">
              {isAr ? 'أقصى حجم للملف الواحد' : 'Max Upload Size per File'}
            </div>
            <div className="text-xl font-black text-[#1E1E24] dark:text-white">
              {currentPlan.maxFileSizeGB} GB
            </div>
            <p className="text-[11px] text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'رفع ملفات الفيديو الخام وقواعد البيانات الضخمة' : 'Support for raw 4K videos & huge database dumps'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#6E6A75] dark:text-slate-400 font-medium">
              {isAr ? 'فترة استرجاع الإصدارات' : 'Version History Retention'}
            </div>
            <div className="text-xl font-black text-[#1E1E24] dark:text-white">
              {currentPlan.versionRetentionDays} {isAr ? 'يوماً' : 'Days'}
            </div>
            <p className="text-[11px] text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'استعادة أي تعديل سابق وحماية ضد برمجيات الفدية' : 'Rollback any overwritten file & ransomware shield'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#6E6A75] dark:text-slate-400 font-medium">
              {isAr ? 'الخزينة المشفرة الحصينة' : 'Zero-Knowledge Vault'}
            </div>
            <div className="text-xl font-black text-[#1AD062] flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <span>{isAr ? 'مفعلة' : 'Enabled'}</span>
            </div>
            <p className="text-[11px] text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'تشفير AES-256 محلي لا يمكن لأحد سواك فكه' : 'Client-side AES-256 keys, zero platform visibility'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#6E6A75] dark:text-slate-400 font-medium">
              {isAr ? 'مشاركة الحساب العائلية' : 'Family Sharing Seats'}
            </div>
            <div className="text-xl font-black text-[#1E1E24] dark:text-white">
              {currentPlan.familyMembers} {isAr ? 'أعضاء' : 'Members'}
            </div>
            <p className="text-[11px] text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'مساحات خاصة ومنفصلة لكل عضو تحت فاتورة واحدة' : 'Private segregated storage pools under single invoice'}
            </p>
          </div>
        </div>

        {/* Feature Comparison & Current Entitlements */}
        <div className="rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCD3DF] dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'قائمة الميزات المضمنة في باقتك' : 'Included Plan Features'}
              </h3>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
                {isAr ? 'جميع الميزات المتاحة لحسابك وفقاً لاشتراكك الحالي' : 'All active capabilities available under your tier'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('available-plans')}
              className="text-xs font-bold text-[#4E115A] hover:underline flex items-center gap-1"
            >
              <span>{isAr ? 'عرض باقات الترقية الأعلى' : 'Explore higher tiers'}</span>
              <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-5">
            {(isAr ? currentPlan.featuresAr : currentPlan.featuresEn).map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFF7]/60 dark:bg-slate-800/60 border border-[#DCD3DF]/70 dark:border-slate-700/60"
              >
                <div className="w-5 h-5 rounded-full bg-[#1AD062]/15 text-[#1AD062] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-[#1E1E24] dark:text-slate-200">
                  {feat}
                </span>
              </div>
            ))}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFF7]/60 dark:bg-slate-800/60 border border-[#DCD3DF]/70 dark:border-slate-700/60">
              <div className="w-5 h-5 rounded-full bg-[#1AD062]/15 text-[#1AD062] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-[#1E1E24] dark:text-slate-200">
                {isAr ? 'دعم فني مخصص ومباشر عبر واتساب الإدارة' : 'Priority direct WhatsApp management SLA support'}
              </span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFF7]/60 dark:bg-slate-800/60 border border-[#DCD3DF]/70 dark:border-slate-700/60">
              <div className="w-5 h-5 rounded-full bg-[#1AD062]/15 text-[#1AD062] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-[#1E1E24] dark:text-slate-200">
                {isAr ? 'نسخ احتياطي فوري لمحادثات واتساب ومكتبة الصور' : 'Real-time WhatsApp & camera media backup sync'}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Expiry & Renewal Countdown Banner */}
        <div className="rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-gradient-to-r from-[#F5EFF7] to-white dark:from-slate-900 dark:to-slate-950 p-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {isAr ? 'موعد التجديد التلقائي القادم' : 'Upcoming Automatic Renewal'}
              </div>
              <div className="text-base font-black text-[#1E1E24] dark:text-white mt-0.5">
                15 {isAr ? 'يناير' : 'January'} 2027 (متبقي 340 يوماً)
              </div>
              <div className="text-xs text-[#6E6A75] dark:text-slate-400">
                {isAr
                  ? 'سيتم الخصم عبر بطاقة Mada المنتهية برقم 4812 مع إشعار مسبق قبل 7 أيام'
                  : 'Will be billed to Mada card ending in 4812 with a 7-day prior notification'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#1E1E24] dark:text-white hover:bg-slate-50 transition-colors text-center"
            >
              {isAr ? 'إدارة الاشتراك وتفاصيل الدفع' : 'Manage Subscription & Invoices'}
            </button>
            <button
              onClick={() => setActiveTab('available-plans')}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold transition-colors text-center"
            >
              {isAr ? 'ترقية المساحة الآن' : 'Upgrade Storage Now'}
            </button>
          </div>
        </div>

      </div>

      {/* Recharge Wallet Modal */}
      {rechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#4E115A]" />
                <h3 className="text-base font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'شحن المحفظة المرنة (Flex Wallet)' : 'Recharge Flex Wallet'}
                </h3>
              </div>
              <button
                onClick={() => setRechargeModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6E6A75] dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'يستخدم رصيد المحفظة المرنة لتغطية أي تخزين إضافي أو عمليات نقل بيانات تتجاوز حصة باقتك بتكلفة ميسرة ($0.015 لكل جيجابايت إضافي شهرياً).'
                : 'Flex Wallet covers on-demand storage and egress overages beyond your active tier plan at $0.015/GB/month.'}
            </p>

            <form onSubmit={handleRechargeWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white mb-2">
                  {isAr ? 'اختر قيمة الشحن (USD)' : 'Select Recharge Amount (USD)'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setRechargeAmount(val)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        rechargeAmount === val
                          ? 'border-[#4E115A] bg-[#4E115A] text-white shadow-md shadow-[#4E115A]/25'
                          : 'border-[#DCD3DF] dark:border-slate-700 bg-[#F5EFF7]/60 dark:bg-slate-800 text-[#1E1E24] dark:text-white'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5EFF7] dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-xs flex items-center justify-between">
                <span className="text-[#6E6A75] dark:text-slate-400 font-medium">
                  {isAr ? 'وسيلة الدفع الافتراضية' : 'Default Payment Method'}
                </span>
                <span className="font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1AD062]" />
                  Mada (•••• 4812)
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRechargeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#6E6A75] dark:text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold shadow-md shadow-[#4E115A]/25 transition-all"
                >
                  {isAr ? `تأكيد الشحن ($${rechargeAmount})` : `Confirm Charge ($${rechargeAmount})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
