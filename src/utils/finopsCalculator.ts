import {
  CloudUnitRates,
  OperationalCostConfig,
  PackageResourceInput,
  PackageFinancialBreakdown,
  DerivedSaaSPackage,
  CurrencyCode,
  CURRENCY_RATES,
  ProviderInvoiceItem,
  FinOpsKPIs,
} from '../types/finops';

export function calculateFinancialBreakdown(
  resources: PackageResourceInput,
  rates: CloudUnitRates,
  config: OperationalCostConfig
): PackageFinancialBreakdown {
  // 1. Direct Cloud Infrastructure Costs
  const replication = resources.dedicatedTenancy ? rates.multiAzReplicationFactor : 1.15;
  const directStorageCost = (
    resources.storageHotGB * rates.storageHotPerGBMonth +
    resources.storageColdGB * rates.storageColdPerGBMonth
  ) * replication;

  const directEgressCost = resources.monthlyEgressGB * rates.networkEgressPerGB;
  const directIopsCost = resources.monthlyIOPSIn10k * rates.iopsPer10kRequests;
  const directComputeCost = resources.computeVcpuHours * rates.computePerVcpuHour;
  
  // Backup snapshots based on retention period (relative to 30-day base)
  const retentionMultiplier = Math.max(1, resources.backupRetentionDays / 30);
  const directBackupCost = resources.storageHotGB * 0.4 * rates.backupSnapshotPerGB * retentionMultiplier;

  const totalDirectCloudCost =
    directStorageCost +
    directEgressCost +
    directIopsCost +
    directComputeCost +
    directBackupCost;

  // 2. Operational & Platform Overheads
  const platformMaintenanceFee = config.fixedPlatformMaintenancePerUser;
  const supportAndSlaFee = totalDirectCloudCost * (config.supportAndSlaRatePercent / 100);
  const securityLicenseFee = config.securityAndKmsLicensePerUser;

  // Preliminary subtotal to compute realistic payment gateway merchant processing
  const preliminaryBase = totalDirectCloudCost + platformMaintenanceFee + supportAndSlaFee + securityLicenseFee;
  const preliminaryPrice = preliminaryBase * (1 + config.profitMarginPercent / 100);
  const paymentProcessingFee = (preliminaryPrice * (config.paymentGatewayFeePercent / 100)) + config.paymentGatewayFixedPerTx;

  const totalOperationalCost =
    platformMaintenanceFee +
    supportAndSlaFee +
    securityLicenseFee +
    paymentProcessingFee;

  // 3. Base Total Cost (Direct Cloud + Operational Overheads)
  const totalBaseCost = totalDirectCloudCost + totalOperationalCost;

  // 4. Exact 15% Profit Margin
  const profitMarginRate = config.profitMarginPercent / 100;
  const netProfitAmount = totalBaseCost * profitMarginRate;

  // 5. Retail Subtotal (Base Cost + 15% Net Profit)
  const retailSubtotal = totalBaseCost + netProfitAmount;

  // 6. Taxes (VAT) & Final Price
  const vatAmount = retailSubtotal * (config.vatPercent / 100);
  const finalPriceMonthly = retailSubtotal + vatAmount;

  // 7. Annual Model with 20% Discount
  const annualSubtotalDiscounted = retailSubtotal * 12 * 0.80;
  const annualVat = annualSubtotalDiscounted * (config.vatPercent / 100);
  const annualTotalBilled = annualSubtotalDiscounted + annualVat;
  const finalPriceAnnualMonthlyEquivalent = annualTotalBilled / 12;

  // 8. Financial Margins Analysis
  const grossMarginPercent = retailSubtotal > 0
    ? ((retailSubtotal - totalDirectCloudCost) / retailSubtotal) * 100
    : 0;
  const netMarginPercent = retailSubtotal > 0
    ? (netProfitAmount / retailSubtotal) * 100
    : 0;

  return {
    directStorageCost,
    directEgressCost,
    directIopsCost,
    directComputeCost,
    directBackupCost,
    totalDirectCloudCost,
    platformMaintenanceFee,
    supportAndSlaFee,
    securityLicenseFee,
    paymentProcessingFee,
    totalOperationalCost,
    totalBaseCost,
    profitMarginRate,
    netProfitAmount,
    retailSubtotal,
    vatAmount,
    finalPriceMonthly,
    finalPriceAnnualMonthlyEquivalent,
    annualTotalBilled,
    grossMarginPercent,
    netMarginPercent,
  };
}

