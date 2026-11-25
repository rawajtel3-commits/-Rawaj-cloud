export type CurrencyCode = 'SAR' | 'USD' | 'AED' | 'EUR' | 'EGP';

export interface CurrencyRate {
  code: CurrencyCode;
  symbolAr: string;
  symbolEn: string;
  nameAr: string;
  nameEn: string;
  rateToUSD: number; // 1 USD = rate
}

export const CURRENCY_RATES: Record<CurrencyCode, CurrencyRate> = {
  SAR: {
    code: 'SAR',
    symbolAr: 'ر.س',
    symbolEn: 'SAR',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    rateToUSD: 3.75,
  },
  USD: {
    code: 'USD',
    symbolAr: '$',
    symbolEn: '$',
    nameAr: 'دولار أمريكي',
    nameEn: 'US Dollar',
    rateToUSD: 1.0,
  },
  AED: {
    code: 'AED',
    symbolAr: 'د.إ',
    symbolEn: 'AED',
    nameAr: 'درهم إماراتي',
    nameEn: 'UAE Dirham',
    rateToUSD: 3.67,
  },
  EUR: {
    code: 'EUR',
    symbolAr: '€',
    symbolEn: '€',
    nameAr: 'يورو أوروبي',
    nameEn: 'Euro',
    rateToUSD: 0.92,
  },
  EGP: {
    code: 'EGP',
    symbolAr: 'ج.م',
    symbolEn: 'EGP',
    nameAr: 'جنيه مصري',
    nameEn: 'Egyptian Pound',
    rateToUSD: 48.5,
  },
};

// Unit measurement rates for direct cloud infrastructure
export interface CloudUnitRates {
  storageHotPerGBMonth: number; // e.g. $0.015 / GB-month
  storageColdPerGBMonth: number; // e.g. $0.004 / GB-month
  networkEgressPerGB: number; // e.g. $0.018 / GB (or 0 for zero-egress alliance)
  iopsPer10kRequests: number; // e.g. $0.004 / 10,000 IOPS
  computePerVcpuHour: number; // e.g. $0.038 / vCPU-hour
  backupSnapshotPerGB: number; // e.g. $0.005 / GB-month
  multiAzReplicationFactor: number; // e.g. 1.25x multiplier
}

export const DEFAULT_UNIT_RATES: CloudUnitRates = {
  storageHotPerGBMonth: 0.015,
  storageColdPerGBMonth: 0.004,
  networkEgressPerGB: 0.015,
  iopsPer10kRequests: 0.004,
  computePerVcpuHour: 0.038,
  backupSnapshotPerGB: 0.006,
  multiAzReplicationFactor: 1.25,
};

// Platform operational parameters
export interface OperationalCostConfig {
  fixedPlatformMaintenancePerUser: number; // $1.20 / month
  supportAndSlaRatePercent: number; // 6% of direct infra
  securityAndKmsLicensePerUser: number; // $0.60 / month
  paymentGatewayFeePercent: number; // 2.5%
  paymentGatewayFixedPerTx: number; // $0.30
  profitMarginPercent: number; // Mandatory 15%
  vatPercent: number; // 15% Saudi VAT (or 0% / 5%)
}

export const DEFAULT_OPERATIONAL_CONFIG: OperationalCostConfig = {
  fixedPlatformMaintenancePerUser: 1.20,
  supportAndSlaRatePercent: 6.0,
  securityAndKmsLicensePerUser: 0.60,
  paymentGatewayFeePercent: 2.5,
  paymentGatewayFixedPerTx: 0.30,
  profitMarginPercent: 15.0, // Exactly 15% as mandated
  vatPercent: 15.0,
};

// Resource requirement inputs for a package or custom client
export interface PackageResourceInput {
  storageHotGB: number;
  storageColdGB: number;
  monthlyEgressGB: number;
  monthlyIOPSIn10k: number;
  computeVcpuHours: number;
  backupRetentionDays: number;
  dedicatedTenancy: boolean;
}

