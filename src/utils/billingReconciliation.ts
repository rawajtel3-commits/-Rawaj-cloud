export type CloudServiceCategory =
  | 'storage'
  | 'egress'
  | 'iops'
  | 'compute'
  | 'backup'
  | 'license'
  | 'network'
  | 'other';

export interface StoredUsageLogEntry {
  serviceId: string;
  skuCode: string;
  serviceNameAr: string;
  serviceNameEn: string;
  category: CloudServiceCategory;
  region: string;
  billingPeriod: string;
  unit: string;
  loggedQuantity: number;
  contractUnitRateUSD: number;
  expectedCostUSD: number;
  sourceSystem: string;
}

export interface UploadedInvoiceLineItem {
  serviceId: string;
  skuCode?: string;
  serviceName: string;
  category?: CloudServiceCategory;
  region?: string;
  unit?: string;
  billedQuantity: number;
  unitRateUSD: number;
  billedAmountUSD: number;
}

export interface UploadedProviderInvoice {
  invoiceId: string;
  provider: string;
  billingPeriod: string;
  currency: string;
  issuedAt: string;
  accountId?: string;
  fileName?: string;
  lineItems: UploadedInvoiceLineItem[];
}

export type DiscrepancyType =
  | 'matched'
  | 'overbilled_usage'
  | 'overbilled_rate'
  | 'unexpected_charge'
  | 'underbilled_credit'
  | 'unbilled_usage';

export type DiscrepancySeverity = 'none' | 'info' | 'warning' | 'critical';

export type AuditDecisionStatus = 'pending' | 'approved' | 'disputed';

export interface ReconciliationLineResult {
  id: string;
  serviceId: string;
  skuCode: string;
  serviceNameAr: string;
  serviceNameEn: string;
  category: CloudServiceCategory;
  region: string;
  unit: string;
  loggedQuantity: number;
  billedQuantity: number;
  quantityVariance: number;
  quantityVariancePercent: number;
  contractUnitRateUSD: number;
  billedUnitRateUSD: number;
  expectedCostUSD: number;
  actualBilledUSD: number;
  varianceUSD: number;
  variancePercent: number;
  discrepancyType: DiscrepancyType;
  severity: DiscrepancySeverity;
  recommendationAr: string;
  recommendationEn: string;
  decision: AuditDecisionStatus;
}

export interface VarianceReport {
  id: string;
  generatedAt: string;
  invoiceId: string;
  provider: string;
  billingPeriod: string;
  fileName: string;
  tolerancePercent: number;
  totalExpectedUSD: number;
  totalBilledUSD: number;
  netVarianceUSD: number;
  netVariancePercent: number;
  overbilledTotalUSD: number;
  underbilledTotalUSD: number;
  matchedCount: number;
  discrepancyCount: number;
  criticalCount: number;
  reconciliationScorePercent: number;
  lines: ReconciliationLineResult[];
}

export const STORED_USAGE_LOGS: StoredUsageLogEntry[] = [
  {
    serviceId: 's3-hot',
    skuCode: 'AWS-S3-STD-ME1',
    serviceNameAr: 'تخزين الكتل السريع (S3 Standard NVMe)',
    serviceNameEn: 'S3 Standard NVMe Hot Storage',
    category: 'storage',
    region: 'me-central-1',
    billingPeriod: '2026-11',
    unit: 'GB-Month',
    loggedQuantity: 142500,
    contractUnitRateUSD: 0.015,
    expectedCostUSD: 2137.5,
    sourceSystem: 'Rawaj Metering Collector v4',
  },
  {
    serviceId: 's3-cold',
    skuCode: 'AWS-S3-GLACIER-ME1',
    serviceNameAr: 'التخزين الأرشيفي البارد (Cold Archive Tier)',
    serviceNameEn: 'Cold Archive Object Storage',
    category: 'storage',
    region: 'me-central-1',
    billingPeriod: '2026-11',
    unit: 'GB-Month',
    loggedQuantity: 68000,
    contractUnitRateUSD: 0.004,
    expectedCostUSD: 272.0,
    sourceSystem: 'Rawaj Metering Collector v4',
  },
  {
    serviceId: 's3-egress',
    skuCode: 'NET-EGRESS-PUB-ME1',
    serviceNameAr: 'حركة البيانات الخارجة (Internet Data Egress)',
    serviceNameEn: 'Public Internet Data Transfer Egress',
    category: 'egress',
    region: 'me-central-1',
    billingPeriod: '2026-11',
    unit: 'GB',
    loggedQuantity: 48200,
    contractUnitRateUSD: 0.015,
    expectedCostUSD: 723.0,
    sourceSystem: 'Edge NetFlow Telemetry',
  },
  {
    serviceId: 'iops-api',
    skuCode: 'S3-API-REQ-10K',
    serviceNameAr: 'طلبات واجهة التخزين (PUT/GET/LIST API)',
    serviceNameEn: 'S3 API Requests & Micro-Operations',
    category: 'iops',
    region: 'me-central-1',
    billingPeriod: '2026-11',
    unit: '10k Requests',
    loggedQuantity: 18400,
    contractUnitRateUSD: 0.004,
    expectedCostUSD: 73.6,
    sourceSystem: 'API Gateway Prometheus',
  },
  {
    serviceId: 'compute-workers',
    skuCode: 'CMP-WORKER-VCPU',
    serviceNameAr: 'عقد معالجة الوسائط والتشفير (Ingestion Workers)',
    serviceNameEn: 'Media Processing & Hashing Workers',
    category: 'compute',
    region: 'me-central-1',
    billingPeriod: '2026-11',
    unit: 'vCPU-Hours',
    loggedQuantity: 4850,
    contractUnitRateUSD: 0.038,
    expectedCostUSD: 184.3,
    sourceSystem: 'Kubernetes Metrics Server',
  },
  {
    serviceId: 'multi-az-repl',
    skuCode: 'REPL-3AZ-SYNC',
    serviceNameAr: 'النسخ الاحتياطي الجغرافي (3-AZ Replication)',
    serviceNameEn: 'Cross-AZ Multi-Zone Replication',
    category: 'backup',
    region: 'me-central-1',
    billingPeriod: '2026-11',
    unit: 'GB-Synced',
    loggedQuantity: 106876,
    contractUnitRateUSD: 0.005,
    expectedCostUSD: 534.38,
    sourceSystem: 'Storage Replication Daemon',
  },
  {
    serviceId: 'kms-security',
    skuCode: 'SEC-HSM-CMK',
    serviceNameAr: 'مفاتيح التشفير العتادي (HSM / KMS Master Keys)',
    serviceNameEn: 'Hardware Security Module & KMS Keys',
    category: 'license',
    region: 'me-central-1',
    billingPeriod: '2026-11',
    unit: 'Key-Month',
    loggedQuantity: 12,
    contractUnitRateUSD: 10.0,
    expectedCostUSD: 120.0,
    sourceSystem: 'Vault KMS Audit Ledger',
  },
];