export function generateStandardPackages(
  rates: CloudUnitRates,
  config: OperationalCostConfig
): DerivedSaaSPackage[] {
  // Package 1: Basic / Starter
  const starterResources: PackageResourceInput = {
    storageHotGB: 100,
    storageColdGB: 50,
    monthlyEgressGB: 50,
    monthlyIOPSIn10k: 50,
    computeVcpuHours: 15,
    backupRetentionDays: 30,
    dedicatedTenancy: false,
  };

  // Package 2: Standard / Pro
  const proResources: PackageResourceInput = {
    storageHotGB: 1000, // 1 TB
    storageColdGB: 500,
    monthlyEgressGB: 400,
    monthlyIOPSIn10k: 250,
    computeVcpuHours: 60,
    backupRetentionDays: 60,
    dedicatedTenancy: false,
  };

  // Package 3: Business Elite / Premium
  const businessResources: PackageResourceInput = {
    storageHotGB: 10000, // 10 TB
    storageColdGB: 5000,
    monthlyEgressGB: 2500,
    monthlyIOPSIn10k: 1500,
    computeVcpuHours: 240,
    backupRetentionDays: 90,
    dedicatedTenancy: true,
  };

  // Package 4: Flex Pay-As-You-Go
  const flexResources: PackageResourceInput = {
    storageHotGB: 250,
    storageColdGB: 100,
    monthlyEgressGB: 150,
    monthlyIOPSIn10k: 100,
    computeVcpuHours: 30,
    backupRetentionDays: 45,
    dedicatedTenancy: false,
  };

  return [
    {
      id: 'pkg-starter',
      nameAr: 'باقة البداية (Starter)',
      nameEn: 'Starter Cloud',
      taglineAr: 'للأفراد والمستقلين لحفظ وتأمين الملفات الشخصية والمشاريع الناشئة',
      taglineEn: 'For freelancers & individuals seeking secure, encrypted cloud backups',
      resources: starterResources,
      financials: calculateFinancialBreakdown(starterResources, rates, config),
      featuresAr: [
        '100 جيجابايت تخزين فائق السرعة NVMe Hot Storage',
        'تشفير صفري E2EE بنظام AES-256-GCM',
        'مزامنة الكاميرا والوسائط التلقائية (iOS/Android)',
        'استعادة نسخ سابقة حتى 30 يوماً Point-in-Time',
        'مشاركة الروابط بكلمة سر وتاريخ انتهاء الصلاحية',
      ],
      featuresEn: [
        '100 GB High-speed NVMe Hot Cloud Storage',
        'Zero-Knowledge E2EE Vault with AES-256-GCM',
        'Automatic Camera Roll & Media Background Sync',
        '30-Day Point-in-Time Versioning & File History',
        'Expiring Shared Links with Password Protection',
      ],
      overagePricing: {
        extraStoragePerGB: 0.025,
        extraEgressPerGB: 0.02,
        extraIOPSPer10k: 0.008,
      },
    },
    {
      id: 'pkg-pro',
      nameAr: 'باقة المحترفين (Professional)',
      nameEn: 'Professional Pro',
      taglineAr: 'للمصممين والمهندسين والفرق الصغيرة ذات متطلبات الوسائط الثقيلة',
      taglineEn: 'Optimized for creative studios, developers & high-throughput teams',
      badge: 'الأكثر طلباً',
      popular: true,
      resources: proResources,
      financials: calculateFinancialBreakdown(proResources, rates, config),
      featuresAr: [
        '1 تيرابايت (1,000 جيجابايت) تخزين سحابي هجين',
        'واجهة S3 API مع دعم أدوات AWS SDK و Rclone',
        'استعادة النسخ السابقة حتى 60 يوماً',
        'مزامنة انتقائية (Selective Sync) مع كاش محلي SQLite',
        'دعم فني ذو أولوية على مدار 24/7',
        'حظر رسوم السحب (Zero Egress Alliance)',
      ],
      featuresEn: [
        '1 TB (1,000 GB) Hybrid Cloud Storage Tier',
        'Full S3-Compatible API & Pre-Signed URLs',
        '60-Day Point-in-Time Recovery & Version History',
        'Selective Sync & Virtual On-Demand Files (SQLite)',
        '24/7 Priority Support & SLA Assurance',
        'Zero Egress Fee Guarantee for Local Sync',
      ],
      overagePricing: {
        extraStoragePerGB: 0.020,
        extraEgressPerGB: 0.015,
        extraIOPSPer10k: 0.006,
      },
    },
    {
      id: 'pkg-business',
      nameAr: 'باقة المؤسسات (Enterprise Elite)',
      nameEn: 'Enterprise Elite',
      taglineAr: 'للشركات والمؤسسات التي تتطلب بنية سحابية مخصصة وعزل تام',
      taglineEn: 'Dedicated multi-AZ cloud tenancy with ISO 27001 & SOC2 compliance',
      resources: businessResources,
      financials: calculateFinancialBreakdown(businessResources, rates, config),
      featuresAr: [
        '10 تيرابايت (10,000 جيجابايت) تخزين مخصص Multi-AZ',
        'بنية تحتية معزولة (Dedicated Tenancy) مع مفاتيح KMS خاصة',
        'استعادة غير محدودة للنسخ السابقة (Unlimited Versioning)',
        'اتفاقية مستوى خدمة 99.9% مع ضمان تعويض مالي',
        'سجلات تدقيق أمني متوافقة مع GDPR و ISO 27001',
        'مدير حساب تقني مخصص وربط SSO/SAML',
      ],
      featuresEn: [
        '10 TB Multi-AZ Dedicated Storage Infrastructure',
        'Dedicated Cloud Tenancy & Customer-Managed KMS Keys',
        'Unlimited File Versioning & Immutable WORM Retention',
        '99.9% Guaranteed SLA with Financially-Backed Credits',
        'Full GDPR & ISO 27001 Immutable Audit Logging',
        'Dedicated Technical Account Manager & SAML SSO',
      ],
      overagePricing: {
        extraStoragePerGB: 0.016,
        extraEgressPerGB: 0.012,
        extraIOPSPer10k: 0.004,
      },
    },
    {
      id: 'pkg-flex',
      nameAr: 'باقة المحفظة المرنة (Flex Pay-As-You-Go)',
      nameEn: 'Flex Pay-As-You-Go',
      taglineAr: 'ادفع بدقة متناهية حسب استهلاك البايتات دون التزامات تعاقدية',
      taglineEn: 'True utility-based billing: Pay solely for exact bytes consumed',
      resources: flexResources,
      financials: calculateFinancialBreakdown(flexResources, rates, config),
      featuresAr: [
        'مساحة تخزين مرنة تبدأ من 250 جيجابايت وتتوسع تلقائياً',
        'محفظة شحن سحابية مع تنبيهات عند وصول الرصيد 10%',
        'تسعير شفاف بنسبة هامش 15% معتمدة دون رسوم خفية',
        'شحن مرن عبر مدى، Apple Pay، تابي، وتمارا',
        'إمكانية الترقية أو التخفيض اللحظي بدون أي قيود',
      ],
      featuresEn: [
        'Elastic storage starting at 250 GB with auto-scale',
        'Prepaid Cloud Wallet with automated balance replenishment alerts',
        'Transparent 15% margin pricing with no hidden egress fees',
        'Instant top-up via Mada, Tamara, STC Pay & Apple Pay',
        'Prorated adjustments with zero long-term commitments',
      ],
      overagePricing: {
        extraStoragePerGB: 0.018,
        extraEgressPerGB: 0.014,
        extraIOPSPer10k: 0.005,
      },
    },
  ];
}

