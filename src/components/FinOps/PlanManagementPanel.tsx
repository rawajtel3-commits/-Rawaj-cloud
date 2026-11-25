import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { PlanTier, TieredPricingRule } from '../../types/storage';
import { CurrencyCode, CURRENCY_RATES } from '../../types/finops';
import { convertCurrency, formatCurrency } from '../../utils/finopsCalculator';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Save,
  Sliders,
  DollarSign,
  HardDrive,
  Cpu,
  Wifi,
  Activity,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Percent,
  TrendingDown,
  Info,
} from 'lucide-react';

interface PlanManagementPanelProps {
  currency: CurrencyCode;
}

export const PlanManagementPanel: React.FC<PlanManagementPanelProps> = ({ currency }) => {
  const {
    lang,
    allPlans,
    createPlan,
    updatePlan,
    togglePlanAvailability,
    deletePlan,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';

  // Modal / Form state for Create & Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form fields
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formStorageGB, setFormStorageGB] = useState<number>(250);
  const [formPriceMonthlyUSD, setFormPriceMonthlyUSD] = useState<number>(4.99);
  const [formPriceAnnualUSD, setFormPriceAnnualUSD] = useState<number>(49.99);
  const [formMaxFileSizeGB, setFormMaxFileSizeGB] = useState<number>(50);
  const [formVersionRetentionDays, setFormVersionRetentionDays] = useState<number>(30);
  const [formVaultEnabled, setFormVaultEnabled] = useState<boolean>(true);
  const [formFamilyMembers, setFormFamilyMembers] = useState<number>(1);
  const [formBadgeAr, setFormBadgeAr] = useState<string>('');
  const [formBadgeEn, setFormBadgeEn] = useState<string>('');
  const [formIsPopular, setFormIsPopular] = useState<boolean>(false);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Extended Resource Limits
  const [formBandwidthEgressGB, setFormBandwidthEgressGB] = useState<number>(500);
  const [formIopsLimitMonthly, setFormIopsLimitMonthly] = useState<number>(100000);
  const [formComputeHoursLimit, setFormComputeHoursLimit] = useState<number>(50);
  const [formBackupSnapshots, setFormBackupSnapshots] = useState<number>(10);
  const [formOverageStorageUSD, setFormOverageStorageUSD] = useState<number>(0.015);
  const [formOverageEgressUSD, setFormOverageEgressUSD] = useState<number>(0.02);

  // Features list
  const [formFeaturesArText, setFormFeaturesArText] = useState<string>('');
  const [formFeaturesEnText, setFormFeaturesEnText] = useState<string>('');

  // Tiered Pricing Rules
  const [hasTieredPricing, setHasTieredPricing] = useState<boolean>(false);
  const [tieredRules, setTieredRules] = useState<TieredPricingRule[]>([
    { minStorageGB: 0, maxStorageGB: 500, unitPricePerGBUSD: 0.008, tierNameAr: 'الشريحة الأولى (0 - 500 GB)', tierNameEn: 'Tier 1 (0 - 500 GB)' },
    { minStorageGB: 501, maxStorageGB: 5000, unitPricePerGBUSD: 0.0065, tierNameAr: 'الشريحة الثانية (500GB - 5TB)', tierNameEn: 'Tier 2 (500GB - 5TB)' },
    { minStorageGB: 5001, unitPricePerGBUSD: 0.0045, tierNameAr: 'الشريحة الكبرى (> 5TB)', tierNameEn: 'Tier 3 (Enterprise > 5TB)' },
  ]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPlanId(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormStorageGB(500);
    setFormPriceMonthlyUSD(5.99);
    setFormPriceAnnualUSD(59.99);
    setFormMaxFileSizeGB(100);
    setFormVersionRetentionDays(60);
    setFormVaultEnabled(true);
    setFormFamilyMembers(3);
    setFormBadgeAr('جديد');
    setFormBadgeEn('New');
    setFormIsPopular(false);
    setFormIsActive(true);
    setFormBandwidthEgressGB(1000);
    setFormIopsLimitMonthly(250000);
    setFormComputeHoursLimit(80);
    setFormBackupSnapshots(15);
    setFormOverageStorageUSD(0.014);
    setFormOverageEgressUSD(0.016);
    setFormFeaturesArText(
      'مساحة تخزينية سريعة NVMe\nالخزنة المشفرة كلياً Zero-Knowledge\nدعم فني مخصص وضمان متانة 99.9%'
    );
    setFormFeaturesEnText(
      'High-speed NVMe Storage\nZero-Knowledge Encrypted Vault\nPriority 24/7 SLA Support'
    );
    setHasTieredPricing(false);
    setModalOpen(true);
  };

  // Open Edit Modal with Pre-filled Data
  const handleOpenEditModal = (plan: PlanTier) => {
    setEditingPlanId(plan.id);
    setFormNameAr(plan.nameAr);
    setFormNameEn(plan.nameEn);
    setFormStorageGB(plan.storageGB);
    setFormPriceMonthlyUSD(plan.priceMonthlyUSD);
    setFormPriceAnnualUSD(plan.priceAnnualUSD);
    setFormMaxFileSizeGB(plan.maxFileSizeGB);
    setFormVersionRetentionDays(plan.versionRetentionDays);
    setFormVaultEnabled(plan.vaultEnabled);
    setFormFamilyMembers(plan.familyMembers);
    setFormBadgeAr(plan.badgeAr || '');
    setFormBadgeEn(plan.badgeEn || '');
    setFormIsPopular(!!plan.isPopular);
    setFormIsActive(plan.isActive !== false);

    setFormBandwidthEgressGB(plan.bandwidthEgressGB || (plan.storageGB * 2));
    setFormIopsLimitMonthly(plan.iopsLimitMonthly || 100000);
    setFormComputeHoursLimit(plan.computeHoursLimit || 40);
    setFormBackupSnapshots(plan.backupRetentionSnapshots || 10);
    setFormOverageStorageUSD(plan.overageStoragePerGBUSD || 0.015);
    setFormOverageEgressUSD(plan.overageEgressPerGBUSD || 0.02);

    setFormFeaturesArText(plan.featuresAr.join('\n'));
    setFormFeaturesEnText(plan.featuresEn.join('\n'));

    if (plan.tieredPricingRules && plan.tieredPricingRules.length > 0) {
      setHasTieredPricing(true);
      setTieredRules(plan.tieredPricingRules);
    } else {
      setHasTieredPricing(false);
    }

    setModalOpen(true);
  };

  // Save Plan (Create or Update)
  const handleSubmitPlanForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNameAr.trim() || !formNameEn.trim()) {
      showNotification(
        'يرجى إدخال اسم الباقة باللغتين العربية والإنجليزية',
        'Please provide plan name in both Arabic and English',
        'warning'
      );
      return;
    }

    const featuresAr = formFeaturesArText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    const featuresEn = formFeaturesEnText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const planPayload: Partial<PlanTier> = {
      nameAr: formNameAr.trim(),
      nameEn: formNameEn.trim(),
      storageGB: Number(formStorageGB),
      priceMonthlyUSD: Number(formPriceMonthlyUSD),
      priceAnnualUSD: Number(formPriceAnnualUSD),
      maxFileSizeGB: Number(formMaxFileSizeGB),
      versionRetentionDays: Number(formVersionRetentionDays),
      vaultEnabled: formVaultEnabled,
      familyMembers: Number(formFamilyMembers),
      badgeAr: formBadgeAr.trim() || undefined,
      badgeEn: formBadgeEn.trim() || undefined,
      isPopular: formIsPopular,
      isActive: formIsActive,
      bandwidthEgressGB: Number(formBandwidthEgressGB),
      iopsLimitMonthly: Number(formIopsLimitMonthly),
      computeHoursLimit: Number(formComputeHoursLimit),
      backupRetentionSnapshots: Number(formBackupSnapshots),
      overageStoragePerGBUSD: Number(formOverageStorageUSD),
      overageEgressPerGBUSD: Number(formOverageEgressUSD),
      featuresAr: featuresAr.length ? featuresAr : ['مساحة تخزين سحابية آمنة وموثوقة'],
      featuresEn: featuresEn.length ? featuresEn : ['Secure and high-durability cloud storage'],
      tieredPricingRules: hasTieredPricing ? tieredRules : undefined,
    };

    if (editingPlanId) {
      updatePlan(editingPlanId, planPayload);
    } else {
      createPlan({
        ...planPayload,
        storageGB: Number(formStorageGB),
        priceMonthlyUSD: Number(formPriceMonthlyUSD),
        priceAnnualUSD: Number(formPriceAnnualUSD),
        maxFileSizeGB: Number(formMaxFileSizeGB),
        versionRetentionDays: Number(formVersionRetentionDays),
        vaultEnabled: formVaultEnabled,
        familyMembers: Number(formFamilyMembers),
        featuresAr: planPayload.featuresAr!,
        featuresEn: planPayload.featuresEn!,
      } as PlanTier);
    }

    setModalOpen(false);
  };

  // Add rule to tiered pricing
  const handleAddTieredRule = () => {
    const lastRule = tieredRules[tieredRules.length - 1];
    const newMin = lastRule ? (lastRule.maxStorageGB ? lastRule.maxStorageGB + 1 : 10000) : 0;
    setTieredRules([
      ...tieredRules,
      {
        minStorageGB: newMin,
        maxStorageGB: newMin + 5000,
        unitPricePerGBUSD: 0.005,
        tierNameAr: `شريحة إضافية (${newMin} GB)`,
        tierNameEn: `Volume Tier (${newMin} GB)`,
      },
    ]);
  };

  // Update rule in tiered pricing
  const handleUpdateTieredRule = (index: number, updates: Partial<TieredPricingRule>) => {
    setTieredRules(prev =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  // Remove rule
  const handleRemoveTieredRule = (index: number) => {
    setTieredRules(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {isAr ? 'لوحة إدارة باقات الاشتراكات السحابية' : 'SaaS Subscription Plans Management'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'إدارة متكاملة لتعريف الباقات، تحديث حدود الموارد، تفعيل/تعطيل الإتاحة، وتطبيق قواعد التسعير المتدرج (Tiered Pricing Rules)'
                  : 'Define, update, toggle availability, set resource limits, and configure tiered pricing rules'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء باقة جديدة' : 'Define New Plan'}</span>
        </button>
      </div>

      {/* Grid of Admin Plan Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {allPlans.map(plan => {
          const isCore = ['free', 'personal', 'pro'].includes(plan.id);
          const isActive = plan.isActive !== false;

          const monthlyFormatted = formatCurrency(
            convertCurrency(plan.priceMonthlyUSD, currency),
            currency,
            isAr
          );
          const annualFormatted = formatCurrency(
            convertCurrency(plan.priceAnnualUSD, currency),
            currency,
            isAr
          );

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all relative ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700 opacity-75'
              }`}
            >
              {/* Card Top: Badges & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isActive
                        ? isAr ? 'متاحة للعملاء' : 'Active / Public'
                        : isAr ? 'معطلة (غير متاحة)' : 'Unavailable'}
                    </span>

                    {plan.badgeAr && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                        {isAr ? plan.badgeAr : plan.badgeEn}
                      </span>
                    )}

                    {isCore && (
                      <span className="text-[9px] font-mono text-slate-400">
                        {isAr ? 'نظامية' : 'Core'}
                      </span>
                    )}
                  </div>

                  {/* Toggle Availability Switch */}
                  <button
                    onClick={() => togglePlanAvailability(plan.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'border-slate-300 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800'
                    }`}
                    title={isActive ? (isAr ? 'إيقاف إتاحة الباقة' : 'Make Unavailable') : (isAr ? 'تفعيل إتاحة الباقة' : 'Make Active')}
                  >
                    {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                {/* Plan Names & Storage */}
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? plan.nameAr : plan.nameEn}
                </h3>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  ID: {plan.id}
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {monthlyFormatted}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isAr ? '/شهرياً' : '/mo'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isAr ? 'السنوي:' : 'Annual:'} <span className="font-semibold text-slate-700 dark:text-slate-300">{annualFormatted}</span>
                  </div>
                </div>

                {/* Resource Limits Summary */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                      <span>{isAr ? 'حصة التخزين:' : 'Storage Quota:'}</span>
                    </span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {plan.storageGB >= 1000 ? `${plan.storageGB / 1000} TB` : `${plan.storageGB} GB`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-teal-500" />
                      <span>{isAr ? 'نقل البيانات (Egress):' : 'Egress Limit:'}</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {plan.bandwidthEgressGB ? `${plan.bandwidthEgressGB} GB` : 'Unmetered'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? 'سقف العمليات (IOPS):' : 'IOPS Monthly:'}</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {plan.iopsLimitMonthly ? `${(plan.iopsLimitMonthly / 1000).toFixed(0)}k req` : 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-500" />
                      <span>{isAr ? 'ساعات المعالجة:' : 'Compute Limit:'}</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {plan.computeHoursLimit ? `${plan.computeHoursLimit} vCPU-hrs` : 'Shared'}
                    </span>
                  </div>

                  {plan.tieredPricingRules && plan.tieredPricingRules.length > 0 && (
                    <div className="mt-2 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold">
                        <TrendingDown className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{isAr ? 'تسعير متدرج مفعل' : 'Tiered Pricing Active'}</span>
                      </span>
                      <span className="font-mono font-bold">
                        {plan.tieredPricingRules.length} {isAr ? 'شرائح' : 'tiers'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit / Delete */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(plan)}
                  className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isAr ? 'تعديل المعايير' : 'Edit Specs'}</span>
                </button>

                {!isCore && (
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title={isAr ? 'حذف الباقة' : 'Delete Plan'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Define or Edit Plan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-xs">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingPlanId
                    ? (isAr ? `تعديل باقة: ${formNameAr || editingPlanId}` : `Edit Plan: ${formNameEn || editingPlanId}`)
                    : (isAr ? 'تعريف باقة اشتراك سحابية جديدة' : 'Define New Cloud Subscription Plan')}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitPlanForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>{isAr ? '1. البيانات الأساسية للباقة' : '1. Plan Identity'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'اسم الباقة بالعربية:' : 'Plan Name (Arabic):'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: باقة الشركات الناشئة المتقدمة"
                      value={formNameAr}
                      onChange={e => setFormNameAr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'اسم الباقة بالإنجليزية:' : 'Plan Name (English):'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Growth Scale Tier 1TB"
                      value={formNameEn}
                      onChange={e => setFormNameEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'شارة الباقة (عربي - اختياري):' : 'Badge Label (Arabic):'}
                    </label>
                    <input
                      type="text"
                      placeholder="الأكثر مبيعاً"
                      value={formBadgeAr}
                      onChange={e => setFormBadgeAr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'شارة الباقة (إنجليزي - اختياري):' : 'Badge Label (English):'}
                    </label>
                    <input
                      type="text"
                      placeholder="Best Value"
                      value={formBadgeEn}
                      onChange={e => setFormBadgeEn(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={e => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'إتاحة الباقة في كتالوج الاشتراك للجمهور' : 'Plan is Active & Available to Users'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsPopular}
                      onChange={e => setFormIsPopular(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded-sm"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'تمييز كباقة مفضلة (Featured / Most Popular)' : 'Highlight as Featured / Most Popular'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Section 2: Pricing & Billing */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? '2. التسعير والدورات الفوترية (بالدولار الأمريكي USD)' : '2. Pricing & Billing'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'السعر الشهري ($ USD/شهر):' : 'Monthly Price ($ USD):'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formPriceMonthlyUSD}
                      onChange={e => setFormPriceMonthlyUSD(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'السعر السنوي ($ USD/سنة - عادة بخصم ~20%):' : 'Annual Price ($ USD):'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formPriceAnnualUSD}
                      onChange={e => setFormPriceAnnualUSD(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Resource Limits */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-blue-500" />
                  <span>{isAr ? '3. حدود الموارد السحابية (Resource Limits)' : '3. Resource Limits & Quotas'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'حصة التخزين (GB):' : 'Storage Quota (GB):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formStorageGB}
                      onChange={e => setFormStorageGB(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'سقف حجم الملف المفرد (GB):' : 'Max Single File (GB):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formMaxFileSizeGB}
                      onChange={e => setFormMaxFileSizeGB(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'حد حركة النقل الخارجة (GB):' : 'Egress Limit (GB):'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formBandwidthEgressGB}
                      onChange={e => setFormBandwidthEgressGB(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'سقف عمليات القراءة والكتابة (IOPS):' : 'Monthly IOPS Limit:'}
                    </label>
                    <input
                      type="number"
                      step="5000"
                      min="10000"
                      value={formIopsLimitMonthly}
                      onChange={e => setFormIopsLimitMonthly(parseInt(e.target.value) || 10000)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'ساعات المعالجة (vCPU-Hours):' : 'Compute Limit (vCPU-hrs):'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formComputeHoursLimit}
                      onChange={e => setFormComputeHoursLimit(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'تاريخ استرجاع النسخ (أيام):' : 'Version Retention (Days):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formVersionRetentionDays}
                      onChange={e => setFormVersionRetentionDays(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'تسعير الاستهلاك الزائد للتخزين ($/GB):' : 'Storage Overage Rate ($/GB):'}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formOverageStorageUSD}
                      onChange={e => setFormOverageStorageUSD(parseFloat(e.target.value) || 0.015)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'تسعير الاستهلاك الزائد للنقل ($/GB):' : 'Egress Overage Rate ($/GB):'}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formOverageEgressUSD}
                      onChange={e => setFormOverageEgressUSD(parseFloat(e.target.value) || 0.02)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Tiered Pricing Rules (قواعد التسعير المتدرج) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-indigo-500" />
                    <span>{isAr ? '4. قواعد التسعير المتدرج (Tiered Pricing Rules)' : '4. Tiered Pricing Rules'}</span>
                  </h4>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={hasTieredPricing}
                      onChange={e => setHasTieredPricing(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-sm"
                    />
                    <span>{isAr ? 'تفعيل خصومات الحجم المتدرجة' : 'Enable Tiered Pricing'}</span>
                  </label>
                </div>

                {hasTieredPricing ? (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40">
                    <p className="text-[11px] text-indigo-900 dark:text-indigo-300">
                      {isAr
                        ? 'تتيح قواعد التسعير المتدرج تخفيض سعر وحدة الجيجابايت مع زيادة سعة التخزين المستهلكة (Volume Discounts) وفق النموذج المحاسبي.'
                        : 'Define lower per-GB unit pricing as consumer storage volume crosses graduated capacity thresholds.'}
                    </p>

                    <div className="space-y-2">
                      {tieredRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-2"
                        >
                          <div className="flex-1 min-w-[120px]">
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {isAr ? 'اسم الشريحة:' : 'Tier Name:'}
                            </span>
                            <input
                              type="text"
                              value={isAr ? rule.tierNameAr : rule.tierNameEn}
                              onChange={e =>
                                handleUpdateTieredRule(idx, {
                                  tierNameAr: e.target.value,
                                  tierNameEn: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-[11px]"
                            />
                          </div>

                          <div className="w-24">
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {isAr ? 'الحد الأدنى (GB):' : 'Min GB:'}
                            </span>
                            <input
                              type="number"
                              value={rule.minStorageGB}
                              onChange={e =>
                                handleUpdateTieredRule(idx, {
                                  minStorageGB: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[11px]"
                            />
                          </div>

                          <div className="w-24">
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {isAr ? 'الحد الأعلى (GB):' : 'Max GB:'}
                            </span>
                            <input
                              type="number"
                              placeholder="∞"
                              value={rule.maxStorageGB !== undefined ? rule.maxStorageGB : ''}
                              onChange={e =>
                                handleUpdateTieredRule(idx, {
                                  maxStorageGB: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[11px]"
                            />
                          </div>

                          <div className="w-28">
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {isAr ? 'سعر الوحدة ($/GB):' : 'Price $/GB:'}
                            </span>
                            <input
                              type="number"
                              step="0.0005"
                              value={rule.unitPricePerGBUSD}
                              onChange={e =>
                                handleUpdateTieredRule(idx, {
                                  unitPricePerGBUSD: parseFloat(e.target.value) || 0.005,
                                })
                              }
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[11px]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveTieredRule(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg self-end"
                            title={isAr ? 'حذف الشريحة' : 'Remove Tier'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTieredRule}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة شريحة متدرجة جديدة' : 'Add Tiered Step'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                    {isAr
                      ? 'الباقة تستخدم التسعير الشهري/السنوي الثابت القياسي دون خصومات حجم متدرجة.'
                      : 'Standard flat pricing is used without graduated volume tiered discounts.'}
                  </div>
                )}
              </div>

              {/* Section 5: Features List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  <span>{isAr ? '5. ميزات الباقة المعروضة للعميل (سطر لكل ميزة)' : '5. Marketing & Feature Bullets'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'الميزات بالعربية:' : 'Features (Arabic):'}
                    </label>
                    <textarea
                      rows={4}
                      value={formFeaturesArText}
                      onChange={e => setFormFeaturesArText(e.target.value)}
                      placeholder="سطر لكل ميزة..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      {isAr ? 'الميزات بالإنجليزية:' : 'Features (English):'}
                    </label>
                    <textarea
                      rows={4}
                      value={formFeaturesEnText}
                      onChange={e => setFormFeaturesEnText(e.target.value)}
                      placeholder="One feature per line..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-[#6E6A75] dark:text-slate-400 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-semibold cursor-pointer border border-[#DCD3DF]"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#4E115A] hover:bg-[#3d0d46] text-white font-bold shadow-md shadow-[#4E115A]/20 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>
                    {editingPlanId
                      ? (isAr ? 'حفظ التعديلات وتحديث الباقة' : 'Save Changes')
                      : (isAr ? 'نشر الباقة الجديدة' : 'Publish Plan')}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