export const PRESET_PROVIDER_INVOICES: Record<'aws' | 'gcp' | 'wasabi', UploadedProviderInvoice> = {
  aws: {
    invoiceId: 'AWS-INV-2026-11-88412',
    provider: 'Amazon Web Services (AWS)',
    billingPeriod: '2026-11',
    currency: 'USD',
    issuedAt: '2026-11-25T09:00:00Z',
    accountId: 'aws-acct-726689610028',
    fileName: 'aws-2026-11-invoice.json',
    lineItems: [
      {
        serviceId: 's3-hot',
        skuCode: 'AWS-S3-STD-ME1',
        serviceName: 'S3 Standard NVMe Hot Storage',
        category: 'storage',
        region: 'me-central-1',
        unit: 'GB-Month',
        billedQuantity: 141200,
        unitRateUSD: 0.015,
        billedAmountUSD: 2118.0,
      },
      {
        serviceId: 's3-cold',
        skuCode: 'AWS-S3-GLACIER-ME1',
        serviceName: 'Cold Archive Object Storage',
        category: 'storage',
        region: 'me-central-1',
        unit: 'GB-Month',
        billedQuantity: 68000,
        unitRateUSD: 0.004,
        billedAmountUSD: 272.0,
      },
      {
        serviceId: 's3-egress',
        skuCode: 'NET-EGRESS-PUB-ME1',
        serviceName: 'Public Internet Data Transfer Egress',
        category: 'egress',
        region: 'me-central-1',
        unit: 'GB',
        billedQuantity: 60150,
        unitRateUSD: 0.015,
        billedAmountUSD: 902.25,
      },
      {
        serviceId: 'iops-api',
        skuCode: 'S3-API-REQ-10K',
        serviceName: 'S3 API Requests & Micro-Operations',
        category: 'iops',
        region: 'me-central-1',
        unit: '10k Requests',
        billedQuantity: 13100,
        unitRateUSD: 0.004,
        billedAmountUSD: 52.4,
      },
      {
        serviceId: 'compute-workers',
        skuCode: 'CMP-WORKER-VCPU',
        serviceName: 'Media Processing & Hashing Workers',
        category: 'compute',
        region: 'me-central-1',
        unit: 'vCPU-Hours',
        billedQuantity: 4720,
        unitRateUSD: 0.038,
        billedAmountUSD: 179.36,
      },
      {
        serviceId: 'multi-az-repl',
        skuCode: 'REPL-3AZ-SYNC',
        serviceName: 'Cross-AZ Multi-Zone Replication',
        category: 'backup',
        region: 'me-central-1',
        unit: 'GB-Synced',
        billedQuantity: 105820,
        unitRateUSD: 0.005,
        billedAmountUSD: 529.1,
      },
      {
        serviceId: 'kms-security',
        skuCode: 'SEC-HSM-CMK',
        serviceName: 'Hardware Security Module & KMS Keys',
        category: 'license',
        region: 'me-central-1',
        unit: 'Key-Month',
        billedQuantity: 12,
        unitRateUSD: 10.0,
        billedAmountUSD: 120.0,
      },
      {
        serviceId: 'orphan-nat-gw',
        skuCode: 'AWS-NAT-GW-IDLE',
        serviceName: 'Unallocated NAT Gateway Staging Hours',
        category: 'network',
        region: 'eu-west-2',
        unit: 'Hours',
        billedQuantity: 720,
        unitRateUSD: 0.22,
        billedAmountUSD: 158.4,
      },
    ],
  },
  gcp: {
    invoiceId: 'GCP-BILL-2026-11-40918',
    provider: 'Google Cloud Platform (GCP)',
    billingPeriod: '2026-11',
    currency: 'USD',
    issuedAt: '2026-11-25T11:30:00Z',
    accountId: 'gcp-billing-01F4A9-8821',
    fileName: 'gcp-2026-11-invoice.json',
    lineItems: [
      {
        serviceId: 's3-hot',
        skuCode: 'AWS-S3-STD-ME1',
        serviceName: 'Cloud Storage Standard Multi-Region',
        category: 'storage',
        region: 'me-central-1',
        unit: 'GB-Month',
        billedQuantity: 142500,
        unitRateUSD: 0.015,
        billedAmountUSD: 2137.5,
      },
      {
        serviceId: 's3-cold',
        skuCode: 'AWS-S3-GLACIER-ME1',
        serviceName: 'Coldline Archive Storage (Rate Mismatch)',
        category: 'storage',
        region: 'me-central-1',
        unit: 'GB-Month',
        billedQuantity: 68000,
        unitRateUSD: 0.007,
        billedAmountUSD: 476.0,
      },
      {
        serviceId: 's3-egress',
        skuCode: 'NET-EGRESS-PUB-ME1',
        serviceName: 'Network Internet Egress Premium Tier',
        category: 'egress',
        region: 'me-central-1',
        unit: 'GB',
        billedQuantity: 48500,
        unitRateUSD: 0.015,
        billedAmountUSD: 727.5,
      },
      {
        serviceId: 'iops-api',
        skuCode: 'S3-API-REQ-10K',
        serviceName: 'Cloud Storage Class A/B Operations',
        category: 'iops',
        region: 'me-central-1',
        unit: '10k Requests',
        billedQuantity: 18400,
        unitRateUSD: 0.004,
        billedAmountUSD: 73.6,
      },
      {
        serviceId: 'compute-workers',
        skuCode: 'CMP-WORKER-VCPU',
        serviceName: 'GKE Autopilot Media Workers',
        category: 'compute',
        region: 'me-central-1',
        unit: 'vCPU-Hours',
        billedQuantity: 4910,
        unitRateUSD: 0.044,
        billedAmountUSD: 216.04,
      },
      {
        serviceId: 'multi-az-repl',
        skuCode: 'REPL-3AZ-SYNC',
        serviceName: 'Dual-Region Turbo Replication',
        category: 'backup',
        region: 'me-central-1',
        unit: 'GB-Synced',
        billedQuantity: 106876,
        unitRateUSD: 0.005,
        billedAmountUSD: 534.38,
      },
    ],
  },
  wasabi: {
    invoiceId: 'WSB-INV-2026-11-9012',
    provider: 'Wasabi Hot Cloud Storage',
    billingPeriod: '2026-11',
    currency: 'USD',
    issuedAt: '2026-11-25T14:00:00Z',
    accountId: 'wsb-ent-rawaj-01',
    fileName: 'wasabi-2026-11-invoice.json',
    lineItems: [
      {
        serviceId: 's3-hot',
        skuCode: 'AWS-S3-STD-ME1',
        serviceName: 'Wasabi Hot Cloud Storage Pool',
        category: 'storage',
        region: 'me-central-1',
        unit: 'GB-Month',
        billedQuantity: 142100,
        unitRateUSD: 0.015,
        billedAmountUSD: 2131.5,
      },
      {
        serviceId: 's3-cold',
        skuCode: 'AWS-S3-GLACIER-ME1',
        serviceName: 'Wasabi Immutable Archive Bucket',
        category: 'storage',
        region: 'me-central-1',
        unit: 'GB-Month',
        billedQuantity: 67800,
        unitRateUSD: 0.004,
        billedAmountUSD: 271.2,
      },
      {
        serviceId: 's3-egress',
        skuCode: 'NET-EGRESS-PUB-ME1',
        serviceName: 'Zero-Egress Bandwidth Alliance Transfer',
        category: 'egress',
        region: 'me-central-1',
        unit: 'GB',
        billedQuantity: 48200,
        unitRateUSD: 0.015,
        billedAmountUSD: 718.0,
      },
      {
        serviceId: 'iops-api',
        skuCode: 'S3-API-REQ-10K',
        serviceName: 'API Operations (Included)',
        category: 'iops',
        region: 'me-central-1',
        unit: '10k Requests',
        billedQuantity: 18400,
        unitRateUSD: 0.004,
        billedAmountUSD: 72.5,
      },
      {
        serviceId: 'compute-workers',
        skuCode: 'CMP-WORKER-VCPU',
        serviceName: 'Edge Ingestion Workers',
        category: 'compute',
        region: 'me-central-1',
        unit: 'vCPU-Hours',
        billedQuantity: 4840,
        unitRateUSD: 0.038,
        billedAmountUSD: 183.92,
      },
      {
        serviceId: 'multi-az-repl',
        skuCode: 'REPL-3AZ-SYNC',
        serviceName: '3-Zone Redundancy Sync',
        category: 'backup',
        region: 'me-central-1',
        unit: 'GB-Synced',
        billedQuantity: 106800,
        unitRateUSD: 0.005,
        billedAmountUSD: 534.0,
      },
      {
        serviceId: 'kms-security',
        skuCode: 'SEC-HSM-CMK',
        serviceName: 'Customer-Managed Encryption Keys',
        category: 'license',
        region: 'me-central-1',
        unit: 'Key-Month',
        billedQuantity: 12,
        unitRateUSD: 10.0,
        billedAmountUSD: 120.0,
      },
    ],
  },
};