export function convertCurrency(amountUSD: number, target: CurrencyCode): number {
  const rate = CURRENCY_RATES[target]?.rateToUSD || 1.0;
  return amountUSD * rate;
}

export function formatCurrency(amountUSD: number, currency: CurrencyCode, isAr: boolean): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.SAR;
  const converted = amountUSD * info.rateToUSD;
  const symbol = isAr ? info.symbolAr : info.symbolEn;
  return `${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

export const SAMPLE_PROVIDER_INVOICE: ProviderInvoiceItem[] = [
  {
    serviceId: 's3-hot',
    serviceNameAr: 'تخزين كتل البيانات السريع (S3 Standard NVMe)',
    serviceNameEn: 'S3 Standard NVMe Hot Storage',
    category: 'storage',
    meteredUsage: '142,500 GB-Month',
    expectedCostUSD: 2137.50,
    actualBilledUSD: 2098.20,
    varianceUSD: -39.30,
    variancePercent: -1.84,
    status: 'matched',
    optimizationTipAr: 'المطابقة مثالية، وتوفر تقنية ضغط الكتل المسبق حوالي 3.2% من التكلفة المخططة.',
    optimizationTipEn: 'Healthy alignment; client-side chunk pre-compression saves ~3.2% vs budget.',
  },
  {
    serviceId: 's3-egress',
    serviceNameAr: 'حركة البيانات الخارجة (Internet Bandwidth Out)',
    serviceNameEn: 'Network Data Transfer Egress',
    category: 'egress',
    meteredUsage: '48,200 GB Transfer',
    expectedCostUSD: 723.00,
    actualBilledUSD: 845.60,
    varianceUSD: 122.60,
    variancePercent: 16.96,
    status: 'over_budget',
    optimizationTipAr: 'ارتفاع في السحب نتيجة مشاركة روابط وسائط عامة. يوصى بتفعيل Cloudflare Bandwidth Alliance لتقليل تكلفة Egress للصفر.',
    optimizationTipEn: 'Bandwidth spike detected on public links. Enable Bandwidth Alliance peering to suppress transit fees.',
  },
  {
    serviceId: 'iops-api',
    serviceNameAr: 'طلبات واجهة التخزين (S3 PUT/GET/LIST Operations)',
    serviceNameEn: 'S3 API Requests & Micro-operations',
    category: 'iops',
    meteredUsage: '18,400,000 Requests',
    expectedCostUSD: 73.60,
    actualBilledUSD: 52.40,
    varianceUSD: -21.20,
    variancePercent: -28.8,
    status: 'under_budget',
    optimizationTipAr: 'وفر محرك فحص التكرار (SHA-256 Deduplication) أكثر من 28% من عمليات الرفع المكررة.',
    optimizationTipEn: 'Client-side deduplication engine prevented over 28% of redundant upload operations.',
  },
  {
    serviceId: 'compute-workers',
    serviceNameAr: 'خوادم معالجة الصور والتجزئة (Ingestion & Thumbnails)',
    serviceNameEn: 'Media Processing & Hashing Workers',
    category: 'compute',
    meteredUsage: '4,850 vCPU-Hours',
    expectedCostUSD: 184.30,
    actualBilledUSD: 178.50,
    varianceUSD: -5.80,
    variancePercent: -3.15,
    status: 'matched',
    optimizationTipAr: 'الخوادم تعمل بتناغم ضمن معدلات التشغيل الذاتي مع تفعيل المقاييس المؤتمتة.',
    optimizationTipEn: 'Auto-scaled workers operate well within optimal CPU/RAM utilization boundaries.',
  },
  {
    serviceId: 'multi-az-repl',
    serviceNameAr: 'النسخ الاحتياطي الجغرافي (3-AZ Replication)',
    serviceNameEn: 'Geographic Multi-AZ Replication',
    category: 'storage',
    meteredUsage: 'Cross-AZ Sync 142.5 TB',
    expectedCostUSD: 534.38,
    actualBilledUSD: 529.10,
    varianceUSD: -5.28,
    variancePercent: -0.99,
    status: 'matched',
    optimizationTipAr: 'تحقيق أعلى درجات المتانة (11 Nines Durability) مع استقرار تام بتكلفة النقل البيني.',
    optimizationTipEn: 'Maintains 11 Nines durability with stable inter-zone sync traffic.',
  },
  {
    serviceId: 'kms-security',
    serviceNameAr: 'تراخيص وحدات التشفير Hardware Security (HSM / KMS)',
    serviceNameEn: 'Hardware Security Module & KMS Keys',
    category: 'license',
    meteredUsage: '12 Active Customer Master Keys',
    expectedCostUSD: 120.00,
    actualBilledUSD: 120.00,
    varianceUSD: 0.00,
    variancePercent: 0.0,
    status: 'matched',
    optimizationTipAr: 'مفاتيح التشفير تعمل بثبات مع تدوير آلي كل 90 يوماً.',
    optimizationTipEn: 'Static monthly KMS pricing; keys automatically rotate every 90 days.',
  },
];

export const SAMPLE_FINOPS_KPIS: FinOpsKPIs = {
  totalActiveSubscribers: 1480,
  mrrUSD: 24650.00,
  arrUSD: 295800.00,
  arpuUSD: 16.65,
  blendedGrossMarginPercent: 68.4,
  blendedNetMarginPercent: 15.0, // Strictly enforced 15% profit margin
  estimatedCacUSD: 42.00,
  cacPaybackMonths: 2.5,
  ltvUSD: 399.60,
  ltvToCacRatio: 9.5,
  breakevenSubscribers: 312,
};
