export type FileCategory = 'all' | 'images' | 'videos' | 'documents' | 'archives' | 'vault' | 'shared' | 'offline' | 'trash';

export type FileType = 'image' | 'video' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'audio' | 'code';

export interface FileVersion {
  id: string;
  versionNumber: string;
  sizeBytes: number;
  modifiedAt: string;
  modifiedBy: string;
  checksum: string;
  changeNote: string;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string | null;
  sizeBytes: number;
  type: FileType;
  extension: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  checksum: string; // SHA-256
  isFavorite: boolean;
  isTrash: boolean;
  isVault: boolean;
  isOffline: boolean; // Virtual on-demand vs local pinned
  isShared: boolean;
  shareConfig?: {
    isPublic: boolean;
    shareUrl: string;
    hasPassword: boolean;
    password?: string;
    expiresAt?: string;
    allowDownload: boolean;
    accessLevel: 'view' | 'edit';
    collaborators: { email: string; role: 'viewer' | 'editor' }[];
  };
  versions: FileVersion[];
  thumbnailUrl?: string;
  mediaUrl?: string;
  previewContent?: string;
}

export interface FolderCollaborator {
  email: string;
  role: 'view' | 'edit';
  addedAt: string;
}

export interface FolderShareConfig {
  isShared: boolean;
  shareUrl: string;
  permission: 'view' | 'edit'; // (view-only vs editor)
  expiresAt?: string; // optional expiration date
  expiresInDays?: '1' | '7' | '30' | '90' | 'custom' | 'never';
  hasPassword?: boolean;
  password?: string;
  allowSubfolderCreation?: boolean;
  allowDownloadAll?: boolean;
  collaborators?: FolderCollaborator[];
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  color?: string;
  isVault?: boolean;
  isSyncPinned?: boolean; // Selective sync
  isShared?: boolean;
  shareConfig?: FolderShareConfig;
}

export interface UploadTask {
  id: string;
  file: File;
  name: string;
  totalBytes: number;
  uploadedBytes: number;
  chunksTotal: number;
  chunksCompleted: number;
  status: 'hashing' | 'uploading' | 'paused' | 'completed' | 'error' | 'deduplicated';
  speedBytesPerSec: number;
  etaSeconds: number;
  sha256?: string;
  isResuming?: boolean;
  errorMessage?: string;
}

export interface StorageQuota {
  usedBytes: number;
  totalBytes: number;
  breakdown: {
    images: number;
    videos: number;
    documents: number;
    archives: number;
    other: number;
  };
}

export interface TieredPricingRule {
  minStorageGB: number;
  maxStorageGB?: number; // undefined means unbounded/infinity
  unitPricePerGBUSD: number;
  tierNameAr: string;
  tierNameEn: string;
}

export interface PlanTier {
  id: string; // 'free' | 'personal' | 'pro' | 'flex' or custom plan ids
  nameAr: string;
  nameEn: string;
  storageGB: number;
  priceMonthlyUSD: number;
  priceAnnualUSD: number;
  priceFlexPerGB?: number;
  maxFileSizeGB: number;
  versionRetentionDays: number;
  vaultEnabled: boolean;
  familyMembers: number;
  badgeAr?: string;
  badgeEn?: string;
  featuresAr: string[];
  featuresEn: string[];
  // Extended resource limits & management
  isActive?: boolean;
  isPopular?: boolean;
  bandwidthEgressGB?: number; // e.g. 500 GB/month
  iopsLimitMonthly?: number; // in requests e.g. 100,000
  computeHoursLimit?: number; // vCPU-hours/month
  backupRetentionSnapshots?: number;
  overageStoragePerGBUSD?: number; // e.g. $0.015
  overageEgressPerGBUSD?: number; // e.g. $0.02
  tieredPricingRules?: TieredPricingRule[];
}

export interface UserSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'browser';
  os: string;
  browser: string;
  locationAr: string;
  locationEn: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface MediaBackupSettings {
  autoBackupEnabled: boolean;
  wifiOnly: boolean;
  chargingOnly: boolean;
  smartCompression: boolean; // Convert to WebP/HEIC
  includeVideos: boolean;
  lastSyncTimestamp: string;
  queuedMediaCount: number;
  totalSyncedCount: number;
}

export interface SecuritySettings {
  mfaEnabled: boolean;
  mfaSecret: string;
  passkeyRegistered: boolean;
  biometricEnabled: boolean;
  recoveryCodes: string[];
  vaultUnlocked: boolean;
  vaultMasterPin: string;
  vaultEncryptionType: 'AES-256-GCM / PBKDF2' | 'Argon2id + AES-256-GCM';
  autoWhatsAppVaultBackup: boolean; // Enables/disables automatic WhatsApp E2EE backup to encrypted vault
  autoWhatsAppVaultBackupFrequency?: 'realtime' | 'daily' | 'weekly';
  lastWhatsAppVaultBackupAt?: string;
  wifiOnlyWhatsAppVault?: boolean;
}

export interface SecurityAuditItem {
  id: string;
  actionAr: string;
  actionEn: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'warning' | 'denied';
  details: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amountUSD: number;
  status: 'paid' | 'pending' | 'failed';
  billingPeriod: string;
  paymentMethod: string;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planNameAr: string;
  planNameEn: string;
  storageGB: number;
  status: 'active' | 'pending' | 'canceled' | 'past_due';
  billingCycle: 'monthly' | 'annual';
  priceUSD: number;
  startDate: string;
  nextRenewalDate: string;
  paymentMethod: string;
  paymentMethodDetails: string;
  autoRenew: boolean;
  invoices: SubscriptionInvoice[];
}
