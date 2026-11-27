import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  calculateFinancialBreakdown,
  generateStandardPackages,
  convertCurrency,
  formatCurrency,
  SAMPLE_FINOPS_KPIS,
} from '../../utils/finopsCalculator';
import {
  Calculator,
  Sliders,
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  HardDrive,
  Cpu,
  Globe,
  Database,
  Layers,
  Sparkles,
  Download,
  Percent,
  RefreshCw,
  Scale,
  FileCode,
  Check,
  Bell,
  BellRing,
} from 'lucide-react';
import {
  CurrencyCode,
  CURRENCY_RATES,
  CloudUnitRates,
  OperationalCostConfig,
  PackageResourceInput,
  DEFAULT_UNIT_RATES,
  DEFAULT_OPERATIONAL_CONFIG,
  SpendThresholdConfig,
  SpendAlertHistoryItem,
  DEFAULT_SPEND_THRESHOLD_CONFIG,
} from '../../types/finops';
import { FinOpsTrendChart } from './FinOpsTrendChart';
import { PredictiveRevenueForecast } from './PredictiveRevenueForecast';
import { PlanManagementPanel } from './PlanManagementPanel';
import { SpendThresholdModal } from './SpendThresholdModal';
import { BillingReconciliationModule } from './BillingReconciliationModule';

