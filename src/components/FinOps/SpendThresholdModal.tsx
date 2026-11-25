import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  CurrencyCode,
  CURRENCY_RATES,
  SpendThresholdConfig,
  SpendAlertHistoryItem,
  PackageFinancialBreakdown,
} from '../../types/finops';
import { convertCurrency, formatCurrency } from '../../utils/finopsCalculator';
import {
  Bell,
  BellRing,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Sliders,
  Mail,
  Zap,
  TrendingUp,
  Percent,
  RefreshCw,
  Info,
  Lock,
  ArrowRight,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface SpendThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  projectedMonthlySpendUSD: number;
  config: SpendThresholdConfig;
  onUpdateConfig: (newConfig: SpendThresholdConfig) => void;
  alertHistory: SpendAlertHistoryItem[];
  onTriggerSimulatedSpike: () => void;
  onResetSpend: () => void;
}

export const SpendThresholdModal: React.FC<SpendThresholdModalProps> = ({
  isOpen,
  onClose,
  currency,
  projectedMonthlySpendUSD,
  config,
  onUpdateConfig,
  alertHistory,
  onTriggerSimulatedSpike,
  onResetSpend,
}) => {
  const { lang, showNotification } = useStorage();
  const isAr = lang === 'ar';

  // Local form state
  const [enabled, setEnabled] = useState(config.enabled);
  const [budgetUSD, setBudgetUSD] = useState(config.monthlyBudgetUSD);
  const [warningPercent, setWarningPercent] = useState(config.warningThresholdPercent);
  const [criticalPercent, setCriticalPercent] = useState(config.criticalThresholdPercent);
  const [notifyToast, setNotifyToast] = useState(config.notifyViaToast);
  const [notifyEmail, setNotifyEmail] = useState(config.notifyViaEmail);
  const [notifyWebhook, setNotifyWebhook] = useState(config.notifyViaWebhook);
  const [emailRecipient, setEmailRecipient] = useState(config.alertEmailRecipient);
  const [autoCap, setAutoCap] = useState(config.autoCapAtThreshold);

  if (!isOpen) return null;

  // Conversion helpers
  const budgetInSelectedCurrency = convertCurrency(budgetUSD, currency);
  const projectedInSelectedCurrency = convertCurrency(projectedMonthlySpendUSD, currency);
  const spendRatioPercent = budgetUSD > 0 ? (projectedMonthlySpendUSD / budgetUSD) * 100 : 0;

  // Warning and Critical USD values
  const warningUSD = (budgetUSD * warningPercent) / 100;
  const criticalUSD = (budgetUSD * criticalPercent) / 100;

  // Status check
  const isCritical = spendRatioPercent >= criticalPercent;
  const isWarning = spendRatioPercent >= warningPercent && !isCritical;
  const isNormal = !isWarning && !isCritical;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SpendThresholdConfig = {
      ...config,
      enabled,
      monthlyBudgetUSD: Number(budgetUSD),
      warningThresholdPercent: Number(warningPercent),
      criticalThresholdPercent: Number(criticalPercent),
      notifyViaToast: notifyToast,
      notifyViaEmail: notifyEmail,
      notifyViaWebhook: notifyWebhook,
      alertEmailRecipient: emailRecipient.trim(),
      autoCapAtThreshold: autoCap,
    };
    onUpdateConfig(updated);
    showNotification(
      `تم حفظ سقف الميزانية الشهري ($${Number(budgetUSD).toFixed(2)}) وإعدادات التنبيهات بنجاح`,
      `Monthly spend budget ($${Number(budgetUSD).toFixed(2)}) and alert rules saved`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-xs">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isAr ? 'إعدادات سقف الإنفاق الشهري والتنبيهات الاستباقية' : 'Monthly Spend Thresholds & Proactive Alerts'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'تعيين ميزانية سحابية قصوى وإرسال إشعارات فورية عند اقتراب التكلفة المتوقعة من الحدود'
                  : 'Define custom spend ceilings and receive real-time alerts as projected costs approach limits'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Live Progress Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? 'حالة الاستهلاك الشهري المتوقع:' : 'Current Projected Spend Status:'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : isWarning
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {isCritical
                    ? (isAr ? '⚠️ حرج: تم تجاوز السقف!' : 'Critical: Budget Exceeded!')
                    : isWarning
                    ? (isAr ? '⚡ تنبيه: اقتراب من الحد' : 'Warning: Approaching Limit')
                    : (isAr ? '✓ ضمن الحدود الآمنة' : 'Healthy: Within Budget')}
                </span>
              </div>

              <div className="text-right rtl:text-left font-mono">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatCurrency(projectedInSelectedCurrency, currency, isAr)}
                </span>
                <span className="text-slate-400 text-[10px] mx-1">/</span>
                <span className="text-slate-500 font-semibold">
                  {formatCurrency(budgetInSelectedCurrency, currency, isAr)}
                </span>
              </div>
            </div>

            {/* Visual Multi-Segment Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isCritical
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(spendRatioPercent, 100)}%` }}
                />
                {/* Warning marker tick */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-600/80 dark:bg-amber-400"
                  style={{ left: `${warningPercent}%` }}
                  title={`Warning at ${warningPercent}%`}
                />
                {/* Critical marker tick */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-600 dark:bg-rose-400"
                  style={{ left: `${criticalPercent}%` }}
                  title={`Critical at ${criticalPercent}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>0%</span>
                <span className="text-amber-500 font-semibold">{warningPercent}% {isAr ? '(إنذار مبكر)' : '(Warning)'}</span>
                <span className="text-rose-500 font-semibold">{criticalPercent}% {isAr ? '(الحد الحرج)' : '(Critical)'}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{spendRatioPercent.toFixed(1)}%</span>
              </div>
            </div>

            {/* Simulation Triggers */}
            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">
                {isAr ? 'محاكاة اختبار التنبيه:' : 'Test Alert Scenarios:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onTriggerSimulatedSpike}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                >
                  {isAr ? '⚡ محاكاة قفزة استهلاك مفاجئة' : 'Simulate Traffic Spike'}
                </button>
                <button
                  type="button"
                  onClick={onResetSpend}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  {isAr ? 'إعادة ضبط' : 'Reset'}
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Form Controls */}
          <div className="space-y-4">
            
            {/* Enable Alert Toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {isAr ? 'تفعيل نظام مراقبة الميزانية والتنبيهات' : 'Enable Spend Budget Monitoring & Alerts'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {isAr ? 'إرسال إشعارات استباقية عندما تتجاوز التكاليف المتوقعة النسب المحددة' : 'Trigger automated notifications when spend approaches thresholds'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setEnabled(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded-md"
              />
            </label>

            {/* Custom Monthly Budget USD Input */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'سقف الميزانية الشهرية القصوى (Monthly Budget Ceiling)' : 'Monthly Budget Ceiling ($ USD)'}</span>
                </label>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {formatCurrency(budgetInSelectedCurrency, currency, isAr)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="relative">
                  <span className="absolute top-2.5 rtl:right-3 ltr:left-3 font-mono text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    value={budgetUSD}
                    onChange={e => setBudgetUSD(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full rtl:pr-8 ltr:pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Quick Budget Presets */}
                <div className="flex items-center gap-1.5">
                  {[20, 40, 100, 250, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setBudgetUSD(val)}
                      className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold border transition-all cursor-pointer ${
                        budgetUSD === val
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Threshold Percentages Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Warning Threshold */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>{isAr ? 'عتبة الإنذار المبكر (Warning)' : 'Early Warning Threshold'}</span>
                  </label>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                    {warningPercent}% (${warningUSD.toFixed(1)})
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={warningPercent}
                  onChange={e => setWarningPercent(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[10px] text-amber-800 dark:text-amber-400">
                  {isAr
                    ? `إشعار تحذيري عندما يصل الإنفاق إلى ${warningPercent}% من الميزانية`
                    : `Triggers warning when projected cost reaches ${warningPercent}%`}
                </div>
              </div>

              {/* Critical Threshold */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>{isAr ? 'عتبة الخطر الحرج (Critical)' : 'Critical Limit Threshold'}</span>
                  </label>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                    {criticalPercent}% (${criticalUSD.toFixed(1)})
                  </span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="120"
                  step="5"
                  value={criticalPercent}
                  onChange={e => setCriticalPercent(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="text-[10px] text-rose-800 dark:text-rose-400">
                  {isAr
                    ? `إشعار طوارئ عند وصول أو تجاوز الإنفاق ${criticalPercent}% من الميزانية`
                    : `Triggers emergency alert when projected spend hits ${criticalPercent}%`}
                </div>
              </div>

            </div>

            {/* Notification Channels */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>{isAr ? 'قنوات استلام التنبيهات الفورية' : 'Notification Delivery Channels'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyToast}
                    onChange={e => setNotifyToast(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {isAr ? 'إشعارات الواجهة' : 'In-App Toast'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'تنبيه فوري داخل التطبيق' : 'Real-time UI alerts'}
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {isAr ? 'البريد الإلكتروني' : 'Email Dispatch'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'تقرير وموجز للتنبيه' : 'FinOps summary'}
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCap}
                    onChange={e => setAutoCap(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded-sm"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-500" />
                      <span>{isAr ? 'حماية السقف' : 'Cost Guardrail'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isAr ? 'إيقاف التوسع التلقائي' : 'Cap burst scaling'}
                    </div>
                  </div>
                </label>
              </div>

              {notifyEmail && (
                <div className="pt-2">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    {isAr ? 'البريد الإلكتروني المستلم للتنبيهات:' : 'Alert Recipient Email:'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute top-2.5 rtl:right-3 ltr:left-3 text-slate-400" />
                    <input
                      type="email"
                      value={emailRecipient}
                      onChange={e => setEmailRecipient(e.target.value)}
                      placeholder="finops-alerts@rawajcloud.com"
                      className="w-full rtl:pr-9 ltr:pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alert Event History Log */}
            {alertHistory.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{isAr ? 'سجل التنبيهات المفعّلة حديثاً' : 'Recent Spend Alert Events'}</span>
                  <span className="text-[10px] font-mono text-slate-400">{alertHistory.length} events</span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {alertHistory.map(evt => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        {evt.type === 'critical' ? (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {isAr ? evt.messageAr : evt.messageEn}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {evt.timestamp} • {evt.thresholdPercent}% reached
                          </div>
                        </div>
                      </div>

                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        ${evt.projectedSpendUSD.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-[#6E6A75] dark:text-slate-400 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-semibold cursor-pointer border border-[#DCD3DF]"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#4E115A] hover:bg-[#3d0d46] text-white font-bold shadow-md shadow-[#4E115A]/20 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isAr ? 'حفظ إعدادات السقف والتنبيهات' : 'Save Threshold Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