// Financial calculated line-item breakdown
export interface PackageFinancialBreakdown {
  // Direct Cloud Costs
  directStorageCost: number;
  directEgressCost: number;
  directIopsCost: number;
  directComputeCost: number;
  directBackupCost: number;
  totalDirectCloudCost: number;

  // Operational & Platform Overhead
  platformMaintenanceFee: number;
  supportAndSlaFee: number;
  securityLicenseFee: number;
  paymentProcessingFee: number;
  totalOperationalCost: number;

  // Base Total Cost (Direct + Overhead)
  totalBaseCost: number;

  // Profit Margin (15%)
  profitMarginRate: number; // 0.15
  netProfitAmount: number; // totalBaseCost * 0.15

  // Retail Subtotal (Base + Profit)
  retailSubtotal: number;

  // Tax & Final Price
  vatAmount: number;
  finalPriceMonthly: number;
  finalPriceAnnualMonthlyEquivalent: number; // 20% annual discount applied
  annualTotalBilled: number;

  // Metrics
  grossMarginPercent: number; // (Retail - Direct) / Retail * 100
  netMarginPercent: number; // (Profit / Retail) * 100
}

// Full SaaS Package specification
export interface DerivedSaaSPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  badge?: string;
  popular?: boolean;
  resources: PackageResourceInput;
  financials: PackageFinancialBreakdown;
  featuresAr: string[];
  featuresEn: string[];
  overagePricing: {
    extraStoragePerGB: number;
    extraEgressPerGB: number;
    extraIOPSPer10k: number;
  };
}

// Provider invoice reconciliation model
export interface ProviderInvoiceItem {
  serviceId: string;
  serviceNameAr: string;
  serviceNameEn: string;
  category: 'compute' | 'storage' | 'egress' | 'iops' | 'license' | 'support';
  meteredUsage: string;
  expectedCostUSD: number;
  actualBilledUSD: number;
  varianceUSD: number;
  variancePercent: number;
  status: 'matched' | 'over_budget' | 'under_budget';
  optimizationTipAr: string;
  optimizationTipEn: string;
}

// FinOps Unit Economics KPIs
export interface FinOpsKPIs {
  totalActiveSubscribers: number;
  mrrUSD: number; // Monthly Recurring Revenue
  arrUSD: number; // Annual Recurring Revenue
  arpuUSD: number; // Average Revenue Per User
  blendedGrossMarginPercent: number;
  blendedNetMarginPercent: number; // Should hover ~15%
  estimatedCacUSD: number; // Customer Acquisition Cost
  cacPaybackMonths: number;
  ltvUSD: number; // Lifetime Value
  ltvToCacRatio: number;
  breakevenSubscribers: number;
}

// Monthly Spend Budget & Threshold Alert Configuration
export interface SpendThresholdConfig {
  enabled: boolean;
  monthlyBudgetUSD: number; // e.g. $50.00 or $500.00
  warningThresholdPercent: number; // e.g. 80% (Notify when projected reaches 80%)
  criticalThresholdPercent: number; // e.g. 100% (Notify when projected crosses 100%)
  notifyViaToast: boolean;
  notifyViaEmail: boolean;
  notifyViaWebhook: boolean;
  alertEmailRecipient: string;
  autoCapAtThreshold: boolean; // Virtual cost guardrails
  lastTriggeredAlert?: 'warning' | 'critical' | null;
  lastTriggeredAt?: string;
}

export interface SpendAlertHistoryItem {
  id: string;
  type: 'warning' | 'critical' | 'info';
  timestamp: string;
  projectedSpendUSD: number;
  budgetUSD: number;
  thresholdPercent: number;
  messageAr: string;
  messageEn: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export const DEFAULT_SPEND_THRESHOLD_CONFIG: SpendThresholdConfig = {
  enabled: true,
  monthlyBudgetUSD: 40.00, // $40.00 (~150 SAR)
  warningThresholdPercent: 75,
  criticalThresholdPercent: 95,
  notifyViaToast: true,
  notifyViaEmail: true,
  notifyViaWebhook: false,
  alertEmailRecipient: 'rawajtel4@gmail.com',
  autoCapAtThreshold: false,
  lastTriggeredAlert: null,
};