function normalizeCategory(raw: unknown): CloudServiceCategory {
  const val = String(raw || '').toLowerCase();
  if (val.includes('stor') || val.includes('s3') || val.includes('disk')) return 'storage';
  if (val.includes('egress') || val.includes('band') || val.includes('transfer')) return 'egress';
  if (val.includes('iops') || val.includes('api') || val.includes('req')) return 'iops';
  if (val.includes('comp') || val.includes('cpu') || val.includes('worker')) return 'compute';
  if (val.includes('back') || val.includes('repl') || val.includes('snap')) return 'backup';
  if (val.includes('kms') || val.includes('sec') || val.includes('lic')) return 'license';
  if (val.includes('net') || val.includes('nat') || val.includes('vpc')) return 'network';
  return 'other';
}

function toSafeNumber(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

export function parseCloudProviderInvoice(
  rawJsonText: string,
  fileName = 'uploaded-invoice.json'
): { invoice?: UploadedProviderInvoice; errorAr?: string; errorEn?: string } {
  if (!rawJsonText || !rawJsonText.trim()) {
    return {
      errorAr: 'ملف الفاتورة فارغ. يرجى رفع ملف JSON يحتوي على بنود الفاتورة.',
      errorEn: 'The uploaded file is empty. Please upload a valid JSON invoice file.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJsonText);
  } catch {
    return {
      errorAr: 'تنسيق JSON غير صالح — يرجى التأكد من سلامة بنية الملف وعدم وجود أخطاء نحوية.',
      errorEn: 'Invalid JSON syntax — please check the invoice file format and try again.',
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      errorAr: 'يجب أن يحتوي ملف JSON على كائن فاتورة أو مصفوفة بنود صالحة.',
      errorEn: 'JSON root must be an invoice object or an array of line items.',
    };
  }

  const root = parsed as Record<string, unknown>;
  const rawItems = Array.isArray(parsed)
    ? parsed
    : Array.isArray(root.lineItems)
    ? root.lineItems
    : Array.isArray(root.line_items)
    ? root.line_items
    : Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.charges)
    ? root.charges
    : null;

  if (!rawItems || rawItems.length === 0) {
    return {
      errorAr: 'لم يتم العثور على بنود فاتورة (lineItems / items) داخل ملف JSON.',
      errorEn: 'No invoice line items (lineItems / items) were found in the uploaded JSON.',
    };
  }

  const normalizedItems: UploadedInvoiceLineItem[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const entry = rawItems[i];
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;

    const serviceId = String(
      item.serviceId || item.service_id || item.skuCode || item.sku || item.id || `item-${i + 1}`
    ).trim();
    const serviceName = String(
      item.serviceName || item.service_name || item.description || item.name || serviceId
    ).trim();

    const billedQuantity = toSafeNumber(item.billedQuantity ?? item.billed_quantity ?? item.quantity ?? item.usage ?? 1);
    let unitRateUSD = toSafeNumber(item.unitRateUSD ?? item.unit_rate_usd ?? item.unitRate ?? item.rate);
    let billedAmountUSD = toSafeNumber(
      item.billedAmountUSD ?? item.billed_amount_usd ?? item.amountUSD ?? item.amount ?? item.cost ?? item.total
    );

    if (billedAmountUSD === 0 && billedQuantity > 0 && unitRateUSD > 0) {
      billedAmountUSD = Number((billedQuantity * unitRateUSD).toFixed(4));
    } else if (unitRateUSD === 0 && billedQuantity > 0 && billedAmountUSD > 0) {
      unitRateUSD = Number((billedAmountUSD / billedQuantity).toFixed(6));
    }

    normalizedItems.push({
      serviceId,
      skuCode: item.skuCode ? String(item.skuCode) : item.sku ? String(item.sku) : undefined,
      serviceName,
      category: normalizeCategory(item.category || serviceName || serviceId),
      region: item.region ? String(item.region) : 'me-central-1',
      unit: item.unit ? String(item.unit) : 'Units',
      billedQuantity,
      unitRateUSD,
      billedAmountUSD,
    });
  }

  if (normalizedItems.length === 0) {
    return {
      errorAr: 'بنود الفاتورة المرفوعة غير قابلة للقراءة. يرجى تحميل نموذج JSON المعتمد للمقارنة.',
      errorEn: 'Could not extract valid line items. Try downloading the certified JSON template.',
    };
  }

  return {
    invoice: {
      invoiceId: String(root.invoiceId || root.invoice_id || `INV-UPLOAD-${Date.now().toString().slice(-5)}`),
      provider: String(root.provider || root.vendor || root.cloudProvider || 'External Cloud Provider'),
      billingPeriod: String(root.billingPeriod || root.billing_period || root.period || '2026-11'),
      currency: String(root.currency || 'USD').toUpperCase(),
      issuedAt: String(root.issuedAt || root.issued_at || new Date().toISOString()),
      accountId: root.accountId ? String(root.accountId) : undefined,
      fileName,
      lineItems: normalizedItems,
    },
  };
}

export function reconcileInvoiceAgainstUsageLogs(
  invoice: UploadedProviderInvoice,
  usageLogs: StoredUsageLogEntry[],
  tolerancePercent = 5
): VarianceReport {
  const matchedLogIds = new Set<string>();
  const lines: ReconciliationLineResult[] = [];

  for (let idx = 0; idx < invoice.lineItems.length; idx++) {
    const item = invoice.lineItems[idx];

    // Match by serviceId or skuCode
    const matchedLog = usageLogs.find(
      log =>
        log.serviceId.toLowerCase() === item.serviceId.toLowerCase() ||
        (item.skuCode && log.skuCode.toLowerCase() === item.skuCode.toLowerCase())
    );

    if (!matchedLog) {
      // Unexpected / shadow resource charge with no internal usage telemetry
      lines.push({
        id: `line-${idx}-${item.serviceId}`,
        serviceId: item.serviceId,
        skuCode: item.skuCode || item.serviceId.toUpperCase(),
        serviceNameAr: item.serviceName,
        serviceNameEn: item.serviceName,
        category: item.category || 'other',
        region: item.region || 'unknown',
        unit: item.unit || 'Units',
        loggedQuantity: 0,
        billedQuantity: item.billedQuantity,
        quantityVariance: item.billedQuantity,
        quantityVariancePercent: 100,
        contractUnitRateUSD: 0,
        billedUnitRateUSD: item.unitRateUSD,
        expectedCostUSD: 0,
        actualBilledUSD: item.billedAmountUSD,
        varianceUSD: item.billedAmountUSD,
        variancePercent: 100,
        discrepancyType: 'unexpected_charge',
        severity: 'critical',
        recommendationAr:
          'بند غير مسجل في سجلات الاستهلاك الداخلية! يرجى التحقق من الموارد اليتيمة (Orphaned Resources) وفتح تذكرة اعتراض فورية لدى المزود.',
        recommendationEn:
          'Unrecognized charge with zero matching internal usage telemetry. Audit orphaned resources and raise an immediate provider billing dispute.',
        decision: 'pending',
      });
      continue;
    }

    matchedLogIds.add(matchedLog.serviceId);

    const expectedCostUSD = matchedLog.expectedCostUSD;
    const actualBilledUSD = item.billedAmountUSD;
    const varianceUSD = Number((actualBilledUSD - expectedCostUSD).toFixed(2));
    const variancePercent =
      expectedCostUSD > 0 ? Number(((varianceUSD / expectedCostUSD) * 100).toFixed(2)) : 0;

    const quantityVariance = Number((item.billedQuantity - matchedLog.loggedQuantity).toFixed(2));
    const quantityVariancePercent =
      matchedLog.loggedQuantity > 0
        ? Number(((quantityVariance / matchedLog.loggedQuantity) * 100).toFixed(2))
        : 0;

    const rateDiffPercent =
      matchedLog.contractUnitRateUSD > 0
        ? ((item.unitRateUSD - matchedLog.contractUnitRateUSD) / matchedLog.contractUnitRateUSD) * 100
        : 0;

    let discrepancyType: DiscrepancyType = 'matched';
    let severity: DiscrepancySeverity = 'none';
    let recommendationAr = 'القيمة والكمية المفوترة متطابقة تماماً ضمن هامش التفاوت المسموح.';
    let recommendationEn = 'Billed cost and metered quantity align within the configured variance threshold.';

    if (variancePercent > tolerancePercent) {
      if (rateDiffPercent > tolerancePercent && Math.abs(quantityVariancePercent) <= tolerancePercent) {
        discrepancyType = 'overbilled_rate';
        severity = variancePercent >= 15 ? 'critical' : 'warning';
        recommendationAr = `تم تطبيق سعر وحدة أعلى من العقد ($${item.unitRateUSD.toFixed(4)} بدلاً من $${matchedLog.contractUnitRateUSD.toFixed(4)}). يُنصح بطلب إشعار دائن لتصحيح التسعيرة.`;
        recommendationEn = `Unit rate exceeds contracted tariff ($${item.unitRateUSD.toFixed(4)} vs $${matchedLog.contractUnitRateUSD.toFixed(4)}). Request a billing credit adjustment.`;
      } else {
        discrepancyType = 'overbilled_usage';
        severity = variancePercent >= 15 ? 'critical' : 'warning';
        recommendationAr = `زيادة مفوترة في الاستهلاك بمقدار +${quantityVariance.toLocaleString()} ${matchedLog.unit} (+${quantityVariancePercent.toFixed(1)}%) عن سجلات القياس الداخلية. راجع سجل التدفقات وافتح نزاع فوترة.`;
        recommendationEn = `Provider billed +${quantityVariance.toLocaleString()} ${matchedLog.unit} (+${quantityVariancePercent.toFixed(1)}%) above internal telemetry logs. Inspect egress/storage logs and file a dispute.`;
      }
    } else if (variancePercent < -tolerancePercent) {
      discrepancyType = 'underbilled_credit';
      severity = 'info';
      recommendationAr = `وفر فعلي بقيمة $${Math.abs(varianceUSD).toFixed(2)} بفضل خصومات الالتزام أو إزالة التكرار (Deduplication).`;
      recommendationEn = `Favorable savings of $${Math.abs(varianceUSD).toFixed(2)} from committed-use credits or deduplication efficiency.`;
    }

    lines.push({
      id: `line-${idx}-${matchedLog.serviceId}`,
      serviceId: matchedLog.serviceId,
      skuCode: matchedLog.skuCode,
      serviceNameAr: matchedLog.serviceNameAr,
      serviceNameEn: matchedLog.serviceNameEn,
      category: matchedLog.category,
      region: item.region || matchedLog.region,
      unit: matchedLog.unit,
      loggedQuantity: matchedLog.loggedQuantity,
      billedQuantity: item.billedQuantity,
      quantityVariance,
      quantityVariancePercent,
      contractUnitRateUSD: matchedLog.contractUnitRateUSD,
      billedUnitRateUSD: item.unitRateUSD,
      expectedCostUSD,
      actualBilledUSD,
      varianceUSD,
      variancePercent,
      discrepancyType,
      severity,
      recommendationAr,
      recommendationEn,
      decision: discrepancyType === 'matched' ? 'approved' : 'pending',
    });
  }

  // Check for stored usage logs that were completely omitted from the uploaded invoice
  usageLogs.forEach((log, idx) => {
    if (!matchedLogIds.has(log.serviceId)) {
      lines.push({
        id: `missing-${idx}-${log.serviceId}`,
        serviceId: log.serviceId,
        skuCode: log.skuCode,
        serviceNameAr: log.serviceNameAr,
        serviceNameEn: log.serviceNameEn,
        category: log.category,
        region: log.region,
        unit: log.unit,
        loggedQuantity: log.loggedQuantity,
        billedQuantity: 0,
        quantityVariance: -log.loggedQuantity,
        quantityVariancePercent: -100,
        contractUnitRateUSD: log.contractUnitRateUSD,
        billedUnitRateUSD: 0,
        expectedCostUSD: log.expectedCostUSD,
        actualBilledUSD: 0,
        varianceUSD: -log.expectedCostUSD,
        variancePercent: -100,
        discrepancyType: 'unbilled_usage',
        severity: 'warning',
        recommendationAr:
          'تم رصد استهلاك فعلي في السجلات الداخلية دون إدراجه في فاتورة المزود. يُنصح بحجز مخصص مالي (Accrual) لاحتمال ظهوره في الدورة القادمة.',
        recommendationEn:
          'Internal usage telemetry recorded consumption missing from the provider invoice. Accrue expected cost for potential delayed billing.',
        decision: 'pending',
      });
    }
  });

  const totalExpectedUSD = Number(
    lines.reduce((acc, l) => acc + l.expectedCostUSD, 0).toFixed(2)
  );
  const totalBilledUSD = Number(
    lines.reduce((acc, l) => acc + l.actualBilledUSD, 0).toFixed(2)
  );
  const netVarianceUSD = Number((totalBilledUSD - totalExpectedUSD).toFixed(2));
  const netVariancePercent =
    totalExpectedUSD > 0 ? Number(((netVarianceUSD / totalExpectedUSD) * 100).toFixed(2)) : 0;

  const overbilledTotalUSD = Number(
    lines
      .filter(l => l.varianceUSD > 0 && l.discrepancyType !== 'matched')
      .reduce((acc, l) => acc + l.varianceUSD, 0)
      .toFixed(2)
  );
  const underbilledTotalUSD = Number(
    lines
      .filter(l => l.varianceUSD < 0 && l.discrepancyType !== 'matched')
      .reduce((acc, l) => acc + Math.abs(l.varianceUSD), 0)
      .toFixed(2)
  );

  const matchedCount = lines.filter(l => l.discrepancyType === 'matched').length;
  const discrepancyCount = lines.filter(l => l.discrepancyType !== 'matched').length;
  const criticalCount = lines.filter(l => l.severity === 'critical').length;

  const accuracyRatio =
    totalExpectedUSD > 0
      ? Math.max(0, 100 - (Math.abs(netVarianceUSD) / totalExpectedUSD) * 100)
      : 100;

  return {
    id: `REC-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    invoiceId: invoice.invoiceId,
    provider: invoice.provider,
    billingPeriod: invoice.billingPeriod,
    fileName: invoice.fileName || `${invoice.invoiceId}.json`,
    tolerancePercent,
    totalExpectedUSD,
    totalBilledUSD,
    netVarianceUSD,
    netVariancePercent,
    overbilledTotalUSD,
    underbilledTotalUSD,
    matchedCount,
    discrepancyCount,
    criticalCount,
    reconciliationScorePercent: Number(accuracyRatio.toFixed(1)),
    lines,
  };
}

export function buildVarianceReportCsv(report: VarianceReport, isAr: boolean): string {
  const headers = isAr
    ? [
        'معرف الخدمة',
        'كود SKU',
        'اسم البند',
        'الفئة',
        'الاستهلاك المسجل',
        'الكمية المفوترة',
        'الوحدة',
        'التكلفة المتوقعة (USD)',
        'المبلغ المفوتر (USD)',
        'التباين (USD)',
        'نسبة التباين (%)',
        'نوع التباين',
        'قرار المراجع',
      ]
    : [
        'Service ID',
        'SKU Code',
        'Service Name',
        'Category',
        'Logged Usage',
        'Billed Usage',
        'Unit',
        'Expected Cost (USD)',
        'Actual Billed (USD)',
        'Variance (USD)',
        'Variance (%)',
        'Discrepancy Type',
        'Audit Decision',
      ];

  const escapeCsv = (val: string | number) => {
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = report.lines.map(line =>
    [
      line.serviceId,
      line.skuCode,
      isAr ? line.serviceNameAr : line.serviceNameEn,
      line.category,
      line.loggedQuantity,
      line.billedQuantity,
      line.unit,
      line.expectedCostUSD.toFixed(2),
      line.actualBilledUSD.toFixed(2),
      line.varianceUSD.toFixed(2),
      `${line.variancePercent.toFixed(2)}%`,
      line.discrepancyType,
      line.decision,
    ]
      .map(escapeCsv)
      .join(',')
  );

  // Prefix UTF-8 BOM for proper Arabic rendering in Excel
  return '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
}

export function parseStoredUsageLogsJson(
  rawJsonText: string
): { logs?: StoredUsageLogEntry[]; errorAr?: string; errorEn?: string } {
  if (!rawJsonText || !rawJsonText.trim()) {
    return {
      errorAr: 'ملف سجلات الاستهلاك فارغ.',
      errorEn: 'Usage logs JSON is empty.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJsonText);
  } catch {
    return {
      errorAr: 'تنسيق JSON لسجلات الاستهلاك غير صالح.',
      errorEn: 'Invalid JSON syntax in usage logs file.',
    };
  }

  const root = parsed as Record<string, unknown>;
  const rawLogs = Array.isArray(parsed)
    ? parsed
    : Array.isArray(root?.usageLogs)
    ? root.usageLogs
    : Array.isArray(root?.logs)
    ? root.logs
    : null;

  if (!rawLogs || rawLogs.length === 0) {
    return {
      errorAr: 'لم يتم العثور على مصفوفة سجلات استهلاك (usageLogs / logs).',
      errorEn: 'No usage log entries (usageLogs / logs array) were found.',
    };
  }

  const normalized: StoredUsageLogEntry[] = [];
  for (let i = 0; i < rawLogs.length; i++) {
    const entry = rawLogs[i];
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Record<string, unknown>;
    const serviceId = String(item.serviceId || item.service_id || `svc-${i + 1}`).trim();
    const loggedQuantity = toSafeNumber(item.loggedQuantity ?? item.logged_quantity ?? item.quantity ?? 0);
    const contractUnitRateUSD = toSafeNumber(
      item.contractUnitRateUSD ?? item.contract_unit_rate_usd ?? item.unitRateUSD ?? item.rate ?? 0
    );
    const expectedCostUSD = Number(
      (
        toSafeNumber(item.expectedCostUSD ?? item.expected_cost_usd) ||
        loggedQuantity * contractUnitRateUSD
      ).toFixed(2)
    );

    normalized.push({
      serviceId,
      skuCode: String(item.skuCode || item.sku || serviceId.toUpperCase()),
      serviceNameAr: String(item.serviceNameAr || item.serviceName || item.name || serviceId),
      serviceNameEn: String(item.serviceNameEn || item.serviceName || item.name || serviceId),
      category: normalizeCategory(item.category || item.serviceName || serviceId),
      region: String(item.region || 'me-central-1'),
      billingPeriod: String(item.billingPeriod || item.period || '2026-11'),
      unit: String(item.unit || 'Units'),
      loggedQuantity,
      contractUnitRateUSD,
      expectedCostUSD,
      sourceSystem: String(item.sourceSystem || 'Imported Usage Telemetry'),
    });
  }

  if (normalized.length === 0) {
    return {
      errorAr: 'تعذر استخراج سجلات استهلاك صالحة من الملف.',
      errorEn: 'Could not extract valid usage log entries.',
    };
  }

  return { logs: normalized };
}

export function buildDisputeNoticeText(report: VarianceReport, isAr: boolean): string {
  const disputedLines = report.lines.filter(
    l => l.decision === 'disputed' || (l.varianceUSD > 0 && l.discrepancyType !== 'matched')
  );
  const totalClaimUSD = disputedLines.reduce((acc, l) => acc + Math.max(0, l.varianceUSD), 0);

  if (isAr) {
    const itemLines = disputedLines
      .map(
        (l, idx) =>
          `${idx + 1}. ${l.serviceNameAr} (${l.skuCode})\n` +
          `   - الكمية المسجلة داخلياً: ${l.loggedQuantity.toLocaleString()} ${l.unit} | الكمية المفوترة: ${l.billedQuantity.toLocaleString()} ${l.unit}\n` +
          `   - سعر العقد: $${l.contractUnitRateUSD.toFixed(4)} | السعر المفوتر: $${l.billedUnitRateUSD.toFixed(4)}\n` +
          `   - المبلغ المتوقع: $${l.expectedCostUSD.toFixed(2)} | المفوتر: $${l.actualBilledUSD.toFixed(2)} | فرق المطالبة: +$${l.varianceUSD.toFixed(2)} (+${l.variancePercent.toFixed(1)}%)\n` +
          `   - الحالة: ${l.decision === 'disputed' ? 'نزاع مؤكد من المراجع' : 'تباين مرصود آلياً'}`
      )
      .join('\n\n');

    return [
      '====================================================================',
      'إشعار مطالبة وتسوية فواتير سحابية — منصة رواج كلاود (Rawaj Cloud)',
      '====================================================================',
      `مرجع التدقيق: ${report.id}`,
      `رقم الفاتورة: ${report.invoiceId}`,
      `مزود الخدمة: ${report.provider}`,
      `فترة الفوترة: ${report.billingPeriod}`,
      `تاريخ الإصدار: ${new Date(report.generatedAt).toLocaleString('ar-SA')}`,
      `إجمالي المبلغ المطلوب استرداده (Credit Note): $${totalClaimUSD.toFixed(2)} USD`,
      '--------------------------------------------------------------------',
      'تفاصيل البنود المتباينة:',
      itemLines || 'لا توجد بنود زيادة فوترة مستحقة للاعتراض.',
      '--------------------------------------------------------------------',
      'يُرجى مراجعة سجلات القياس المرفقة وإصدار إشعار دائن بالفروقات المذكورة أعلاه.',
    ].join('\n');
  }

  const itemLines = disputedLines
    .map(
      (l, idx) =>
        `${idx + 1}. ${l.serviceNameEn} (${l.skuCode})\n` +
        `   - Internal Metered Usage: ${l.loggedQuantity.toLocaleString()} ${l.unit} | Provider Billed: ${l.billedQuantity.toLocaleString()} ${l.unit}\n` +
        `   - Contract Unit Rate: $${l.contractUnitRateUSD.toFixed(4)} | Billed Unit Rate: $${l.billedUnitRateUSD.toFixed(4)}\n` +
        `   - Expected: $${l.expectedCostUSD.toFixed(2)} | Billed: $${l.actualBilledUSD.toFixed(2)} | Claimed Variance: +$${l.varianceUSD.toFixed(2)} (+${l.variancePercent.toFixed(1)}%)\n` +
        `   - Status: ${l.decision === 'disputed' ? 'Auditor Disputed' : 'Auto-Flagged Overbill'}`
    )
    .join('\n\n');

  return [
    '====================================================================',
    'CLOUD BILLING DISPUTE & CREDIT CLAIM — RAWAJ CLOUD FINOPS',
    '====================================================================',
    `Audit Reference: ${report.id}`,
    `Invoice ID: ${report.invoiceId}`,
    `Cloud Provider: ${report.provider}`,
    `Billing Period: ${report.billingPeriod}`,
    `Generated At: ${new Date(report.generatedAt).toISOString()}`,
    `Total Credit Adjustment Requested: $${totalClaimUSD.toFixed(2)} USD`,
    '--------------------------------------------------------------------',
    'Discrepant Line Items:',
    itemLines || 'No overbilled line items flagged for dispute.',
    '--------------------------------------------------------------------',
    'Please review the metered usage evidence above and issue a billing credit adjustment.',
  ].join('\n');
}

