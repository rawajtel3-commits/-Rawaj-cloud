import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Bell,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const MySubscriptionsView: React.FC = () => {
  const {
    lang,
    subscriptions,
    cancelSubscription,
    renewSubscription,
    toggleAutoRenew,
    openPaymentGateway,
    setActiveTab,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const [cancelModalSubId, setCancelModalSubId] = useState<string | null>(null);
  const [activeInvoiceForModal, setActiveInvoiceForModal] = useState<any | null>(null);

  const activeSub = subscriptions[0];

  const handleDownloadInvoice = (inv: any) => {
    // Generate a downloadable HTML/text invoice receipt
    const invoiceContent = `=====================================================
               RAWAJ CLOUD - OFFICIAL INVOICE
=====================================================
Invoice Number: ${inv.invoiceNumber}
Date: ${inv.date}
Billing Period: ${inv.billingPeriod}
Customer: rawajtel4@gmail.com
Status: ${inv.status.toUpperCase()}
Amount: $${inv.amountUSD.toFixed(2)} USD
Payment Method: ${inv.paymentMethod}
VAT / Tax: 0.00% (Zero Tax B2B / SaaS)
Platform: Rawaj Cloud Enterprise Secure Storage
SHA-256 Signature: 88f912c4b01a2c3d4e5f60718293a4b5c6d7e8f9
=====================================================
Thank you for trusting Rawaj Cloud for your storage.
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${inv.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(
      `تم تنزيل إيصال الفاتورة "${inv.invoiceNumber}" بنجاح`,
      `Downloaded receipt for invoice "${inv.invoiceNumber}"`,
      'success'
    );
  };

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 pb-28 space-y-6 sm:space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCD3DF] dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#4E115A] dark:text-purple-300 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>{isAr ? 'إدارة الاشتراكات والفوترة' : 'Subscriptions & Billing Management'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E1E24] dark:text-white tracking-tight">
            {isAr ? 'اشتراكاتي وحالة الدفع' : 'My Subscriptions & Invoices'}
          </h1>
          <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1">
            {isAr
              ? 'متابعة تفاصيل خطتك النشطة، مواعيد التجديد التلقائي، وتحميل سجل الفواتير الرسمية'
              : 'Review your active subscription plan, renewal schedule, and invoice history'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('available-plans')}
            className="px-4 py-2 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
            <span>{isAr ? 'استعراض الباقات المتاحة' : 'Explore All Plans'}</span>
          </button>
        </div>
      </div>

      {/* Renewal Notification Alert */}
      {activeSub && activeSub.status === 'active' && (
        <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-purple-950/30 border border-[#DCD3DF] dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4E115A] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#1E1E24] dark:text-white block">
                {isAr ? 'تنبيه دورة الفوترة القادمة' : 'Upcoming Renewal Notice'}
              </span>
              <span className="text-[#6E6A75] dark:text-slate-400">
                {isAr
                  ? `سيتم تجديد اشتراك "${activeSub.planNameAr}" تلقائياً بتاريخ ${formatDate(activeSub.nextRenewalDate, true)} بمبلغ $${activeSub.priceUSD.toFixed(2)}.`
                  : `Your "${activeSub.planNameEn}" plan will renew automatically on ${formatDate(activeSub.nextRenewalDate, false)} for $${activeSub.priceUSD.toFixed(2)}.`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleAutoRenew(activeSub.id)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white font-bold text-xs hover:border-[#4E115A] transition-colors cursor-pointer"
            >
              {activeSub.autoRenew ? (isAr ? 'إيقاف التجديد التلقائي' : 'Pause Auto-Renew') : (isAr ? 'تفعيل التجديد التلقائي' : 'Enable Auto-Renew')}
            </button>
          </div>
        </div>
      )}

      {/* Active Subscriptions List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#1E1E24] dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-[#4E115A]" />
          <span>{isAr ? 'الاشتراكات النشطة' : 'Active Subscriptions'}</span>
        </h2>

        {subscriptions.map(sub => {
          const isActive = sub.status === 'active';

          return (
            <div
              key={sub.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-sm space-y-5"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCD3DF]/60 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                    <CreditCard className="w-6 h-6 text-[#A38540]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-[#1E1E24] dark:text-white">
                        {isAr ? sub.planNameAr : sub.planNameEn}
                      </h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#1AD062]/10 text-[#1AD062] border border-[#1AD062]/30'
                          : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400'
                      }`}>
                        {isActive ? (isAr ? 'نشط ومدفوع' : 'Active & Paid') : (isAr ? 'ملغى' : 'Canceled')}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5 font-mono">
                      {isAr ? 'معرف الاشتراك:' : 'Subscription ID:'} {sub.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <div className="text-right rtl:text-left">
                    <span className="text-xl sm:text-2xl font-black text-[#1E1E24] dark:text-white">
                      ${sub.priceUSD}
                    </span>
                    <span className="text-xs text-[#6E6A75] dark:text-slate-400">
                      / {sub.billingCycle === 'annual' ? (isAr ? 'سنوياً' : 'year') : (isAr ? 'شهرياً' : 'month')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-[#F5EFF7]/60 dark:bg-slate-800/40 border border-[#DCD3DF]/50">
                  <span className="text-[#6E6A75] dark:text-slate-400 block text-[11px]">
                    {isAr ? 'طريقة الدفع المسجلة' : 'Payment Method'}
                  </span>
                  <span className="font-bold text-[#1E1E24] dark:text-white block mt-1">
                    {sub.paymentMethodDetails}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5EFF7]/60 dark:bg-slate-800/40 border border-[#DCD3DF]/50">
                  <span className="text-[#6E6A75] dark:text-slate-400 block text-[11px]">
                    {isAr ? 'تاريخ بدء الاشتراك' : 'Start Date'}
                  </span>
                  <span className="font-bold text-[#1E1E24] dark:text-white block mt-1 font-mono">
                    {formatDate(sub.startDate, isAr)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5EFF7]/60 dark:bg-slate-800/40 border border-[#DCD3DF]/50">
                  <span className="text-[#6E6A75] dark:text-slate-400 block text-[11px]">
                    {isAr ? 'موعد التجديد القادم' : 'Next Renewal Date'}
                  </span>
                  <span className="font-bold text-[#4E115A] dark:text-purple-300 block mt-1 font-mono">
                    {formatDate(sub.nextRenewalDate, isAr)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5EFF7]/60 dark:bg-slate-800/40 border border-[#DCD3DF]/50">
                  <span className="text-[#6E6A75] dark:text-slate-400 block text-[11px]">
                    {isAr ? 'التجديد التلقائي' : 'Auto-Renew Status'}
                  </span>
                  <span className={`font-bold block mt-1 ${sub.autoRenew ? 'text-[#1AD062]' : 'text-amber-600 dark:text-amber-400'}`}>
                    {sub.autoRenew ? (isAr ? 'مفعل (تجديد آلي)' : 'Enabled') : (isAr ? 'متوقف مؤقتاً' : 'Paused')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => renewSubscription(sub.id)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white font-bold text-xs hover:border-[#4E115A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1AD062]" />
                    <span>{isAr ? 'تجديد فوري الآن' : 'Instant Renew'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openPaymentGateway()}
                    className="px-4 py-2 rounded-xl bg-[#F5EFF7] dark:bg-purple-950/40 border border-[#DCD3DF] dark:border-purple-800 text-[#4E115A] dark:text-purple-300 font-bold text-xs hover:bg-[#4E115A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
                    <span>{isAr ? 'ترقية إلى خطة أعلى' : 'Upgrade Plan'}</span>
                  </button>
                </div>

                {isActive && (
                  <button
                    type="button"
                    onClick={() => setCancelModalSubId(sub.id)}
                    className="px-3.5 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isAr ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Invoices History Table */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1E1E24] dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-[#A38540]" />
            <span>{isAr ? 'سجل الفواتير والدفعات السابقة' : 'Billing & Invoice History'}</span>
          </h2>
          <span className="text-xs text-[#6E6A75] font-mono">
            {activeSub ? activeSub.invoices.length : 0} {isAr ? 'فواتير' : 'invoices'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#DCD3DF] dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/70 dark:bg-slate-800/50 text-[#6E6A75] dark:text-slate-400 font-mono">
                  <th className="py-3 px-4 font-semibold">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
                  <th className="py-3 px-4 font-semibold">{isAr ? 'تاريخ الدفع' : 'Payment Date'}</th>
                  <th className="py-3 px-4 font-semibold">{isAr ? 'الفترة' : 'Billing Period'}</th>
                  <th className="py-3 px-4 font-semibold">{isAr ? 'طريقة الدفع' : 'Method'}</th>
                  <th className="py-3 px-4 font-semibold">{isAr ? 'المبلغ' : 'Amount'}</th>
                  <th className="py-3 px-4 font-semibold text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 font-semibold text-center">{isAr ? 'الإيصال' : 'Receipt'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD3DF]/60 dark:divide-slate-800/80">
                {activeSub && activeSub.invoices.map(inv => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[#F5EFF7]/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#1E1E24] dark:text-white font-mono">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-[#6E6A75] dark:text-slate-400 font-mono">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4 text-[#1E1E24] dark:text-slate-300">
                      {inv.billingPeriod}
                    </td>
                    <td className="py-3 px-4 text-[#6E6A75] dark:text-slate-400">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1E1E24] dark:text-white font-mono">
                      ${inv.amountUSD.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1AD062]/10 text-[#1AD062] border border-[#1AD062]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isAr ? 'مدفوعة' : 'Paid'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(inv)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-[#4E115A] dark:text-purple-300 bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 hover:border-[#4E115A] transition-all shadow-2xs cursor-pointer"
                        title={isAr ? 'تحميل إيصال الفاتورة بصيغة نصية رسمية' : 'Download Invoice Receipt'}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isAr ? 'تحميل' : 'Download'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'تأكيد إلغاء التجديد التلقائي' : 'Confirm Subscription Cancellation'}
                </h3>
                <p className="text-xs text-[#6E6A75] dark:text-slate-400">
                  {isAr ? 'هل أنت متأكد من رغبتك في إيقاف التجديد؟' : 'Are you sure you want to stop auto-renew?'}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6E6A75] dark:text-slate-300 leading-relaxed bg-[#F5EFF7] dark:bg-slate-800/60 p-3 rounded-2xl border border-[#DCD3DF]/60">
              {isAr
                ? 'عند الإلغاء، ستظل مساحتك التخزينية وسائر الميزات السحابية مفعلة بالكامل حتى نهاية الفترة الحالية (15 يناير 2027) ولن يتم خصم أي مبالغ جديدة.'
                : 'Your cloud storage and features will remain active until the end of the current billing cycle without further charges.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalSubId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6E6A75] dark:text-slate-400 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 border border-[#DCD3DF] transition-colors cursor-pointer"
              >
                {isAr ? 'تراجع' : 'Keep Subscription'}
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelSubscription(cancelModalSubId);
                  setCancelModalSubId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#B91C1C] hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                {isAr ? 'تأكيد إيقاف التجديد' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