export const CloudAccountingView: React.FC = () => {
  const { lang, showNotification, setPlansModalOpen } = useStorage();
  const isAr = lang === 'ar';

  // Sub-navigation state
  const [activeSubTab, setActiveSubTab] = useState<'modeler' | 'catalog' | 'management' | 'reconciliation' | 'kpis' | 'forecast' | 'api'>('modeler');

  // Currency & Billing toggle
  const [currency, setCurrency] = useState<CurrencyCode>('SAR');
  const [isAnnual, setIsAnnual] = useState(false);

  // Configurable Unit Rates & Operational Parameters
  const [unitRates, setUnitRates] = useState<CloudUnitRates>(DEFAULT_UNIT_RATES);
  const [operationalConfig, setOperationalConfig] = useState<OperationalCostConfig>(DEFAULT_OPERATIONAL_CONFIG);

  // Spend Threshold & Alert State
  const [spendConfig, setSpendConfig] = useState<SpendThresholdConfig>(DEFAULT_SPEND_THRESHOLD_CONFIG);
  const [spendModalOpen, setSpendModalOpen] = useState(false);
  const [alertHistory, setAlertHistory] = useState<SpendAlertHistoryItem[]>([
    {
      id: 'alert-init-1',
      type: 'warning',
      timestamp: '2026-11-06 14:20:00 UTC',
      projectedSpendUSD: 32.50,
      budgetUSD: 40.00,
      thresholdPercent: 81.2,
      messageAr: 'وصل الإنفاق السحابي المتوقع إلى 81.2% من الميزانية الشهرية المقدرة ($40.00)',
      messageEn: 'Projected monthly cloud spend reached 81.2% of set budget ($40.00)',
      status: 'active',
    },
  ]);

  // Custom Package Modeler Inputs
  const [customResources, setCustomResources] = useState<PackageResourceInput>({
    storageHotGB: 500,
    storageColdGB: 250,
    monthlyEgressGB: 200,
    monthlyIOPSIn10k: 150,
    computeVcpuHours: 40,
    backupRetentionDays: 45,
    dedicatedTenancy: false,
  });

  // Calculate dynamic custom breakdown
  const customFinancials = useMemo(() => {
    return calculateFinancialBreakdown(customResources, unitRates, operationalConfig);
  }, [customResources, unitRates, operationalConfig]);

  // Derived SaaS packages
  const standardPackages = useMemo(() => {
    return generateStandardPackages(unitRates, operationalConfig);
  }, [unitRates, operationalConfig]);

  // Quotation Export Simulator
  const handleExportQuotation = (pkgName: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(
        {
          platform: 'Rawaj Cloud - رواج كلاود',
          package: pkgName,
          currency,
          billing: isAnnual ? 'annual' : 'monthly',
          financials: customFinancials,
          unitRates,
          operationalConfig,
          generatedAt: new Date().toISOString(),
          compliance: 'ISO 27001 / GDPR Article 17 / SOC2',
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RawajCloud-Quotation-${pkgName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification(
      'تم تصدير عرض السعر والنموذج المالي بصيغة JSON المعتمدة',
      'Quotation & Financial Model exported as certified JSON',
      'success'
    );
  };

  // Spend Threshold & Alert Evaluation
  const currentProjectedMonthlyUSD = customFinancials.finalPriceMonthly;
  const currentSpendRatio = spendConfig.monthlyBudgetUSD > 0
    ? (currentProjectedMonthlyUSD / spendConfig.monthlyBudgetUSD) * 100
    : 0;

  const isSpendCritical = spendConfig.enabled && currentSpendRatio >= spendConfig.criticalThresholdPercent;
  const isSpendWarning = spendConfig.enabled && currentSpendRatio >= spendConfig.warningThresholdPercent && !isSpendCritical;

  // Simulate traffic / capacity surge to trigger alert
  const handleTriggerSimulatedSpike = () => {
    setCustomResources(prev => ({
      ...prev,
      storageHotGB: 2500, // 2.5 TB
      monthlyEgressGB: 1800, // 1.8 TB
      monthlyIOPSIn10k: 800,
      computeVcpuHours: 120,
    }));

    const newProjected = 62.40;
    const ratio = (newProjected / spendConfig.monthlyBudgetUSD) * 100;
    const newAlert: SpendAlertHistoryItem = {
      id: `alert-surge-${Date.now()}`,
      type: 'critical',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      projectedSpendUSD: newProjected,
      budgetUSD: spendConfig.monthlyBudgetUSD,
      thresholdPercent: Math.round(ratio),
      messageAr: `⚠️ قفزة استهلاك مفاجئة! التكلفة المتوقعة ($${newProjected.toFixed(2)}) تجاوزت السقف الشهري ($${spendConfig.monthlyBudgetUSD.toFixed(2)}) بنسبة ${Math.round(ratio)}%`,
      messageEn: `⚠️ Consumption surge! Projected cost ($${newProjected.toFixed(2)}) exceeded monthly ceiling ($${spendConfig.monthlyBudgetUSD.toFixed(2)}) at ${Math.round(ratio)}%`,
      status: 'active',
    };

    setAlertHistory(prev => [newAlert, ...prev]);

    if (spendConfig.notifyViaToast) {
      showNotification(
        `⚠️ تنبيه ميزانية حرج: التكلفة السحابية المتوقعة تجاوزت سقف الميزانية ($${spendConfig.monthlyBudgetUSD.toFixed(2)})! تم إرسال إشعار إلى ${spendConfig.alertEmailRecipient}`,
        `⚠️ Critical Budget Alert: Projected cloud costs exceeded budget ceiling ($${spendConfig.monthlyBudgetUSD.toFixed(2)})! Notification dispatched to ${spendConfig.alertEmailRecipient}`,
        'warning'
      );
    }
  };

  const handleResetSpend = () => {
    setCustomResources({
      storageHotGB: 500,
      storageColdGB: 250,
      monthlyEgressGB: 200,
      monthlyIOPSIn10k: 150,
      computeVcpuHours: 40,
      backupRetentionDays: 45,
      dedicatedTenancy: false,
    });
    showNotification(
      'تمت إعادة ضبط الموارد والتكلفة المتوقعة إلى القيم المعيارية الآمنة',
      'Resources and projected spend reset to standard baseline',
      'info'
    );
  };

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 pb-28 space-y-6">
      
      {/* Top Banner & FinOps Title */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>{isAr ? 'محرك المحاسبة السحابية وهامش 15%' : 'Cloud FinOps & 15% Profit Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isAr ? 'نظام المحاسبة المالية ونمذجة باقات السحابة' : 'Cloud Cost Accounting & SaaS Pricing Engine'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'نمذجة شاملة لتكاليف البنية التحتية السحابية (التخزين، النقل، العمليات، الحوسبة) مع تضمين التكاليف التشغيلية للمنصة وتطبيق هامش ربح إلزامي 15% لاشتقاق باقات SaaS مرنة وعادلة.'
                : 'Enterprise FinOps model decomposing direct cloud costs, amortizing platform overheads, applying a guaranteed 15% net profit margin, and generating adaptive SaaS pricing tiers.'}
            </p>
          </div>

          {/* Quick Global Controls: Currency + Annual Switcher */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/10 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            
            {/* Currency Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-300 font-semibold px-1">
                {isAr ? 'العملة:' : 'Currency:'}
              </span>
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
                {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map(cur => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                      currency === cur
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center gap-1.5 border-s border-white/20 ps-3">
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isAnnual
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>{isAnnual ? (isAr ? 'سنوي (خصم 20%)' : 'Annual (20% Off)') : (isAr ? 'شهري' : 'Monthly')}</span>
              </button>
            </div>

            {/* Monthly Spend Budget & Threshold Alert Trigger Button */}
            <div className="flex items-center gap-1.5 border-s border-white/20 ps-3">
              <button
                onClick={() => setSpendModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSpendCritical
                    ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-md animate-pulse'
                    : isSpendWarning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
                title={isAr ? 'إعدادات سقف الإنفاق والتنبيهات' : 'Spend Threshold Settings'}
              >
                <BellRing className={`w-3.5 h-3.5 ${isSpendCritical || isSpendWarning ? 'animate-bounce' : ''}`} />
                <span>
                  {isAr ? 'سقف الميزانية:' : 'Budget Limit:'}{' '}
                  <span className="font-mono">{formatCurrency(convertCurrency(spendConfig.monthlyBudgetUSD, currency), currency, isAr)}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSpendCritical
                    ? 'bg-rose-700 text-white'
                    : isSpendWarning
                    ? 'bg-amber-700 text-white'
                    : 'bg-white/20 text-white'
                }`}>
                  {currentSpendRatio.toFixed(0)}%
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Decorative Grid Mesh */}
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* FinOps Sub-Navigation Bar */}
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 bg-[#F5EFF7] dark:bg-slate-800/70 rounded-2xl border border-[#DCD3DF] dark:border-slate-700/60 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('modeler')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'modeler'
              ? 'bg-white text-[#4E115A] border border-[#DCD3DF] shadow-xs font-bold'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#4E115A]" />
          <span>{isAr ? 'حاسبة التكلفة ونمذجة الموارد' : 'Resource Cost Modeler'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'catalog'
              ? 'bg-white text-[#4E115A] border border-[#DCD3DF] shadow-xs font-bold'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#4E115A]" />
          <span>{isAr ? 'كتالوج الباقات المشتقة' : 'Derived SaaS Tiers'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('management')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'management'
              ? 'bg-white text-[#4E115A] border border-[#DCD3DF] shadow-xs font-bold'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#4E115A]" />
          <span>{isAr ? 'إدارة الباقات والحدود (Admin)' : 'Plan Management & Limits'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reconciliation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'reconciliation'
              ? 'bg-white text-[#4E115A] border border-[#DCD3DF] shadow-xs font-bold'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#4E115A]" />
          <span>{isAr ? 'مطابقة فواتير المزود والتباين' : 'Provider Invoice Reconciliation'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kpis')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'kpis'
              ? 'bg-white text-[#4E115A] border border-[#DCD3DF] shadow-xs font-bold'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#4E115A]" />
          <span>{isAr ? 'مؤشرات الأداء واقتصاديات الوحدة' : 'Unit Economics & KPIs'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('forecast')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'forecast'
              ? 'bg-white text-[#4E115A] border border-[#DCD3DF] shadow-xs font-bold'
              : 'text-[#6E6A75] hover:text-[#1E1E24]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#4E115A]" />
          <span>{isAr ? 'التنبؤ بالإيرادات (MRR Forecast)' : 'Predictive Forecast'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('api')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'api'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4 text-teal-500" />
          <span>{isAr ? 'واجهات API والمواصفات التقنية' : 'FinOps APIs & Schema'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: RESOURCE COST MODELER & 15% MARGIN PRICING ENGINE       */}
      {/* ============================================================== */}
      {activeSubTab === 'modeler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Resource Sliders & Parameters */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isAr ? 'تخصيص الموارد وحساب التكلفة السحابية' : 'Configure Cloud Resources'}
                  </h2>
                </div>
                <button
                  onClick={() => setCustomResources({
                    storageHotGB: 500,
                    storageColdGB: 250,
                    monthlyEgressGB: 200,
                    monthlyIOPSIn10k: 150,
                    computeVcpuHours: 40,
                    backupRetentionDays: 45,
                    dedicatedTenancy: false,
                  })}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
                </button>
              </div>

              {/* Slider 1: Hot NVMe Storage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <HardDrive className="w-4 h-4 text-amber-500" />
                    <span>{isAr ? 'سعة التخزين النشطة (NVMe Hot Storage):' : 'Hot NVMe Storage:'}</span>
                  </div>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {customResources.storageHotGB} GB ({ (customResources.storageHotGB / 1000).toFixed(2) } TB)
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={20000}
                  step={50}
                  value={customResources.storageHotGB}
                  onChange={e => setCustomResources({ ...customResources, storageHotGB: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>50 GB</span>
                  <span>5 TB</span>
                  <span>10 TB</span>
                  <span>20 TB</span>
                </div>
              </div>

              {/* Slider 2: Cold / Archive Storage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span>{isAr ? 'سعة الأرشيف البارد (Cold / Archive Tier):' : 'Cold / Archive Tier:'}</span>
                  </div>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {customResources.storageColdGB} GB
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={50}
                  value={customResources.storageColdGB}
                  onChange={e => setCustomResources({ ...customResources, storageColdGB: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Monthly Egress Transfer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Globe className="w-4 h-4 text-sky-500" />
                    <span>{isAr ? 'حركة البيانات الخارجة (Data Egress):' : 'Monthly Egress Bandwidth:'}</span>
                  </div>
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                    {customResources.monthlyEgressGB} GB
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={5000}
                  step={25}
                  value={customResources.monthlyEgressGB}
                  onChange={e => setCustomResources({ ...customResources, monthlyEgressGB: Number(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: IOPS / S3 Requests in 10k */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Cpu className="w-4 h-4 text-teal-500" />
                    <span>{isAr ? 'طلبات وعمليات S3 IOPS (بالمضاعف 10,000):' : 'Monthly IOPS / S3 Requests (x10k):'}</span>
                  </div>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {(customResources.monthlyIOPSIn10k * 10000).toLocaleString()} reqs
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={customResources.monthlyIOPSIn10k}
                  onChange={e => setCustomResources({ ...customResources, monthlyIOPSIn10k: Number(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Slider 5: Compute vCPU Hours for Thumbnails & Hashing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Layers className="w-4 h-4 text-purple-500" />
                    <span>{isAr ? 'ساعات المعالجة والحوسبة (vCPU Hours):' : 'Compute Ingestion (vCPU-Hours):'}</span>
                  </div>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {customResources.computeVcpuHours} vCPU-h
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={customResources.computeVcpuHours}
                  onChange={e => setCustomResources({ ...customResources, computeVcpuHours: Number(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Toggle: Multi-AZ Dedicated Tenancy */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {isAr ? 'عزل البنية التحتية (Dedicated Tenancy & Multi-AZ)' : 'Dedicated Multi-AZ Tenancy'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {isAr ? 'عزل كامل للخوادم مع مفاتيح KMS خاصة ونسخ جغرافي 3-AZ' : 'Isolated compute/storage cluster with customer-owned KMS'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomResources({ ...customResources, dedicatedTenancy: !customResources.dedicatedTenancy })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    customResources.dedicatedTenancy ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      customResources.dedicatedTenancy ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Action Button: Calculate & Update Model */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    showNotification(
                      'تم احتساب تكلفة الموارد وإشتقاق هوامش الربح 15% بنجاح',
                      'Cloud resources calculated with 15% margin applied',
                      'success'
                    );
                  }}
                  className="w-full py-3 px-4 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-[#4E115A]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Calculator className="w-4 h-4 text-white" />
                  <span>{isAr ? 'احسب التكلفة وهوامش الباقة' : 'Calculate Package Costs'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Financial Waterfall & 15% Profit Margin Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isAr ? 'جدول توزيع التكاليف والربحية' : 'Financial Cost Waterfall'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/30">
                  {isAr ? 'هامش ربح إلزامي 15%' : '15% Net Margin'}
                </span>
              </div>

              {/* Section A: Direct Cloud Cost Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  {isAr ? '1. التكاليف المباشرة للبنية التحتية (Direct Infra)' : '1. Direct Infrastructure Costs'}
                </div>
                
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'تخزين كتل البيانات (Hot + Cold):' : 'Storage Blocks (Hot + Cold):'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.directStorageCost, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'حركة البيانات الخارجة (Egress):' : 'Data Transfer Egress:'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.directEgressCost, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'طلبات العمليات و IOPS:' : 'IOPS / S3 Requests:'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.directIopsCost, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'ساعات معالجة الحوسبة والنسخ:' : 'Compute & Snapshots:'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.directComputeCost + customFinancials.directBackupCost, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 bg-slate-50 dark:bg-slate-800/40 px-2 rounded-lg font-bold text-slate-800 dark:text-slate-200">
                  <span>{isAr ? 'إجمالي التكاليف المباشرة:' : 'Total Direct Cost:'}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {formatCurrency(customFinancials.totalDirectCloudCost, currency, isAr)}
                  </span>
                </div>
              </div>

              {/* Section B: Operational Platform Overheads */}
              <div className="space-y-2 text-xs pt-1">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  {isAr ? '2. التكاليف التشغيلية للمنصة (Platform Overheads)' : '2. Platform Operational Overheads'}
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'صيانة المنصة وتحديثات الـ SRE:' : 'Platform Maintenance & SRE:'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.platformMaintenanceFee, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'الدعم الفني وضمان الـ SLA (6%):' : '24/7 SLA & Support (6%):'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.supportAndSlaFee, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'تراخيص وحدات التشفير KMS والأمان:' : 'KMS & Security Licenses:'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.securityLicenseFee, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'رسوم بوابة الدفع الإلكتروني:' : 'Payment Gateway Merchant Fee:'}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.paymentProcessingFee, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 bg-slate-50 dark:bg-slate-800/40 px-2 rounded-lg font-bold text-slate-800 dark:text-slate-200">
                  <span>{isAr ? 'إجمالي التكاليف التشغيلية:' : 'Total Operational Cost:'}</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">
                    {formatCurrency(customFinancials.totalOperationalCost, currency, isAr)}
                  </span>
                </div>
              </div>

              {/* Section C: Base Cost + 15% Profit Margin */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{isAr ? 'التكلفة الأساسية الإجمالية (Direct + Ops):' : 'Total Base Cost (Direct + Ops):'}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.totalBaseCost, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-blue-200/60 dark:border-blue-800/40">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'هامش الربح الإلزامي (+15%):' : 'Mandatory Net Profit (+15%):'}</span>
                  </span>
                  <span className="font-mono text-sm">
                    +{formatCurrency(customFinancials.netProfitAmount, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold pt-1">
                  <span>{isAr ? 'السعر الصافي قبل الضريبة (Subtotal):' : 'Retail Subtotal (Pre-tax):'}</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {formatCurrency(customFinancials.retailSubtotal, currency, isAr)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>{isAr ? 'ضريبة القيمة المضافة VAT (15%):' : 'Value Added Tax (15% VAT):'}</span>
                  <span className="font-mono">
                    +{formatCurrency(customFinancials.vatAmount, currency, isAr)}
                  </span>
                </div>
              </div>

              {/* Section D: Final Client Price & CTA */}
              <div className="pt-2 text-center space-y-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-4 shadow-md">
                  <span className="text-[11px] font-medium text-blue-100 uppercase tracking-wider block">
                    {isAnnual
                      ? (isAr ? 'السعر السنوي المخفض (المعادل شهرياً)' : 'Annual Equivalent Monthly')
                      : (isAr ? 'السعر النهائي المقترح للعميل شهرياً' : 'Final Client Price (Monthly)')}
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight my-1">
                    {formatCurrency(
                      isAnnual ? customFinancials.finalPriceAnnualMonthlyEquivalent : customFinancials.finalPriceMonthly,
                      currency,
                      isAr
                    )}
                  </div>
                  {isAnnual && (
                    <span className="text-[10px] text-emerald-200 font-mono block">
                      {isAr ? `إجمالي الفاتورة السنوية: ${formatCurrency(customFinancials.annualTotalBilled, currency, isAr)} (تم تطبيق خصم 20%)` : `Total Billed Annually: ${formatCurrency(customFinancials.annualTotalBilled, currency, isAr)} (20% Savings applied)`}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleExportQuotation('Custom-Engineered-Package')}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تصدير عرض سعر رسمي معتمد (JSON / Spec)' : 'Export Official Quotation (JSON)'}</span>
                </button>
              </div>

              {/* Monthly Spend Budget Monitor Card */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className={`p-4 rounded-2xl border transition-all ${
                  isSpendCritical
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/50'
                    : isSpendWarning
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/50'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                }`}>
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <BellRing className={`w-4 h-4 ${
                        isSpendCritical ? 'text-rose-600 dark:text-rose-400 animate-bounce' : isSpendWarning ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                      }`} />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {isAr ? 'سقف الإنفاق والتنبيهات الاستباقية' : 'Monthly Spend Threshold'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSpendModalOpen(true)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>{isAr ? 'تعديل السقف' : 'Configure'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isAr ? 'الميزانية المحددة:' : 'Configured Budget:'}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(convertCurrency(spendConfig.monthlyBudgetUSD, currency), currency, isAr)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{isAr ? 'نسبة الاستهلاك المتوقع:' : 'Projected Utilization:'}</span>
                      <span className={`font-mono font-bold ${
                        isSpendCritical ? 'text-rose-600 dark:text-rose-400' : isSpendWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {currentSpendRatio.toFixed(1)}%
                      </span>
                    </div>

                    {/* Miniature Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSpendCritical ? 'bg-rose-500' : isSpendWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(currentSpendRatio, 100)}%` }}
                      />
                    </div>

                    {isSpendCritical && (
                      <div className="mt-2 text-[10px] text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{isAr ? 'تنبيه: التكلفة المتوقعة تجاوزت سقف الميزانية الشهري!' : 'Warning: Projected cost exceeds monthly budget ceiling!'}</span>
                      </div>
                    )}
                    {isSpendWarning && (
                      <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{isAr ? 'تنبيه: اقتراب استهلاك التكلفة من سقف الميزانية.' : 'Notice: Spend is approaching your threshold limit.'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DERIVED SAAS PACKAGES CATALOG                           */}
      {/* ============================================================== */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'كتالوج الباقات المشتقة المحسوبة بهامش 15%' : 'Derived SaaS Packages with 15% Margin'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'تم اشتقاق جميع الباقات وفق معادلة التكاليف المباشرة + التشغيل + هامش الربح 15% لضمان الشفافية الكاملة والاستدامة المالية.'
                  : 'Pre-computed production tiers calculated using real cloud infrastructure benchmarks and operational cost allocations.'}
              </p>
            </div>
            
            <button
              onClick={() => setPlansModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'عرض نافذة الاشتراك للعملاء' : 'View Customer Checkout Modal'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {standardPackages.map(pkg => {
              const fin = pkg.financials;
              const displayPrice = isAnnual ? fin.finalPriceAnnualMonthlyEquivalent : fin.finalPriceMonthly;

              return (
                <div
                  key={pkg.id}
                  className={`rounded-2xl p-5 bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between relative ${
                    pkg.popular
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xl'
                      : 'border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-3 rtl:left-4 ltr:right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isAr ? pkg.nameAr : pkg.nameEn}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] leading-relaxed">
                        {isAr ? pkg.taglineAr : pkg.taglineEn}
                      </p>
                    </div>

                    {/* Price Header */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {formatCurrency(displayPrice, currency, isAr)}
                        <span className="text-xs font-normal text-slate-400 font-sans">
                          /{isAr ? 'شهر' : 'mo'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                        <span>{isAr ? 'التكلفة الإجمالية:' : 'Base Cost:'} {formatCurrency(fin.totalBaseCost, currency, isAr)}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          +{formatCurrency(fin.netProfitAmount, currency, isAr)} (15%)
                        </span>
                      </div>
                    </div>

                    {/* Resource Specs Mini Table */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                        <span>{isAr ? 'سعة التخزين:' : 'Hot Storage:'}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                          {pkg.resources.storageHotGB >= 1000
                            ? `${(pkg.resources.storageHotGB / 1000).toFixed(0)} TB`
                            : `${pkg.resources.storageHotGB} GB`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                        <span>{isAr ? 'باقة السحب (Egress):' : 'Egress Limit:'}</span>
                        <span className="font-mono text-slate-900 dark:text-slate-200">
                          {pkg.resources.monthlyEgressGB} GB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                        <span>{isAr ? 'عمليات IOPS الشهري:' : 'Monthly IOPS:'}</span>
                        <span className="font-mono text-slate-900 dark:text-slate-200">
                          {(pkg.resources.monthlyIOPSIn10k * 10).toLocaleString()}k
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      {(isAr ? pkg.featuresAr : pkg.featuresEn).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Export */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <button
                      onClick={() => handleExportQuotation(isAr ? pkg.nameAr : pkg.nameEn)}
                      className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تصدير المواصفات المالية' : 'Export JSON Spec'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: SUBSCRIPTION PLANS MANAGEMENT (ADMIN PANEL)               */}
      {/* ============================================================== */}
      {activeSubTab === 'management' && (
        <PlanManagementPanel currency={currency} />
      )}

      {/* ============================================================== */}
      {/* TAB 3: PROVIDER INVOICE RECONCILIATION & VARIANCE ANALYSIS     */}
      {/* ============================================================== */}
      {activeSubTab === 'reconciliation' && (
        <BillingReconciliationModule currency={currency} embedded />
      )}

      {/* ============================================================== */}
      {/* TAB 4: UNIT ECONOMICS, SAAS KPIS & SENSITIVITY MATRIX          */}
      {/* ============================================================== */}
      {activeSubTab === 'kpis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'مؤشرات الأداء المالي واقتصاديات الوحدة (SaaS FinOps KPIs)' : 'Unit Economics & FinOps KPIs'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'مراقبة حية لصحة المنصة المالية: الإيراد الشهري، تكلفة اكتساب العميل (CAC)، القيمة الدائمة (LTV)، وهامش الربح الإجمالي.'
                  : 'Real-time observability of SaaS unit economics, capital efficiency, and customer acquisition payback velocity.'}
              </p>
            </div>
          </div>

          {/* Real-time Recharts Visualization: ARPU & CAC vs Historical Monthly Cloud Costs */}
          <FinOpsTrendChart currency={currency} isAr={isAr} />

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'الإيراد الشهري المتكرر (MRR)' : 'Monthly Recurring Revenue'}
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                ${SAMPLE_FINOPS_KPIS.mrrUSD.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                ARR: ${(SAMPLE_FINOPS_KPIS.arrUSD).toLocaleString()}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'متوسط الإيراد لكل عميل (ARPU)' : 'Average Revenue Per User'}
              </span>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                ${SAMPLE_FINOPS_KPIS.arpuUSD.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {SAMPLE_FINOPS_KPIS.totalActiveSubscribers.toLocaleString()} {isAr ? 'مشترك نشط' : 'subscribers'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'صافي هامش الربح المحقق' : 'Net Margin Rate'}
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {SAMPLE_FINOPS_KPIS.blendedNetMarginPercent.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {isAr ? 'مطابق للسياسة المحاسبية (15%)' : 'Guaranteed 15% Policy'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                {isAr ? 'نسبة القيمة إلى الاكتساب (LTV/CAC)' : 'LTV to CAC Ratio'}
              </span>
              <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
                {SAMPLE_FINOPS_KPIS.ltvToCacRatio.toFixed(1)}x
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                {isAr ? 'استرداد في 2.5 شهر فقط' : '2.5 Months Payback'}
              </span>
            </div>
          </div>

          {/* Sensitivity Analysis & Stress Test Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? 'مصفوفة تحليل الحساسية واختبار الضغط (Sensitivity & Stress Test)' : 'Cost Sensitivity & Margin Resilience Matrix'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'محاكاة لمرونة نموذج التسعير وثبات هامش الربح (15%) في حال حدوث تقلبات في تكاليف مزودي السحابة (تغير أسعار التخزين أو سحب البيانات).'
                : 'Simulating price shock impact: How package profitability preserves its mandatory 15% net profit under fluctuating cloud provider rates.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {isAr ? 'السيناريو الأول: ارتفاع التخزين +20%' : 'Scenario A: +20% Storage Price Hike'}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isAr
                    ? 'يتم تعديل التكلفة الأساسية تلقائياً ليرتفع السعر النهائي بنسبة 4.8% فقط مع المحافظة على هامش الـ 15% كاملاً.'
                    : 'Auto-adjusts base cost; final client price increments by just 4.8%, perfectly preserving 15% net profit.'}
                </p>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                  {isAr ? 'الهامش الصافي: 15.0% (محمي)' : 'Net Margin: 15.0% (Resilient)'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {isAr ? 'السيناريو الثاني: تفعيل تحالف Zero Egress' : 'Scenario B: Zero Egress Peering'}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isAr
                    ? 'ينخفض سعر الباقة للعميل بنسبة 14.2% مما يعزز التنافسية الإقليمية مع استمرار تحقيق هامش 15% الصافي.'
                    : 'Lowers package price by 14.2% for customers, increasing market competitiveness while sustaining exact 15% margin.'}
                </p>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                  {isAr ? 'توفير للعميل: 14.2%' : 'Customer Savings: 14.2%'}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {isAr ? 'السيناريو الثالث: نمو المشتركين 2x' : 'Scenario C: 2x Subscriber Scale'}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isAr
                    ? 'تنخفض التكلفة التشغيلية الثابتة لكل مستخدم من $1.20 إلى $0.65 نتيجة وفرات الحجم (Economies of Scale).'
                    : 'Fixed platform overhead per tenant dilutes from $1.20 to $0.65 via economies of scale.'}
                </p>
                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 block">
                  {isAr ? 'انخفاض العبء الثابت: 45%' : 'Fixed Overhead Reduction: 45%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: PREDICTIVE REVENUE & MRR FORECAST ENGINE                */}
      {/* ============================================================== */}
      {activeSubTab === 'forecast' && (
        <PredictiveRevenueForecast currency={currency} isAr={isAr} />
      )}

      {/* ============================================================== */}
      {/* TAB 6: REST APIS & SCHEMAS FOR FINOPS INTEGRATION             */}
      {/* ============================================================== */}
      {activeSubTab === 'api' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isAr ? 'واجهات برمجة التطبيقات والمواصفات المحاسبية (FinOps APIs)' : 'FinOps APIs & Integration Specs'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'واجهات RESTful متوافقة مع أنظمة ERP والفوترة لاستيراد فواتير السحابة وتصدير أسعار الباقات وحساب هوامش الربح برمجياً.'
                : 'RESTful endpoints to automate cloud invoice ingestion, query metered telemetry, and fetch real-time package pricing quotes.'}
            </p>
          </div>

          <div className="space-y-4">
            
            {/* API Endpoint 1: Ingest Cloud Bill */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-600 text-white">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  /api/v1/finops/invoices/reconcile
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'استيراد ومطابقة فاتورة مزود السحابة (AWS Cost & Usage Report أو GCP Billing Export) وكشف الفروقات.' : 'Ingests cloud provider CUR reports to run automated line-item variance reconciliation.'}
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                <pre>{`// Request Payload:
{
  "provider": "AWS_S3_EUROPE",
  "billingPeriod": "2026-11",
  "metered": {
    "storageHotGBMonth": 142500,
    "egressGB": 48200,
    "totalIOPS": 18400000,
    "computeHours": 4850
  },
  "billedAmountUSD": 3824.80
}`}</pre>
              </div>
            </div>

            {/* API Endpoint 2: Calculate Package Quote with 15% Margin */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-600 text-white">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  /api/v1/finops/packages/quote
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'حساب عرض سعر دقيق للباقة بناءً على الموارد المطلوبة مع تطبيق هامش الربح 15% وتضمين تكاليف المنصة.' : 'Computes an itemized quotation guaranteeing 15% profit margin with platform overhead allocation.'}
              </p>
              <div className="p-3 bg-slate-950 rounded-xl text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
                <pre>{`// Response:
{
  "currency": "SAR",
  "directCloudCostUSD": 14.28,
  "operationalOverheadUSD": 2.45,
  "totalBaseCostUSD": 16.73,
  "profitMarginPercent": 15.0,
  "netProfitUSD": 2.51,
  "retailSubtotalSAR": 72.15,
  "vat15PercentSAR": 10.82,
  "finalMonthlyPriceSAR": 82.97,
  "annualDiscountedEquivalentSAR": 66.38
}`}</pre>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Spend Thresholds & Alerts Configuration Modal */}
      <SpendThresholdModal
        isOpen={spendModalOpen}
        onClose={() => setSpendModalOpen(false)}
        currency={currency}
        projectedMonthlySpendUSD={currentProjectedMonthlyUSD}
        config={spendConfig}
        onUpdateConfig={setSpendConfig}
        alertHistory={alertHistory}
        onTriggerSimulatedSpike={handleTriggerSimulatedSpike}
        onResetSpend={handleResetSpend}
      />

    </div>
  );
};
