import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  STORED_USAGE_LOGS,
  PRESET_PROVIDER_INVOICES,
  StoredUsageLogEntry,
  UploadedProviderInvoice,
  VarianceReport,
  DiscrepancyType,
  AuditDecisionStatus,
  parseCloudProviderInvoice,
  parseStoredUsageLogsJson,
  reconcileInvoiceAgainstUsageLogs,
  buildVarianceReportCsv,
  buildDisputeNoticeText,
} from '../../utils/billingReconciliation';
import { CurrencyCode } from '../../types/finops';
import { formatCurrency } from '../../utils/finopsCalculator';
import {
  Scale,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  RefreshCw,
  Database,
  History,
  ChevronDown,
  ChevronUp,
  Flag,
  Check,
  ShieldAlert,
  TrendingDown,
  SlidersHorizontal,
  Trash2,
  Info,
  Code2,
  FileText,
  RotateCcw,
  BarChart3,
} from 'lucide-react';

interface BillingReconciliationModuleProps {
  currency?: CurrencyCode;
  embedded?: boolean;
}

const HISTORY_STORAGE_KEY = 'rawaj_billing_reconciliation_history_v1';
const USAGE_LOGS_STORAGE_KEY = 'rawaj_billing_usage_logs_v1';

export const BillingReconciliationModule: React.FC<BillingReconciliationModuleProps> = ({
  currency = 'USD',
  embedded = false,
}) => {
  const { lang, showNotification, logActivity, currentUser } = useStorage();
  const isAr = lang === 'ar';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const usageLogsInputRef = useRef<HTMLInputElement>(null);

  const [tolerancePercent, setTolerancePercent] = useState<number>(5);
  const [usageLogs, setUsageLogs] = useState<StoredUsageLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(USAGE_LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return STORED_USAGE_LOGS;
  });
  const [activeInvoice, setActiveInvoice] = useState<UploadedProviderInvoice>(
    PRESET_PROVIDER_INVOICES.aws
  );
  const [report, setReport] = useState<VarianceReport>(() =>
    reconcileInvoiceAgainstUsageLogs(PRESET_PROVIDER_INVOICES.aws, usageLogs, 5)
  );
  const [history, setHistory] = useState<VarianceReport[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [subView, setSubView] = useState<'report' | 'usage-logs' | 'history'>('report');
  const [statusFilter, setStatusFilter] = useState<'all' | 'discrepancies' | 'critical' | 'matched'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [jsonPasteOpen, setJsonPasteOpen] = useState(false);
  const [rawJsonInput, setRawJsonInput] = useState('');

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 12)));
    } catch {
      // ignore quota errors
    }
  }, [history]);

  // Persist usage logs baseline
  useEffect(() => {
    try {
      localStorage.setItem(USAGE_LOGS_STORAGE_KEY, JSON.stringify(usageLogs));
    } catch {
      // ignore quota errors
    }
  }, [usageLogs]);

  // Helper to re-run comparison while preserving existing auditor decisions
  const recomputeCurrentReport = (
    nextInvoice: UploadedProviderInvoice,
    nextLogs: StoredUsageLogEntry[],
    nextTolerance: number
  ) => {
    const updated = reconcileInvoiceAgainstUsageLogs(nextInvoice, nextLogs, nextTolerance);
    const prevDecisionMap = new Map(report.lines.map(l => [l.serviceId, l.decision]));
    updated.lines = updated.lines.map(l => ({
      ...l,
      decision:
        prevDecisionMap.get(l.serviceId) && l.discrepancyType !== 'matched'
          ? (prevDecisionMap.get(l.serviceId) as AuditDecisionStatus)
          : l.decision,
    }));
    setReport(updated);
  };

  // Re-run comparison dynamically when tolerance threshold changes
  const handleToleranceChange = (nextTolerance: number) => {
    setTolerancePercent(nextTolerance);
    recomputeCurrentReport(activeInvoice, usageLogs, nextTolerance);
  };

  const runReconciliation = (invoice: UploadedProviderInvoice, sourceLabel: string) => {
    setUploadError(null);
    setActiveInvoice(invoice);
    const nextReport = reconcileInvoiceAgainstUsageLogs(invoice, usageLogs, tolerancePercent);
    setReport(nextReport);
    setHistory(prev => [nextReport, ...prev.filter(h => h.id !== nextReport.id)].slice(0, 12));
    setSubView('report');
    setStatusFilter('all');
    setExpandedLineId(
      nextReport.lines.find(l => l.severity === 'critical')?.id ||
        nextReport.lines.find(l => l.discrepancyType !== 'matched')?.id ||
        null
    );

    logActivity({
      type: 'system',
      titleAr: `مطابقة فاتورة سحابية: ${invoice.invoiceId}`,
      titleEn: `Cloud Billing Reconciliation: ${invoice.invoiceId}`,
      descriptionAr: `تمت مقارنة فاتورة "${invoice.provider}" (${sourceLabel}) مع سجلات الاستهلاك — رُصد ${nextReport.discrepancyCount} تباينات (صافي الفرق $${nextReport.netVarianceUSD.toFixed(2)})`,
      descriptionEn: `Reconciled "${invoice.provider}" invoice (${sourceLabel}) against usage logs — ${nextReport.discrepancyCount} discrepancies detected (net variance $${nextReport.netVarianceUSD.toFixed(2)})`,
      targetName: invoice.fileName || invoice.invoiceId,
      targetType: 'system',
      ipAddress: '158.140.220.14',
      device: 'Rawaj Cloud FinOps',
      actor: currentUser?.email || 'rawajtel4@gmail.com',
      severity: nextReport.criticalCount > 0 ? 'warning' : 'success',
      metadata: {
        invoiceId: invoice.invoiceId,
        provider: invoice.provider,
        discrepancyCount: nextReport.discrepancyCount,
        netVarianceUSD: nextReport.netVarianceUSD,
      },
    });

    showNotification(
      nextReport.discrepancyCount > 0
        ? `اكتملت المطابقة: تم رصد ${nextReport.discrepancyCount} فروقات فوترة بقيمة تباين إجمالية $${nextReport.overbilledTotalUSD.toFixed(2)}`
        : `اكتملت المطابقة بنسبة توافق ${nextReport.reconciliationScorePercent}% دون فروقات جوهرية`,
      nextReport.discrepancyCount > 0
        ? `Reconciliation complete: ${nextReport.discrepancyCount} discrepancies flagged ($${nextReport.overbilledTotalUSD.toFixed(2)} potential overbill)`
        : `Reconciliation complete: ${nextReport.reconciliationScorePercent}% matched with zero critical discrepancies`,
      nextReport.criticalCount > 0 ? 'warning' : 'success'
    );
  };

  const processUploadedFile = (file: File) => {
    setUploadError(null);

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setUploadError(
        isAr
          ? 'يرجى اختيار ملف بصيغة JSON (.json) صادر من مزود السحابة.'
          : 'Please upload a valid .json invoice file exported from your cloud provider.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        isAr
          ? 'حجم الملف يتجاوز الحد المسموح (5 ميجابايت).'
          : 'File exceeds the 5 MB upload limit.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const result = parseCloudProviderInvoice(text, file.name);
      if (!result.invoice) {
        setUploadError(isAr ? result.errorAr || 'خطأ في قراءة الملف' : result.errorEn || 'Parse error');
        return;
      }
      runReconciliation(result.invoice, file.name);
    };
    reader.onerror = () => {
      setUploadError(
        isAr ? 'تعذر قراءة الملف المحدد. يرجى المحاولة مرة أخرى.' : 'Failed to read the selected file.'
      );
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleUpdateLineDecision = (lineId: string, nextDecision: AuditDecisionStatus) => {
    setReport(prev => {
      const updated: VarianceReport = {
        ...prev,
        lines: prev.lines.map(l => (l.id === lineId ? { ...l, decision: nextDecision } : l)),
      };
      setHistory(hPrev => hPrev.map(h => (h.id === updated.id ? updated : h)));
      return updated;
    });
    showNotification(
      nextDecision === 'disputed'
        ? 'تم تعليم البند كـ "نزاع فوترة مفتوح" وإدراجه في تقرير المطالبة'
        : 'تم اعتماد البند وتسويته محاسبياً',
      nextDecision === 'disputed'
        ? 'Line item flagged as Disputed for vendor credit claim'
        : 'Line item marked as Approved',
      nextDecision === 'disputed' ? 'warning' : 'success'
    );
  };

  const triggerDownload = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleTemplate = () => {
    const sampleJson = JSON.stringify(PRESET_PROVIDER_INVOICES.aws, null, 2);
    triggerDownload(sampleJson, 'sample-cloud-provider-invoice.json', 'application/json;charset=utf-8');
    showNotification(
      'تم تنزيل نموذج فاتورة مزود السحابة بصيغة JSON — يمكنك تعديل القيم وإعادة رفعه لاختبار كشف الفروقات',
      'Sample provider JSON invoice downloaded — edit values and re-upload to test discrepancy detection',
      'info'
    );
  };

  const handleExportJsonReport = () => {
    const payload = JSON.stringify(
      {
        platform: 'Rawaj Cloud — Billing Reconciliation Engine',
        report,
      },
      null,
      2
    );
    triggerDownload(payload, `Variance-Report-${report.invoiceId}.json`, 'application/json;charset=utf-8');
    showNotification(
      `تم تصدير تقرير التباين الكامل بصيغة JSON (${report.invoiceId})`,
      `Exported JSON variance report (${report.invoiceId})`,
      'success'
    );
  };

  const handleExportCsvReport = () => {
    const csv = buildVarianceReportCsv(report, isAr);
    triggerDownload(csv, `Variance-Report-${report.invoiceId}.csv`, 'text/csv;charset=utf-8');
    showNotification(
      `تم تصدير تقرير التباين بصيغة CSV متوافقة مع Excel (${report.invoiceId})`,
      `Exported Excel-ready CSV variance report (${report.invoiceId})`,
      'success'
    );
  };

  const handleExportDisputeClaim = () => {
    const noticeText = buildDisputeNoticeText(report, isAr);
    triggerDownload(
      noticeText,
      `Vendor-Dispute-Claim-${report.invoiceId}.txt`,
      'text/plain;charset=utf-8'
    );
    showNotification(
      `تم إصدار إشعار مطالبة الفوترة للمزود (${report.invoiceId})`,
      `Generated vendor billing dispute claim (${report.invoiceId})`,
      'success'
    );
  };

  const handleDisputeAllOverbilled = () => {
    setReport(prev => {
      const updated: VarianceReport = {
        ...prev,
        lines: prev.lines.map(l =>
          l.varianceUSD > 0 && l.discrepancyType !== 'matched' ? { ...l, decision: 'disputed' } : l
        ),
      };
      setHistory(hPrev => hPrev.map(h => (h.id === updated.id ? updated : h)));
      return updated;
    });
    showNotification(
      'تم تعليم جميع بنود الزيادة في الفوترة كـ "نزاع فوترة مفتوح"',
      'Flagged all overbilled line items as Disputed',
      'warning'
    );
  };

  const handleRunPastedJson = () => {
    setUploadError(null);
    const result = parseCloudProviderInvoice(rawJsonInput, 'pasted-provider-invoice.json');
    if (!result.invoice) {
      setUploadError(isAr ? result.errorAr || 'خطأ في قراءة JSON' : result.errorEn || 'Invalid JSON');
      return;
    }
    setJsonPasteOpen(false);
    runReconciliation(result.invoice, 'pasted-provider-invoice.json');
  };

  const handleUsageLogUpdate = (
    serviceId: string,
    field: 'loggedQuantity' | 'contractUnitRateUSD',
    rawValue: string
  ) => {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    const nextLogs = usageLogs.map(log => {
      if (log.serviceId !== serviceId) return log;
      const updated = { ...log, [field]: parsed };
      updated.expectedCostUSD = Number((updated.loggedQuantity * updated.contractUnitRateUSD).toFixed(2));
      return updated;
    });
    setUsageLogs(nextLogs);
    recomputeCurrentReport(activeInvoice, nextLogs, tolerancePercent);
  };

  const handleUsageLogsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const result = parseStoredUsageLogsJson(text);
      if (!result.logs) {
        showNotification(
          result.errorAr || 'تعذر قراءة ملف سجلات الاستهلاك',
          result.errorEn || 'Failed to parse usage logs JSON',
          'warning'
        );
        return;
      }
      setUsageLogs(result.logs);
      recomputeCurrentReport(activeInvoice, result.logs, tolerancePercent);
      showNotification(
        `تم تحديث مرجع سجلات الاستهلاك (${result.logs.length} خدمات) وإعادة المطابقة تلقائياً`,
        `Updated usage logs baseline (${result.logs.length} services) and re-ran reconciliation`,
        'success'
      );
    };
    reader.readAsText(file);
  };

  const handleResetUsageLogs = () => {
    setUsageLogs(STORED_USAGE_LOGS);
    recomputeCurrentReport(activeInvoice, STORED_USAGE_LOGS, tolerancePercent);
    showNotification(
      'تمت استعادة سجلات الاستهلاك الافتراضية وإعادة احتساب التباين',
      'Restored default usage logs baseline and recalculated variance',
      'info'
    );
  };

  const filteredLines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return report.lines.filter(line => {
      if (statusFilter === 'discrepancies' && line.discrepancyType === 'matched') return false;
      if (statusFilter === 'critical' && line.severity !== 'critical') return false;
      if (statusFilter === 'matched' && line.discrepancyType !== 'matched') return false;
      if (!q) return true;
      return (
        line.serviceNameAr.toLowerCase().includes(q) ||
        line.serviceNameEn.toLowerCase().includes(q) ||
        line.serviceId.toLowerCase().includes(q) ||
        line.skuCode.toLowerCase().includes(q)
      );
    });
  }, [report.lines, statusFilter, searchQuery]);

  const getDiscrepancyLabel = (type: DiscrepancyType) => {
    switch (type) {
      case 'matched':
        return { ar: 'متطابق', en: 'Matched', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900' };
      case 'overbilled_usage':
        return { ar: 'فوترة كمية زائدة', en: 'Overbilled Usage', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900' };
      case 'overbilled_rate':
        return { ar: 'تجاوز سعر الوحدة', en: 'Rate Mismatch', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900' };
      case 'unexpected_charge':
        return { ar: 'بند غير مسجل (شاذ)', en: 'Unexpected Charge', cls: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' };
      case 'underbilled_credit':
        return { ar: 'وفر / رصيد دائن', en: 'Credit / Savings', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900' };
      case 'unbilled_usage':
        return { ar: 'استهلاك غير مفوتر', en: 'Unbilled Usage', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900' };
    }
  };

  const fmtMoney = (usd: number) => {
    const absVal = Math.abs(usd);
    const formatted =
      currency === 'USD'
        ? `$${absVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : formatCurrency(absVal, currency, isAr);
    return usd < 0 ? `-${formatted}` : formatted;
  };

  const fmtSignedMoney = (usd: number) => {
    if (usd > 0) return `+${fmtMoney(usd)}`;
    return fmtMoney(usd);
  };

  const maxLineCostUSD = useMemo(
    () =>
      Math.max(
        1,
        ...report.lines.map(l => Math.max(l.expectedCostUSD, l.actualBilledUSD))
      ),
    [report.lines]
  );

  const disputedCount = useMemo(
    () => report.lines.filter(l => l.decision === 'disputed').length,
    [report.lines]
  );

  return (
    <div
      className={
        embedded
          ? 'space-y-6'
          : 'w-full flex-1 bg-white dark:bg-slate-950 p-4 sm:p-6 lg:p-8 pb-28 space-y-6 max-w-6xl mx-auto'
      }
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={usageLogsInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleUsageLogsFileChange}
        className="hidden"
      />

      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DCD3DF] dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#3B004E] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#3B004E]/20">
            <Scale className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-[#1E1E24] dark:text-white tracking-tight">
                {isAr ? 'وحدة مطابقة فواتير السحابة وكشف التباين' : 'Cloud Billing Reconciliation'}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#F5EFF7] dark:bg-purple-950/50 border border-[#DCD3DF] dark:border-purple-800 text-[11px] font-bold text-[#3B004E] dark:text-purple-200 font-mono">
                {report.invoiceId}
              </span>
            </div>
            <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1 max-w-2xl">
              {isAr
                ? 'ارفع ملفات فواتير JSON الصادرة من مزودي السحابة لمقارنتها تلقائياً بسجلات الاستهلاك الداخلية، كشف الفروقات السعرية والكمية، وتصدير تقارير التباين.'
                : 'Upload JSON invoice files from cloud providers to automatically cross-check against stored usage logs, isolate billing discrepancies, and export variance reports.'}
            </p>
          </div>
        </div>

        {/* Tolerance Threshold & Sample Template Download */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F8F4FA] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3B004E] dark:text-purple-300" />
            <span className="text-[#6E6A75] dark:text-slate-400 font-semibold">
              {isAr ? 'هامش التسامح:' : 'Tolerance:'}
            </span>
            {[2, 5, 10].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleToleranceChange(val)}
                className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[11px] transition-colors cursor-pointer ${
                  tolerancePercent === val
                    ? 'bg-[#3B004E] text-white'
                    : 'text-[#6E6A75] dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                ±{val}%
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-xs font-bold text-[#3B004E] dark:text-purple-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تنزيل نموذج JSON' : 'JSON Template'}</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone & Instant Preset Invoice Loaders */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-5 sm:p-6 transition-all ${
          isDragging
            ? 'border-[#7C3AED] bg-purple-50/70 dark:bg-purple-950/30'
            : 'border-[#DCD3DF] dark:border-slate-800 bg-[#FAF7FC] dark:bg-slate-900/60'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#3B004E] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1E1E24] dark:text-white">
                {isAr ? 'رفع ملف فاتورة مزود السحابة (JSON)' : 'Upload Cloud Provider JSON Invoice'}
              </h2>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'اسحب وأفلت ملف JSON هنا أو اختره من جهازك، أو حمّل إحدى فواتير الاختبار الجاهزة للمقارنة الفورية.'
                  : 'Drag & drop a provider .json invoice here, browse from disk, or load a sample provider invoice below.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!jsonPasteOpen && !rawJsonInput) {
                  setRawJsonInput(JSON.stringify(activeInvoice, null, 2));
                }
                setJsonPasteOpen(prev => !prev);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F5EFF7] dark:hover:bg-slate-700 text-[#3B004E] dark:text-purple-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>{isAr ? 'لصق / تحرير JSON' : 'Paste / Edit JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold shadow-md shadow-[#3B004E]/20 transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'اختيار ملف JSON' : 'Upload JSON Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Direct JSON Paste / Inspector Editor */}
        {jsonPasteOpen && (
          <div className="mt-4 pt-4 border-t border-[#DCD3DF]/70 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#1E1E24] dark:text-white">
                {isAr
                  ? 'الصق بيانات فاتورة المزود (JSON) أو عدّل بنود الفاتورة الحالية لاختبار التباين:'
                  : 'Paste raw provider invoice JSON or edit active invoice payload to test reconciliation:'}
              </span>
              <button
                type="button"
                onClick={() => setRawJsonInput(JSON.stringify(activeInvoice, null, 2))}
                className="text-[11px] font-bold text-[#6D28D9] dark:text-purple-300 hover:underline cursor-pointer"
              >
                {isAr ? 'تحميل الفاتورة الحالية' : 'Load Active JSON'}
              </button>
            </div>
            <textarea
              value={rawJsonInput}
              onChange={e => setRawJsonInput(e.target.value)}
              rows={7}
              dir="ltr"
              spellCheck={false}
              placeholder='{"invoiceId": "INV-2026-11", "provider": "AWS", "lineItems": [...]}'
              className="w-full p-3 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-[11px] text-[#1E1E24] dark:text-slate-200 focus:outline-none focus:border-[#7C3AED]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setJsonPasteOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#6E6A75] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleRunPastedJson}
                className="px-4 py-1.5 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? 'تشغيل المطابقة الآن' : 'Run Reconciliation'}
              </button>
            </div>
          </div>
        )}

        {/* Sample Provider JSON Preset Triggers */}
        <div className="mt-4 pt-3.5 border-t border-[#DCD3DF]/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'تحميل فاتورة اختبارية:' : 'Load sample invoice:'}
            </span>
            {(
              [
                { key: 'aws', label: 'AWS (Egress + Orphan NAT)' },
                { key: 'gcp', label: 'GCP (Rate Mismatch + Missing KMS)' },
                { key: 'wasabi', label: 'Wasabi (Clean 99.6% Match)' },
              ] as const
            ).map(preset => {
              const presetInvoice = PRESET_PROVIDER_INVOICES[preset.key];
              const isSelected = activeInvoice.invoiceId === presetInvoice.invoiceId;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => runReconciliation(presetInvoice, presetInvoice.fileName || preset.key)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#3B004E] text-white border-[#3B004E]'
                      : 'bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-slate-200 border-[#DCD3DF] dark:border-slate-700 hover:border-[#7C3AED]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'الملف النشط:' : 'Active file:'}{' '}
            <strong className="text-[#1E1E24] dark:text-white">{report.fileName}</strong>
          </span>
        </div>

        {/* Inline Validation Error Banner */}
        {uploadError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* 4 Executive Variance KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'التكلفة المتوقعة (سجلات الاستهلاك)' : 'Expected Cost (Usage Logs)'}
          </div>
          <div className="text-xl font-black font-mono tabular-nums text-[#1E1E24] dark:text-white mt-1.5">
            {fmtMoney(report.totalExpectedUSD)}
          </div>
          <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-1">
            {usageLogs.length} {isAr ? 'خدمات مقاسة داخلياً' : 'metered services'} · {report.billingPeriod}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'إجمالي فاتورة المزود' : 'Provider Invoice Total'}
          </div>
          <div className="text-xl font-black font-mono tabular-nums text-[#3B004E] dark:text-purple-300 mt-1.5">
            {fmtMoney(report.totalBilledUSD)}
          </div>
          <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-1 truncate">
            {report.provider}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'صافي التباين (الفرق)' : 'Net Billing Variance'}
          </div>
          <div
            className={`text-xl font-black font-mono tabular-nums mt-1.5 ${
              report.netVarianceUSD > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {fmtSignedMoney(report.netVarianceUSD)}
          </div>
          <div className="text-[11px] font-mono tabular-nums text-[#6E6A75] dark:text-slate-400 mt-1">
            {report.netVariancePercent > 0 ? '+' : ''}
            {report.netVariancePercent.toFixed(2)}% · {isAr ? 'دقة المطابقة' : 'Match Score'}{' '}
            <strong className="text-[#1E1E24] dark:text-white">{report.reconciliationScorePercent}%</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-400">
            {isAr ? 'فروقات مرصودة / مبالغ قابلة للاسترداد' : 'Discrepancies / Overbill Recovery'}
          </div>
          <div className="text-xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1.5">
            {fmtMoney(report.overbilledTotalUSD)}
          </div>
          <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {report.discrepancyCount} {isAr ? 'تباين' : 'flagged'}
            </span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {report.matchedCount} {isAr ? 'متطابق' : 'matched'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-view Tabs + Export Report Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 rounded-xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setSubView('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subView === 'report'
                ? 'bg-[#3B004E] text-white shadow-2xs'
                : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAr ? 'تقرير التباين' : 'Variance Report'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('usage-logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subView === 'usage-logs'
                ? 'bg-[#3B004E] text-white shadow-2xs'
                : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {isAr ? `سجلات الاستهلاك (${usageLogs.length})` : `Usage Logs (${usageLogs.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subView === 'history'
                ? 'bg-[#3B004E] text-white shadow-2xs'
                : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{isAr ? `السجل (${history.length})` : `History (${history.length})`}</span>
          </button>
        </div>

        {/* Report Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {report.overbilledTotalUSD > 0 && (
            <button
              type="button"
              onClick={handleExportDisputeClaim}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {isAr
                  ? `خطاب مطالبة${disputedCount > 0 ? ` (${disputedCount})` : ''}`
                  : `Dispute Claim${disputedCount > 0 ? ` (${disputedCount})` : ''}`}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCsvReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير CSV (Excel)' : 'Export CSV'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportJsonReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير تقرير JSON' : 'Export JSON'}</span>
          </button>
        </div>
      </div>

      {/* ==================== VIEW 1: VARIANCE REPORT TABLE ==================== */}
      {subView === 'report' && (
        <div className="space-y-3.5">
          {/* Visual Expected vs Billed Variance Breakdown Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#1E1E24] dark:text-white">
                <BarChart3 className="w-4 h-4 text-[#3B004E] dark:text-purple-300" />
                <span>
                  {isAr ? 'مخطط مقارنة التكلفة المتوقعة مقابل المفوترة لكل خدمة' : 'Expected vs. Billed Cost Breakdown by Service'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#6E6A75] dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-600" />
                  {isAr ? 'المتوقع (السجلات)' : 'Expected (Logs)'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#3B004E] dark:bg-purple-400" />
                  {isAr ? 'مفوتر (متطابق)' : 'Billed (OK)'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                  {isAr ? 'زيادة فوترة' : 'Overbilled'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
              {report.lines.map(line => {
                const expPct = Math.max(2, (line.expectedCostUSD / maxLineCostUSD) * 100);
                const billPct = Math.max(line.actualBilledUSD > 0 ? 2 : 0, (line.actualBilledUSD / maxLineCostUSD) * 100);
                const isOver = line.varianceUSD > 0 && line.discrepancyType !== 'matched';
                return (
                  <div key={`bar-${line.id}`} className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#1E1E24] dark:text-slate-200 truncate">
                        {isAr ? line.serviceNameAr : line.serviceNameEn}
                      </span>
                      <span
                        className={`font-mono tabular-nums font-bold shrink-0 ${
                          isOver
                            ? 'text-rose-600 dark:text-rose-400'
                            : line.varianceUSD < 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-[#6E6A75] dark:text-slate-400'
                        }`}
                      >
                        {fmtSignedMoney(line.varianceUSD)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-400/80 dark:bg-slate-500"
                          style={{ width: `${expPct}%` }}
                        />
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver
                              ? 'bg-rose-500'
                              : line.discrepancyType === 'underbilled_credit'
                              ? 'bg-emerald-500'
                              : 'bg-[#3B004E] dark:bg-purple-400'
                          }`}
                          style={{ width: `${billPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter, Bulk Dispute & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', ar: `الكل (${report.lines.length})`, en: `All (${report.lines.length})` },
                  {
                    id: 'discrepancies',
                    ar: `التباينات فقط (${report.discrepancyCount})`,
                    en: `Discrepancies (${report.discrepancyCount})`,
                  },
                  {
                    id: 'critical',
                    ar: `حرج (${report.criticalCount})`,
                    en: `Critical (${report.criticalCount})`,
                  },
                  {
                    id: 'matched',
                    ar: `متطابق (${report.matchedCount})`,
                    en: `Matched (${report.matchedCount})`,
                  },
                ] as const
              ).map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-[#3B004E] text-white border-[#3B004E]'
                      : 'bg-white dark:bg-slate-900 text-[#6E6A75] dark:text-slate-300 border-[#DCD3DF] dark:border-slate-800 hover:border-[#7C3AED]'
                  }`}
                >
                  {isAr ? f.ar : f.en}
                </button>
              ))}

              {report.overbilledTotalUSD > 0 && (
                <button
                  type="button"
                  onClick={handleDisputeAllOverbilled}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>{isAr ? 'اعتراض على كل الزيادات' : 'Flag All Overbilled'}</span>
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالخدمة أو SKU...' : 'Filter by service or SKU...'}
                className="w-full rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-1.5 rounded-xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          {/* Discrepancy Comparison Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F8F4FA] dark:bg-slate-800/60 text-[#6E6A75] dark:text-slate-400 font-mono">
                    <th className="py-3 px-4 font-bold">{isAr ? 'الخدمة السحابية / SKU' : 'Cloud Service / SKU'}</th>
                    <th className="py-3 px-3 font-bold">{isAr ? 'الاستهلاك (مسجل / مفوتر)' : 'Usage (Logged / Billed)'}</th>
                    <th className="py-3 px-3 font-bold text-right rtl:text-left">{isAr ? 'المتوقع' : 'Expected'}</th>
                    <th className="py-3 px-3 font-bold text-right rtl:text-left">{isAr ? 'المفوتر' : 'Billed'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isAr ? 'التباين' : 'Variance'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isAr ? 'التصنيف' : 'Classification'}</th>
                    <th className="py-3 px-4 font-bold text-center">{isAr ? 'إجراء المراجع' : 'Audit Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD3DF]/60 dark:divide-slate-800/70">
                  {filteredLines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-[#6E6A75] dark:text-slate-400">
                        {isAr ? 'لا توجد بنود مطابقة لعوامل التصفية الحالية.' : 'No line items match the current filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLines.map(line => {
                      const badge = getDiscrepancyLabel(line.discrepancyType);
                      const isExpanded = expandedLineId === line.id;
                      const isPositiveOverbill = line.varianceUSD > 0 && line.discrepancyType !== 'matched';

                      return (
                        <React.Fragment key={line.id}>
                          <tr
                            onClick={() => setExpandedLineId(isExpanded ? null : line.id)}
                            className={`transition-colors cursor-pointer ${
                              isExpanded
                                ? 'bg-[#F8F4FA]/90 dark:bg-purple-950/20'
                                : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {line.severity === 'critical' ? (
                                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                                ) : line.severity === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                ) : line.severity === 'info' ? (
                                  <TrendingDown className="w-4 h-4 text-sky-500 shrink-0" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-[#1E1E24] dark:text-white truncate max-w-[230px]">
                                    {isAr ? line.serviceNameAr : line.serviceNameEn}
                                  </div>
                                  <div className="text-[10px] font-mono text-[#6E6A75] dark:text-slate-400">
                                    {line.skuCode} · {line.region}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 font-mono tabular-nums text-[11px]">
                              <div className="text-[#6E6A75] dark:text-slate-400">
                                {isAr ? 'مسجل:' : 'Log:'}{' '}
                                <span className="font-bold text-[#1E1E24] dark:text-slate-200">
                                  {line.loggedQuantity.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-[#6E6A75] dark:text-slate-400">
                                {isAr ? 'مفوتر:' : 'Inv:'}{' '}
                                <span
                                  className={`font-bold ${
                                    Math.abs(line.quantityVariancePercent) > tolerancePercent
                                      ? 'text-rose-600 dark:text-rose-400'
                                      : 'text-[#1E1E24] dark:text-slate-200'
                                  }`}
                                >
                                  {line.billedQuantity.toLocaleString()}
                                </span>{' '}
                                <span className="text-[10px] opacity-75">{line.unit}</span>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right rtl:text-left font-mono tabular-nums text-[#6E6A75] dark:text-slate-300">
                              {fmtMoney(line.expectedCostUSD)}
                            </td>

                            <td className="py-3 px-3 text-right rtl:text-left font-mono tabular-nums font-bold text-[#1E1E24] dark:text-white">
                              {fmtMoney(line.actualBilledUSD)}
                            </td>

                            <td className="py-3 px-3 text-center font-mono tabular-nums">
                              <div
                                className={`font-black ${
                                  isPositiveOverbill
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : line.varianceUSD < 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-[#6E6A75] dark:text-slate-400'
                                }`}
                              >
                                {fmtSignedMoney(line.varianceUSD)}
                              </div>
                              <div className="text-[10px] text-[#6E6A75] dark:text-slate-400">
                                {line.variancePercent > 0 ? '+' : ''}
                                {line.variancePercent.toFixed(1)}%
                              </div>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${badge.cls}`}
                              >
                                {isAr ? badge.ar : badge.en}
                              </span>
                            </td>

                            <td
                              className="py-3 px-4 text-center"
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1.5">
                                {line.discrepancyType !== 'matched' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLineDecision(line.id, 'disputed')}
                                      title={isAr ? 'فتح نزاع فوترة' : 'Flag billing dispute'}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                        line.decision === 'disputed'
                                          ? 'bg-rose-600 text-white border-rose-600'
                                          : 'bg-white dark:bg-slate-800 text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50'
                                      }`}
                                    >
                                      <Flag className="w-3 h-3" />
                                      <span>{isAr ? 'اعتراض' : 'Dispute'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLineDecision(line.id, 'approved')}
                                      title={isAr ? 'اعتماد البند' : 'Approve line item'}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                        line.decision === 'approved'
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-white dark:bg-slate-800 text-emerald-700 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50'
                                      }`}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>{isAr ? 'اعتماد' : 'Approve'}</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{isAr ? 'معتمد' : 'Verified'}</span>
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setExpandedLineId(isExpanded ? null : line.id)}
                                  aria-label={isAr ? 'تفاصيل البند' : 'Toggle details'}
                                  className="p-1 text-slate-400 hover:text-[#3B004E] dark:hover:text-white cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Forensic Audit Row */}
                          {isExpanded && (
                            <tr className="bg-[#FAF7FC] dark:bg-slate-900/90">
                              <td colSpan={7} className="px-4 py-3.5 border-t border-[#DCD3DF]/50 dark:border-slate-800">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-[#DCD3DF]/70 dark:border-slate-700 space-y-1">
                                    <div className="font-bold text-[#6E6A75] dark:text-slate-400">
                                      {isAr ? 'مقارنة سعر الوحدة' : 'Unit Rate Comparison'}
                                    </div>
                                    <div className="flex items-center justify-between font-mono tabular-nums">
                                      <span>{isAr ? 'سعر العقد:' : 'Contract Rate:'}</span>
                                      <strong className="text-[#1E1E24] dark:text-white">
                                        ${line.contractUnitRateUSD.toFixed(4)}
                                      </strong>
                                    </div>
                                    <div className="flex items-center justify-between font-mono tabular-nums">
                                      <span>{isAr ? 'السعر المفوتر:' : 'Billed Rate:'}</span>
                                      <strong
                                        className={
                                          line.billedUnitRateUSD > line.contractUnitRateUSD
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-emerald-600 dark:text-emerald-400'
                                        }
                                      >
                                        ${line.billedUnitRateUSD.toFixed(4)}
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="md:col-span-2 p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-[#DCD3DF]/70 dark:border-slate-700 flex items-start gap-2.5">
                                    <Info className="w-4 h-4 text-[#3B004E] dark:text-purple-300 shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-bold text-[#1E1E24] dark:text-white mb-0.5">
                                        {isAr ? 'تحليل التباين والتوصية المحاسبية' : 'Forensic Analysis & FinOps Action'}
                                      </div>
                                      <p className="text-[#6E6A75] dark:text-slate-300 leading-relaxed">
                                        {isAr ? line.recommendationAr : line.recommendationEn}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 2: STORED USAGE LOGS BASELINE (EDITABLE) ==================== */}
      {subView === 'usage-logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F8F4FA] dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-[#1E1E24] dark:text-white block">
                {isAr
                  ? 'سجلات الاستهلاك الداخلية المخزنة (المرجع المعتمد للمقارنة)'
                  : 'Stored Internal Usage Telemetry Logs (Editable Audit Baseline)'}
              </span>
              <span className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                {isAr
                  ? 'عدّل الكميات أو أسعار العقد مباشرة لتحديث تقرير التباين فورياً، أو ارفع ملف JSON لسجلات استهلاك مخصصة.'
                  : 'Adjust metered quantities or contract unit rates inline to recalculate variance live, or import custom usage logs JSON.'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => usageLogsInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#3B004E] dark:text-purple-200 font-bold text-[11px] hover:bg-[#F5EFF7] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'استيراد سجلات JSON' : 'Import Logs JSON'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetUsageLogs}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 text-[#6E6A75] dark:text-slate-300 font-bold text-[11px] hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'استعادة الافتراضي' : 'Reset Default'}</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#DCD3DF] dark:border-slate-800 text-[#6E6A75] dark:text-slate-400 font-mono">
                  <th className="py-3 px-4 font-bold">{isAr ? 'الخدمة / SKU' : 'Service / SKU'}</th>
                  <th className="py-3 px-3 font-bold">{isAr ? 'مصدر القياس' : 'Telemetry Source'}</th>
                  <th className="py-3 px-3 font-bold text-right rtl:text-left">{isAr ? 'الكمية المسجلة' : 'Logged Quantity'}</th>
                  <th className="py-3 px-3 font-bold text-right rtl:text-left">{isAr ? 'سعر العقد (USD)' : 'Contract Rate (USD)'}</th>
                  <th className="py-3 px-4 font-bold text-right rtl:text-left">{isAr ? 'التكلفة المتوقعة' : 'Expected Cost'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD3DF]/60 dark:divide-slate-800">
                {usageLogs.map(log => (
                  <tr key={log.serviceId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#1E1E24] dark:text-white">
                        {isAr ? log.serviceNameAr : log.serviceNameEn}
                      </div>
                      <div className="text-[10px] font-mono text-[#6E6A75] dark:text-slate-400">
                        {log.serviceId} · {log.skuCode} · {log.region}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#6E6A75] dark:text-slate-400">{log.sourceSystem}</td>
                    <td className="py-3 px-3 text-right rtl:text-left font-mono tabular-nums">
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={log.loggedQuantity}
                          onChange={e => handleUsageLogUpdate(log.serviceId, 'loggedQuantity', e.target.value)}
                          className="w-24 px-2 py-1 rounded-lg border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-right font-mono font-bold text-[#1E1E24] dark:text-white text-xs focus:outline-none focus:border-[#7C3AED]"
                        />
                        <span className="text-[10px] text-slate-400">{log.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right rtl:text-left font-mono tabular-nums">
                      <input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={log.contractUnitRateUSD}
                        onChange={e => handleUsageLogUpdate(log.serviceId, 'contractUnitRateUSD', e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-right font-mono text-[#1E1E24] dark:text-white text-xs focus:outline-none focus:border-[#7C3AED]"
                      />
                    </td>
                    <td className="py-3 px-4 text-right rtl:text-left font-mono tabular-nums font-black text-[#3B004E] dark:text-purple-300">
                      {fmtMoney(log.expectedCostUSD)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== VIEW 3: RECONCILIATION RUN HISTORY ==================== */}
      {subView === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F8F4FA] dark:bg-slate-800/50 flex items-center justify-between text-xs">
            <span className="font-bold text-[#1E1E24] dark:text-white">
              {isAr ? 'سجل عمليات المطابقة السابقة' : 'Saved Reconciliation Audit Runs'}
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="inline-flex items-center gap-1 text-rose-600 hover:underline font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'مسح السجل' : 'Clear History'}</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6E6A75] dark:text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 mx-auto opacity-40" />
              <p>
                {isAr
                  ? 'لم يتم حفظ عمليات مطابقة بعد. ارفع ملف JSON أو اختر فاتورة اختبارية لبدء السجل.'
                  : 'No saved reconciliation runs yet. Upload a JSON invoice or load a preset to record a run.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DCD3DF]/60 dark:divide-slate-800">
              {history.map(item => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-[#1E1E24] dark:text-white">
                        {item.provider}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5EFF7] dark:bg-slate-800 text-[#3B004E] dark:text-purple-300 font-bold">
                        {item.invoiceId}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono tabular-nums">
                      {item.fileName} · {new Date(item.generatedAt).toLocaleString(isAr ? 'ar-SA' : 'en-US')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right rtl:text-left font-mono tabular-nums text-xs">
                      <div
                        className={`font-black ${
                          item.netVarianceUSD > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                        }`}
                      >
                        {fmtSignedMoney(item.netVarianceUSD)}
                      </div>
                      <div className="text-[10px] text-[#6E6A75] dark:text-slate-400">
                        {item.discrepancyCount} {isAr ? 'تباينات' : 'discrepancies'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReport(item);
                        setTolerancePercent(item.tolerancePercent);
                        setSubView('report');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isAr ? 'عرض التقرير' : 'Open Report'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
