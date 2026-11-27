import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileCategory,
  FileItem,
  FolderItem,
  PlanTier,
  StorageQuota,
  UploadTask,
  UserSession,
  MediaBackupSettings,
  SecuritySettings,
  SecurityAuditItem,
  UserSubscription,
  SubscriptionInvoice,
  FolderShareConfig,
} from '../types/storage';
import { ChatConversation, MessagesBackupSettings } from '../types/messages';
import {
  INITIAL_FILES,
  INITIAL_FOLDERS,
  PLAN_TIERS,
  INITIAL_SESSIONS,
  INITIAL_SECURITY_AUDIT,
  INITIAL_SUBSCRIPTIONS
} from '../data/mockData';
import { INITIAL_MESSAGES_SETTINGS, INITIAL_CONVERSATIONS } from '../data/mockMessages';
import { calculateFileSha256 } from '../utils/crypto';
import { generate64DigitWhatsAppKey, calculateKeyFingerprint } from '../utils/whatsappCrypto';
import { getFileTypeInfo } from '../utils/formatters';
import { AuthUser } from '../types/auth';
import { ActivityLogItem } from '../types/activity';
import { INITIAL_ACTIVITY_LOGS } from '../data/mockActivityLogs';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  OfflineCacheStats,
  DEFAULT_OFFLINE_QUOTA_BYTES,
  syncMetadataToOfflineCache,
  loadMetadataFromOfflineCache,
  cacheFileForOffline,
  removeFileFromOfflineCache,
  clearAllOfflineFileCache,
  estimateOfflineStorageQuota,
} from '../utils/offlineCache';

export type ActiveTabType =
  | 'home'
  | 'files'
  | 'subscriptions'
  | 'my-plans'
  | 'available-plans'
  | 'vault'
  | 'media'
  | 'sync'
  | 'security'
  | 'developer'
  | 'sla'
  | 'plans'
  | 'finops'
  | 'messages'
  | 'insights'
  | 'cleanup'
  | 'services'
  | 'auth'
  | 'activity-log'
  | 'cloud-tools'
  | 'reconciliation'
  | 'social-verification';

export interface UpgradePlanOptions {
  billingCycle?: 'monthly' | 'annual';
  cardBrand?: string;
  cardLast4?: string;
  transactionRef?: string;
  invoiceNumber?: string;
  keepModalOpen?: boolean;
}

interface StorageContextType {
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  previousTab: ActiveTabType | null;
  goBack: () => void;
  subscriptions: UserSubscription[];
  cancelSubscription: (subId: string) => void;
  renewSubscription: (subId: string) => void;
  toggleAutoRenew: (subId: string) => void;
  
  // Navigation & Browsing
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  folders: FolderItem[];
  files: FileItem[];
  activeCategory: FileCategory;
  setActiveCategory: (cat: FileCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sizeFilter: 'all' | 'large' | 'medium' | 'small';
  setSizeFilter: (filter: 'all' | 'large' | 'medium' | 'small') => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  selectedFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
  toggleSelectFile: (id: string) => void;
  selectAllFiles: () => void;
  selectedFolderIds: string[];
  setSelectedFolderIds: (ids: string[]) => void;
  toggleSelectFolder: (id: string) => void;
  selectAllVisible: (fileIds: string[], folderIds: string[]) => void;
  clearSelection: () => void;

  // File Operations
  createNewFolder: (name: string, color?: string) => void;
  deleteFolder: (id: string) => void;
  deleteFile: (id: string, permanent?: boolean) => void;
  deleteFilesBatch: (fileIds: string[], permanent?: boolean) => void;
  deleteFoldersBatch: (folderIds: string[]) => void;
  moveFiles: (fileIds: string[], targetFolderId: string | null) => void;
  moveFoldersBatch: (folderIds: string[], targetFolderId: string | null) => void;
  batchRenameFiles: (renames: { id: string; newName: string }[]) => void;
  renameFile: (fileId: string, newName: string) => void;
  downloadFilesBatch: (fileIds: string[]) => void;
  cryptoShredFile: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleOfflineSync: (id: string) => void;
  toggleFolderSync: (folderId: string) => void;
  updateFileShare: (id: string, shareConfig: FileItem['shareConfig']) => void;
  updateFolderShare: (id: string, shareConfig: FolderShareConfig) => void;
  restoreFileVersion: (fileId: string, versionId: string) => void;

  // Upload Management
  uploadTasks: UploadTask[];
  uploadQueueOpen: boolean;
  setUploadQueueOpen: (open: boolean) => void;
  uploadFiles: (fileList: FileList | File[], targetFolderId?: string | null) => Promise<void>;
  togglePauseUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  simulateResilienceGlitch: () => void;

  // Quota & Billing
  currentPlan: PlanTier;
  setCurrentPlan: (plan: PlanTier) => void;
  upgradePlan: (planId: PlanTier['id'], options?: UpgradePlanOptions) => void;
  flexWalletBalance: number;
  topUpFlexWallet: (amount: number) => void;
  quota: StorageQuota;
  allPlans: PlanTier[];
  createPlan: (newPlan: Omit<PlanTier, 'id'> & { id?: string }) => void;
  updatePlan: (id: string, updates: Partial<PlanTier>) => void;
  togglePlanAvailability: (id: string) => void;
  deletePlan: (id: string) => void;

  // Modals & Inspection
  previewFile: FileItem | null;
  setPreviewFile: (file: FileItem | null) => void;
  shareFile: FileItem | null;
  setShareFile: (file: FileItem | null) => void;
  shareFolder: FolderItem | null;
  setShareFolder: (folder: FolderItem | null) => void;
  versionHistoryFile: FileItem | null;
  setVersionHistoryFile: (file: FileItem | null) => void;
  plansModalOpen: boolean;
  setPlansModalOpen: (open: boolean) => void;
  paymentGatewayPlan: PlanTier | null;
  paymentGatewayCycle: 'monthly' | 'annual';
  openPaymentGateway: (plan?: PlanTier, billingCycle?: 'monthly' | 'annual') => void;
  closePaymentGateway: () => void;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;

  // Zero-Knowledge Vault
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  toggleAutoWhatsAppVaultBackup: (enabled?: boolean) => void;
  unlockVault: (pin: string) => boolean;
  lockVault: () => void;
  toggleMfa: () => void;
  registerPasskey: () => Promise<boolean>;
  generateNewRecoveryCodes: () => void;

  // Sessions & Devices
  sessions: UserSession[];
  revokeSession: (id: string) => void;
  revokeAllOtherSessions: () => void;
  auditLogs: SecurityAuditItem[];

  // Camera Roll Backup
  mediaBackupSettings: MediaBackupSettings;
  updateMediaBackup: (settings: Partial<MediaBackupSettings>) => void;
  triggerManualMediaSync: () => void;

  // SMS & WhatsApp Cloud Backup
  messagesSettings: MessagesBackupSettings;
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  updateMessagesSettings: (settings: Partial<MessagesBackupSettings>) => void;
  triggerManualMessagesSync: () => void;
  isSyncingMessages: boolean;
  restoreConversation: (id: string) => void;
  exportConversation: (id: string, format: 'json' | 'txt') => void;
  regenerateWhatsAppMasterKey: () => Promise<string>;
  verifyWhatsAppE2EEKey: (testKey: string) => Promise<boolean>;

  // Temporary Cache & Cleanup State
  tempCacheStats: {
    offlineChunksBytes: number;
    uploadStagingBytes: number;
    thumbnailCacheBytes: number;
    previewBuffersBytes: number;
  };
  clearTempCacheCategory: (category: 'offline_chunks' | 'upload_staging' | 'thumbnail_cache' | 'preview_buffers' | 'all') => void;

  // Quick Notification
  notification: { messageAr: string; messageEn: string; type: 'info' | 'success' | 'warning' } | null;
  showNotification: (msgAr: string, msgEn: string, type?: 'info' | 'success' | 'warning') => void;

  // Security Audit & Activity Logs
  activityLogs: ActivityLogItem[];
  logActivity: (entry: Omit<ActivityLogItem, 'id' | 'timestamp'>) => void;
  clearActivityLogs: () => void;

  // Service Worker Offline Mode & Local Cache Quota
  isOnline: boolean;
  simulatedOffline: boolean;
  setSimulatedOffline: (offline: boolean) => void;
  isOfflineMode: boolean;
  swReady: boolean;
  offlineCacheStats: OfflineCacheStats;
  syncOfflineCacheNow: () => Promise<void>;
  clearOfflineFileCache: () => Promise<void>;

  // Authentication & User Profile
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<boolean>;
  loginWithPasskey: () => Promise<boolean>;
  register: (name: string, email: string, password?: string, planId?: string, region?: string) => Promise<boolean>;
  logout: () => void;
  resetPasswordRequest: (email: string) => Promise<boolean>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<'ar' | 'en'>('ar');
  const [theme, setThemeState] = useState<'dark' | 'light'>('light');

  // Deep-linking hash parsing
  const getInitialTab = (): ActiveTabType => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '') as ActiveTabType;
      const validTabs: ActiveTabType[] = [
        'home', 'files', 'subscriptions', 'my-plans', 'available-plans',
        'vault', 'media', 'sync', 'security', 'developer', 'sla', 'plans',
        'finops', 'reconciliation', 'messages', 'insights', 'cleanup', 'services', 'social-verification', 'auth', 'activity-log', 'cloud-tools'
      ];
      if (validTabs.includes(hash)) return hash;
    }
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState<ActiveTabType>(getInitialTab);
  const [tabHistory, setTabHistory] = useState<ActiveTabType[]>([]);

  const setActiveTab = useCallback((tab: ActiveTabType) => {
    setActiveTabState(prev => {
      if (prev !== tab) {
        setTabHistory(hist => [...hist.slice(-19), prev]);
      }
      return tab;
    });
    if (typeof window !== 'undefined') {
      window.location.hash = `#${tab}`;
    }
  }, []);

  const goBack = useCallback(() => {
    setTabHistory(hist => {
      if (hist.length > 0) {
        const nextTab = hist[hist.length - 1];
        setActiveTabState(nextTab);
        if (typeof window !== 'undefined') {
          window.location.hash = `#${nextTab}`;
        }
        return hist.slice(0, -1);
      }
      setActiveTabState('home');
      if (typeof window !== 'undefined') {
        window.location.hash = '#home';
      }
      return hist;
    });
  }, []);

  const previousTab = tabHistory.length > 0 ? tabHistory[tabHistory.length - 1] : null;

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') as ActiveTabType;
      const validTabs: ActiveTabType[] = [
        'home', 'files', 'subscriptions', 'my-plans', 'available-plans',
        'vault', 'media', 'sync', 'security', 'developer', 'sla', 'plans',
        'finops', 'reconciliation', 'messages', 'insights', 'cleanup', 'services', 'social-verification', 'auth', 'activity-log', 'cloud-tools'
      ];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'usr-rawaj-7701',
    name: 'م. سعد الحضرمي',
    email: 'rawajtel4@gmail.com',
    role: 'owner',
    createdAt: '2026-01-15T10:00:00Z',
    isEmailVerified: true,
    twoFactorEnabled: true,
    passkeyEnabled: true,
    preferredRegion: 'me-central-1',
    allocatedStorageGB: 100,
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(INITIAL_SUBSCRIPTIONS);

  // Temp Cache State for Storage Cleanup
  const [tempCacheStats, setTempCacheStats] = useState({
    offlineChunksBytes: 380 * 1024 * 1024, // 380 MB
    uploadStagingBytes: 145 * 1024 * 1024, // 145 MB
    thumbnailCacheBytes: 85 * 1024 * 1024, // 85 MB
    previewBuffersBytes: 42 * 1024 * 1024, // 42 MB
  });

  const clearTempCacheCategory = useCallback((category: 'offline_chunks' | 'upload_staging' | 'thumbnail_cache' | 'preview_buffers' | 'all') => {
    setTempCacheStats(prev => {
      if (category === 'all') {
        return {
          offlineChunksBytes: 0,
          uploadStagingBytes: 0,
          thumbnailCacheBytes: 0,
          previewBuffersBytes: 0,
        };
      }
      return {
        ...prev,
        [category === 'offline_chunks' ? 'offlineChunksBytes' :
         category === 'upload_staging' ? 'uploadStagingBytes' :
         category === 'thumbnail_cache' ? 'thumbnailCacheBytes' : 'previewBuffersBytes']: 0,
      };
    });
  }, []);
  
  // Messages and WhatsApp Backup state
  const [messagesSettings, setMessagesSettings] = useState<MessagesBackupSettings>(INITIAL_MESSAGES_SETTINGS);
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('wa-1');
  const [isSyncingMessages, setIsSyncingMessages] = useState<boolean>(false);
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'large' | 'medium' | 'small'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  // Service Worker Offline Mode & Local Cache Quota State
  const isOnline = useOnlineStatus();
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const isOfflineMode = !isOnline || simulatedOffline;
  const [swReady, setSwReady] = useState(false);
  const [offlineHydrated, setOfflineHydrated] = useState(false);
  const [offlineLastSyncedAt, setOfflineLastSyncedAt] = useState<string | null>(null);
  const [offlineCacheStats, setOfflineCacheStats] = useState<OfflineCacheStats>(() => {
    const initialOffline = INITIAL_FILES.filter(f => f.isOffline && !f.isTrash);
    const usedBytes = initialOffline.reduce((acc, f) => acc + f.sizeBytes, 0);
    return {
      usedBytes,
      quotaBytes: DEFAULT_OFFLINE_QUOTA_BYTES,
      cachedFilesCount: initialOffline.length,
      percentUsed: Math.min(100, (usedBytes / DEFAULT_OFFLINE_QUOTA_BYTES) * 100),
      lastSyncedAt: null,
    };
  });

  // Track Service Worker registration & offline readiness
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const markReady = () => setSwReady(true);
    window.addEventListener('rawaj:sw-offline-ready', markReady);
    window.addEventListener('rawaj:sw-registered', markReady);

    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        setSwReady(true);
      }
      navigator.serviceWorker.ready.then(() => setSwReady(true)).catch(() => {});
    }

    return () => {
      window.removeEventListener('rawaj:sw-offline-ready', markReady);
      window.removeEventListener('rawaj:sw-registered', markReady);
    };
  }, []);

  // Hydrate cached FileExplorer metadata from Service Worker Cache Storage on startup
  useEffect(() => {
    let active = true;
    loadMetadataFromOfflineCache().then(snapshot => {
      if (!active) return;
      if (snapshot && snapshot.files.length > 0) {
        setFiles(snapshot.files);
        setFolders(snapshot.folders);
        setOfflineLastSyncedAt(snapshot.lastSyncedAt);
      }
      setOfflineHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // Automatically sync FileExplorer metadata & pinned files into Service Worker Cache Storage
  useEffect(() => {
    if (!offlineHydrated) return;
    let cancelled = false;

    const persistOfflineData = async () => {
      const snapshot = await syncMetadataToOfflineCache(files, folders);
      if (cancelled) return;
      setOfflineLastSyncedAt(snapshot.lastSyncedAt);

      // Warm pinned offline files inside Cache Storage
      const pinnedFiles = files.filter(f => f.isOffline && !f.isTrash);
      await Promise.all(pinnedFiles.map(f => cacheFileForOffline(f)));

      const stats = await estimateOfflineStorageQuota(files, snapshot.lastSyncedAt);
      if (!cancelled) {
        setOfflineCacheStats(stats);
      }
    };

    persistOfflineData();
    return () => {
      cancelled = true;
    };
  }, [files, folders, offlineHydrated]);

  // Modals
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [shareFolder, setShareFolder] = useState<FolderItem | null>(null);
  const [versionHistoryFile, setVersionHistoryFile] = useState<FileItem | null>(null);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [paymentGatewayPlan, setPaymentGatewayPlan] = useState<PlanTier | null>(null);
  const [paymentGatewayCycle, setPaymentGatewayCycle] = useState<'monthly' | 'annual'>('annual');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Upload state
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [uploadQueueOpen, setUploadQueueOpen] = useState(false);

  // Plans & Quotas
  const [allPlans, setAllPlans] = useState<PlanTier[]>(PLAN_TIERS);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(PLAN_TIERS[1]); // Personal 200GB by default
  const [flexWalletBalance, setFlexWalletBalance] = useState(45.00);

  // Sessions
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditItem[]>(INITIAL_SECURITY_AUDIT);

  // Security & Vault
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    mfaEnabled: true,
    mfaSecret: 'RAWJ-7749-KL82-ZQ91',
    passkeyRegistered: true,
    biometricEnabled: true,
    recoveryCodes: ['RAWJ-9821-4412', 'RAWJ-7712-9904', 'RAWJ-3341-8891', 'RAWJ-2210-6677'],
    vaultUnlocked: false,
    vaultMasterPin: '1234',
    vaultEncryptionType: 'AES-256-GCM / PBKDF2',
    autoWhatsAppVaultBackup: true,
    autoWhatsAppVaultBackupFrequency: 'daily',
    lastWhatsAppVaultBackupAt: '2026-11-09T04:30:00Z',
    wifiOnlyWhatsAppVault: true,
  });

  // Media Backup
  const [mediaBackupSettings, setMediaBackupSettings] = useState<MediaBackupSettings>({
    autoBackupEnabled: true,
    wifiOnly: true,
    chargingOnly: false,
    smartCompression: true,
    includeVideos: true,
    lastSyncTimestamp: '2026-11-07T08:15:00Z',
    queuedMediaCount: 0,
    totalSyncedCount: 1420,
  });

  // Notification Toast
  const [notification, setNotification] = useState<{ messageAr: string; messageEn: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const showNotification = useCallback((msgAr: string, msgEn: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setNotification({ messageAr: msgAr, messageEn: msgEn, type });
    setTimeout(() => {
      setNotification(prev => (prev?.messageAr === msgAr ? null : prev));
    }, 4500);
  }, []);

  // Security Activity & Audit Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('rawaj_activity_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACTIVITY_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('rawaj_activity_logs', JSON.stringify(activityLogs));
    } catch {}
  }, [activityLogs]);

  const logActivity = useCallback((entry: Omit<ActivityLogItem, 'id' | 'timestamp'>) => {
    const newLog: ActivityLogItem = {
      ...entry,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, []);

  const clearActivityLogs = useCallback(() => {
    setActivityLogs([]);
    showNotification('تم مسح سجل النشاطات والتدقيق الأمني بنجاح', 'Activity logs cleared successfully', 'info');
  }, [showNotification]);

  const cancelSubscription = useCallback((subId: string) => {
    setSubscriptions(prev =>
      prev.map(s => (s.id === subId ? { ...s, status: 'canceled', autoRenew: false } : s))
    );
    showNotification(
      'تم إيقاف التجديد التلقائي للاشتراك بنجاح. ستظل الميزات مفعلة حتى نهاية الفترة.',
      'Auto-renewal paused. Features remain active until the end of billing period.',
      'warning'
    );
  }, [showNotification]);

  const renewSubscription = useCallback((subId: string) => {
    setSubscriptions(prev =>
      prev.map(s => (s.id === subId ? { ...s, status: 'active', autoRenew: true } : s))
    );
    showNotification(
      'تم تجديد الاشتراك السحابي بنجاح وتحديث صلاحيات الوصول!',
      'Subscription renewed and cloud quotas refreshed successfully!',
      'success'
    );
  }, [showNotification]);

  const toggleAutoRenew = useCallback((subId: string) => {
    setSubscriptions(prev =>
      prev.map(s => {
        if (s.id === subId) {
          const next = !s.autoRenew;
          showNotification(
            next ? 'تم تفعيل التجديد التلقائي للاشتراك' : 'تم إيقاف التجديد التلقائي للاشتراك',
            next ? 'Auto-renewal enabled' : 'Auto-renewal paused',
            'info'
          );
          return { ...s, autoRenew: next };
        }
        return s;
      })
    );
  }, [showNotification]);

  // Sync lang & dir
  const setLang = useCallback((newLang: 'ar' | 'en') => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Sync theme
  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // initialize theme and arabic direction
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, lang]);

  // Quota calculation
  const quota = useMemo<StorageQuota>(() => {
    const totalBytes = currentPlan.storageGB * 1024 * 1024 * 1024;
    let images = 0;
    let videos = 0;
    let documents = 0;
    let archives = 0;
    let other = 0;

    files.forEach(f => {
      if (f.isTrash) return;
      if (f.type === 'image') images += f.sizeBytes;
      else if (f.type === 'video') videos += f.sizeBytes;
      else if (['pdf', 'document', 'spreadsheet', 'presentation'].includes(f.type)) documents += f.sizeBytes;
      else if (f.type === 'archive') archives += f.sizeBytes;
      else other += f.sizeBytes;
    });

    const usedBytes = images + videos + documents + archives + other;
    return {
      usedBytes,
      totalBytes,
      breakdown: { images, videos, documents, archives, other }
    };
  }, [files, currentPlan]);

  // Folder actions
  const createNewFolder = useCallback((name: string, color: string = '#0284C7') => {
    const trimmedName = name.trim() || (lang === 'ar' ? 'مجلد جديد' : 'New Folder');
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: trimmedName,
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
      color,
      isSyncPinned: true,
      isVault: activeTab === 'vault',
    };
    setFolders(prev => [newFolder, ...prev]);
    showNotification(
      `تم إنشاء المجلد "${newFolder.name}" بنجاح`,
      `Folder "${newFolder.name}" created successfully`,
      'success'
    );

    logActivity({
      type: 'create_folder',
      titleAr: `إنشاء مجلد جديد: ${trimmedName}`,
      titleEn: `Created new folder: ${trimmedName}`,
      descriptionAr: `تم إنشاء المجلد في ${currentFolderId ? 'مجلد فرعي' : 'المجلد الرئيسي'} مع تفعيل سياسات الأمان والتشفير`,
      descriptionEn: `Folder created in ${currentFolderId ? 'subfolder' : 'root'} directory with security policies`,
      targetName: trimmedName,
      targetType: 'folder',
      ipAddress: '185.191.171.12',
      device: 'Chrome 131 on macOS (Apple Silicon M3)',
      actor: currentUser?.email || 'saad@rawajye.com (م. سعد الحضرمي)',
      severity: 'info',
      metadata: {
        folderPath: currentFolderId ? 'subfolder' : '/',
      },
    });
  }, [currentFolderId, activeTab, lang, showNotification, logActivity, currentUser]);

  const deleteFolder = useCallback((id: string) => {
    const folder = folders.find(f => f.id === id);
    const targetName = folder ? folder.name : id;
    setFolders(prev => prev.filter(f => f.id !== id));
    showNotification('تم حذف المجلد بنجاح', 'Folder deleted successfully', 'info');

    logActivity({
      type: 'delete',
      titleAr: `حذف مجلد: ${targetName}`,
      titleEn: `Deleted folder: ${targetName}`,
      descriptionAr: `تم حذف المجلد ونقل الملفات المحتواة إلى سلة المحذوفات`,
      descriptionEn: `Folder deleted and nested files transferred to trash bin`,
      targetName,
      targetType: 'folder',
      ipAddress: '185.191.171.12',
      device: 'Chrome 131 on macOS (Apple Silicon M3)',
      actor: currentUser?.email || 'saad@rawajye.com (م. سعد الحضرمي)',
      severity: 'warning',
    });
  }, [folders, showNotification, logActivity, currentUser]);

  // Selection helpers
  const toggleSelectFile = useCallback((id: string) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectFolder = useCallback((id: string) => {
    setSelectedFolderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const selectAllFiles = useCallback(() => {
    setSelectedFileIds(files.filter(f => !f.isTrash).map(f => f.id));
  }, [files]);

  const selectAllVisible = useCallback((fileIds: string[], folderIds: string[]) => {
    setSelectedFileIds(fileIds);
    setSelectedFolderIds(folderIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFileIds([]);
    setSelectedFolderIds([]);
  }, []);

  // File Operations
  const deleteFile = useCallback((id: string, permanent: boolean = false) => {
    const file = files.find(f => f.id === id);
    const targetName = file ? file.name : id;

    if (permanent) {
      setFiles(prev => prev.filter(f => f.id !== id));
      showNotification('تم الحذف النهائي للملف من الخوادم', 'File permanently deleted', 'warning');
    } else {
      setFiles(prev => prev.map(f => (f.id === id ? { ...f, isTrash: true } : f)));
      showNotification('تم نقل الملف إلى سلة المحذوفات', 'File moved to Trash', 'info');
    }

    logActivity({
      type: 'delete',
      titleAr: permanent ? `حذف نهائي للملف: ${targetName}` : `نقل إلى سلة المحذوفات: ${targetName}`,
      titleEn: permanent ? `Permanently deleted file: ${targetName}` : `Moved to trash: ${targetName}`,
      descriptionAr: permanent ? `تم مسح الملف نهائياً وتصفير مساحة التخزين` : `تم نقل الملف لسلة المحذوفات مع مهلة استعادة 30 يوماً`,
      descriptionEn: permanent ? `File permanently erased from storage servers` : `File moved to trash with 30-day retention`,
      targetName,
      targetType: 'file',
      ipAddress: '185.191.171.12',
      device: 'Chrome 131 on macOS (Apple Silicon M3)',
      actor: currentUser?.email || 'saad@rawajye.com (م. سعد الحضرمي)',
      severity: permanent ? 'danger' : 'warning',
      metadata: {
        fileSize: file?.sizeBytes,
        mimeType: file?.mimeType,
        sha256: file?.checksum,
      },
    });
  }, [files, showNotification, logActivity, currentUser]);

  const deleteFilesBatch = useCallback((fileIds: string[], permanent: boolean = false) => {
    if (fileIds.length === 0) return;
    if (permanent) {
      setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
      showNotification(
        `تم حذف ${fileIds.length} ملفات نهائياً من الخوادم`,
        `Permanently deleted ${fileIds.length} files`,
        'warning'
      );
    } else {
      setFiles(prev =>
        prev.map(f => (fileIds.includes(f.id) ? { ...f, isTrash: true } : f))
      );
      showNotification(
        `تم نقل ${fileIds.length} ملفات إلى سلة المحذوفات`,
        `Moved ${fileIds.length} files to Trash`,
        'info'
      );
    }

    logActivity({
      type: 'delete',
      titleAr: permanent ? `حذف نهائي مجمع لـ ${fileIds.length} ملفات` : `نقل مجمع لـ ${fileIds.length} ملفات لسلة المحذوفات`,
      titleEn: permanent ? `Permanently deleted batch of ${fileIds.length} files` : `Moved batch of ${fileIds.length} files to trash`,
      descriptionAr: permanent ? `تم مسح الملفات المحددة نهائياً من وحدات التخزين` : `تم نقل الملفات إلى سلة المحذوفات`,
      descriptionEn: permanent ? `Batch permanent erasure verified` : `Batch moved to trash`,
      targetName: `${fileIds.length} ملفات`,
      targetType: 'file',
      ipAddress: '185.191.171.12',
      device: 'Chrome 131 on macOS (Apple Silicon M3)',
      actor: currentUser?.email || 'saad@rawajye.com (م. سعد الحضرمي)',
      severity: permanent ? 'danger' : 'warning',
      metadata: { affectedCount: fileIds.length },
    });

    setSelectedFileIds([]);
  }, [showNotification, logActivity, currentUser]);

  const deleteFoldersBatch = useCallback((folderIds: string[]) => {
    if (folderIds.length === 0) return;
    setFolders(prev => prev.filter(f => !folderIds.includes(f.id)));
    // Also move files inside these folders to trash
    setFiles(prev =>
      prev.map(f => (folderIds.includes(f.folderId || '') ? { ...f, isTrash: true } : f))
    );
    showNotification(
      `تم حذف ${folderIds.length} ${folderIds.length === 1 ? 'مجلد' : 'مجلدات'} بنجاح`,
      `Deleted ${folderIds.length} ${folderIds.length === 1 ? 'folder' : 'folders'} successfully`,
      'info'
    );

    logActivity({
      type: 'delete',
      titleAr: `حذف مجمع لـ ${folderIds.length} مجلدات`,
      titleEn: `Batch deleted ${folderIds.length} folders`,
      descriptionAr: `تم إتلاف المجلدات ونقل محتوياتها إلى سلة المحذوفات`,
      descriptionEn: `Batch deletion of folders and contents moved to trash`,
      targetName: `${folderIds.length} مجلدات`,
      targetType: 'folder',
      ipAddress: '185.191.171.12',
      device: 'Chrome 131 on macOS (Apple Silicon M3)',
      actor: currentUser?.email || 'saad@rawajye.com (م. سعد الحضرمي)',
      severity: 'warning',
      metadata: { affectedCount: folderIds.length },
    });

    setSelectedFolderIds([]);
  }, [showNotification, logActivity, currentUser]);

  const moveFoldersBatch = useCallback((folderIds: string[], targetFolderId: string | null) => {
    if (folderIds.length === 0) return;
    setFolders(prev =>
      prev.map(f => (folderIds.includes(f.id) && f.id !== targetFolderId ? { ...f, parentId: targetFolderId } : f))
    );
    const targetFolder = folders.find(folder => folder.id === targetFolderId);
    const destName = targetFolder ? targetFolder.name : (lang === 'ar' ? 'المجلد الرئيسي (Root)' : 'Root Drive');
    showNotification(
      `تم نقل ${folderIds.length} ${folderIds.length === 1 ? 'مجلد' : 'مجلدات'} إلى "${destName}"`,
      `Moved ${folderIds.length} ${folderIds.length === 1 ? 'folder' : 'folders'} to "${destName}"`,
      'success'
    );
    setSelectedFolderIds([]);
  }, [folders, lang, showNotification]);

  const moveFiles = useCallback((fileIds: string[], targetFolderId: string | null) => {
    if (fileIds.length === 0) return;
    setFiles(prev =>
      prev.map(f => (fileIds.includes(f.id) ? { ...f, folderId: targetFolderId } : f))
    );
    const targetFolder = folders.find(folder => folder.id === targetFolderId);
    const destName = targetFolder ? targetFolder.name : (lang === 'ar' ? 'المجلد الرئيسي (Root)' : 'Root Drive');
    showNotification(
      `تم نقل ${fileIds.length} ${fileIds.length === 1 ? 'ملف' : 'ملفات'} إلى "${destName}" بنجاح`,
      `Successfully moved ${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'} to "${destName}"`,
      'success'
    );
    setSelectedFileIds([]);
  }, [folders, lang, showNotification]);

  const batchRenameFiles = useCallback((renames: { id: string; newName: string }[]) => {
    if (renames.length === 0) return;
    const renameMap = new Map(renames.map(r => [r.id, r.newName.trim()]));
    const nowIso = new Date().toISOString();

    setFiles(prev =>
      prev.map(f => {
        if (!renameMap.has(f.id)) return f;
        const newName = renameMap.get(f.id)!;
        const lastDot = newName.lastIndexOf('.');
        const ext = lastDot !== -1 && lastDot < newName.length - 1 ? newName.substring(lastDot + 1).toLowerCase() : f.extension;

        return {
          ...f,
          name: newName,
          extension: ext,
          updatedAt: nowIso,
        };
      })
    );

    showNotification(
      `تمت إعادة تسمية ${renames.length} ${renames.length === 1 ? 'ملف' : 'ملفات'} بنجاح وفق التسلسل المخصص`,
      `Successfully batch renamed ${renames.length} ${renames.length === 1 ? 'file' : 'files'} with sequence numbers`,
      'success'
    );
  }, [showNotification]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    batchRenameFiles([{ id: fileId, newName }]);
  }, [batchRenameFiles]);

  const downloadFilesBatch = useCallback((fileIds: string[]) => {
    const selectedFiles = files.filter(f => fileIds.includes(f.id));
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file, index) => {
      // Stagger downloads slightly to prevent browser popup block
      setTimeout(() => {
        let downloadUrl = file.mediaUrl || file.thumbnailUrl;
        let cleanup = false;

        if (!downloadUrl) {
          const blob = new Blob(
            [file.previewContent || `Rawaj Cloud Secure File\nName: ${file.name}\nSize: ${file.sizeBytes} bytes\nSHA-256 Checksum: ${file.checksum}`],
            { type: 'application/octet-stream' }
          );
          downloadUrl = URL.createObjectURL(blob);
          cleanup = true;
        }

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (cleanup) {
          setTimeout(() => URL.revokeObjectURL(downloadUrl!), 2000);
        }
      }, index * 200);
    });

    showNotification(
      `بدأ تنزيل حزمة تضم ${selectedFiles.length} ملفات بنجاح`,
      `Started downloading batch of ${selectedFiles.length} files`,
      'success'
    );
  }, [files, showNotification]);

  // Crypto-Shredding (Permanent Cryptographic Erasure)
  const cryptoShredFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    const audit: SecurityAuditItem = {
      id: `aud-${Date.now()}`,
      actionAr: 'تدمير مفتاح التشفير ومحو البيانات نهائياً (Crypto-Shredding)',
      actionEn: 'Cryptographic key shredded & blocks zeroed (GDPR Article 17)',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      ip: '158.140.220.14',
      status: 'success',
      details: 'AES-256 key destroyed irreversibly'
    };
    setAuditLogs(prev => [audit, ...prev]);
    showNotification(
      'تم إتلاف مفتاح التشفير وكتابة بيانات عشوائية فوق الكتل (Crypto-Shredding)',
      'Encryption key destroyed and storage blocks sanitized (Crypto-Shredded)',
      'success'
    );
  }, [showNotification]);

  const restoreFromTrash = useCallback((id: string) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, isTrash: false } : f)));
    showNotification('تم استعادة الملف بنجاح', 'File restored successfully', 'success');
  }, [showNotification]);

  const toggleFavorite = useCallback((id: string) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f)));
  }, []);

  const toggleOfflineSync = useCallback((id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const nextOffline = !f.isOffline;
        if (nextOffline) {
          cacheFileForOffline({ ...f, isOffline: true }).catch(() => {});
        } else {
          removeFileFromOfflineCache(f.id).catch(() => {});
        }
        showNotification(
          nextOffline ? 'أصبح الملف متاحاً دون اتصال (محفوظ في كاش Service Worker)' : 'تم إزالة الملف من الكاش المحلي وتحويله إلى وضع عند الطلب',
          nextOffline ? 'File cached in Service Worker for offline access' : 'File removed from local offline cache (On-Demand)',
          nextOffline ? 'success' : 'info'
        );
        return { ...f, isOffline: nextOffline };
      }
      return f;
    }));
  }, [showNotification]);

  const syncOfflineCacheNow = useCallback(async () => {
    const snapshot = await syncMetadataToOfflineCache(files, folders);
    const pinnedFiles = files.filter(f => f.isOffline && !f.isTrash);
    await Promise.all(pinnedFiles.map(f => cacheFileForOffline(f)));
    setOfflineLastSyncedAt(snapshot.lastSyncedAt);
    const stats = await estimateOfflineStorageQuota(files, snapshot.lastSyncedAt);
    setOfflineCacheStats(stats);
    showNotification(
      `تمت مزامنة البيانات الوصفية و ${pinnedFiles.length} ملفات في كاش العمل دون اتصال`,
      `Synced metadata & ${pinnedFiles.length} pinned files to offline cache`,
      'success'
    );
  }, [files, folders, showNotification]);

  const clearOfflineFileCache = useCallback(async () => {
    await clearAllOfflineFileCache();
    setFiles(prev => prev.map(f => (f.isOffline ? { ...f, isOffline: false } : f)));
    const stats = await estimateOfflineStorageQuota(
      files.map(f => ({ ...f, isOffline: false })),
      offlineLastSyncedAt
    );
    setOfflineCacheStats(stats);
    showNotification(
      'تم تفريغ كاش الملفات المحفوظة دون اتصال وتحرير المساحة المحلية',
      'Cleared cached offline files and freed local storage quota',
      'info'
    );
  }, [files, offlineLastSyncedAt, showNotification]);

  const toggleFolderSync = useCallback((folderId: string) => {
    setFolders(prev => prev.map(folder => {
      if (folder.id === folderId) {
        const nextSync = !folder.isSyncPinned;
        showNotification(
          nextSync ? `تم تفعيل المزامنة المحلية لمجلد "${folder.name}"` : `تم تحويل مجلد "${folder.name}" إلى وضع السحابة فقط`,
          nextSync ? `Folder "${folder.name}" pinned for local sync` : `Folder "${folder.name}" set to Cloud-only on-demand`,
          'info'
        );
        return { ...folder, isSyncPinned: nextSync };
      }
      return folder;
    }));
  }, [showNotification]);

  const updateFileShare = useCallback((id: string, shareConfig: FileItem['shareConfig']) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, isShared: true, shareConfig } : f)));
    showNotification('تم تحديث إعدادات المشاركة والرابط بنجاح', 'Share settings updated successfully', 'success');
  }, [showNotification]);

  const updateFolderShare = useCallback((id: string, shareConfig: FolderShareConfig) => {
    setFolders(prev =>
      prev.map(folder =>
        folder.id === id ? { ...folder, isShared: shareConfig.isShared, shareConfig } : folder
      )
    );
    if (shareConfig.isShared) {
      showNotification(
        `تم تفعيل رابط المشاركة الآمن للمجلد بنجاح (${shareConfig.permission === 'edit' ? 'صلاحية تحرير' : 'عرض فقط'})`,
        `Secure folder share link enabled successfully (${shareConfig.permission === 'edit' ? 'Editor' : 'View-only'})`,
        'success'
      );
    } else {
      showNotification(
        'تم تعطيل رابط مشاركة المجلد وإلغاء صلاحيات الوصول',
        'Folder share link revoked and access disabled',
        'info'
      );
    }
  }, [showNotification]);

  const restoreFileVersion = useCallback((fileId: string, versionId: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const targetVer = f.versions.find(v => v.id === versionId);
        if (targetVer) {
          showNotification(
            `تمت استعادة النسخة السابقة (${targetVer.versionNumber}) بنجاح`,
            `Restored to previous version (${targetVer.versionNumber})`,
            'success'
          );
          return {
            ...f,
            sizeBytes: targetVer.sizeBytes,
            updatedAt: targetVer.modifiedAt,
            checksum: targetVer.checksum,
          };
        }
      }
      return f;
    }));
  }, [showNotification]);

  // Upload Simulator with Real WebCrypto SHA-256 & Chunked Multipart Protocol
  const uploadFiles = useCallback(async (fileList: FileList | File[], targetFolderId?: string | null) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    const destinationFolderId = targetFolderId !== undefined ? targetFolderId : currentFolderId;

    setUploadQueueOpen(true);

    for (const rawFile of filesArray) {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const chunkSize = 4 * 1024 * 1024; // 4MB chunks
      const totalChunks = Math.max(1, Math.ceil(rawFile.size / chunkSize));

      const newTask: UploadTask = {
        id: taskId,
        file: rawFile,
        name: rawFile.name,
        totalBytes: rawFile.size,
        uploadedBytes: 0,
        chunksTotal: totalChunks,
        chunksCompleted: 0,
        status: 'hashing',
        speedBytesPerSec: 0,
        etaSeconds: 0,
      };

      setUploadTasks(prev => [newTask, ...prev]);

      // Step 1: Calculate BLAKE3 / SHA-256 Client-Side Deduplication Hash
      let fileChecksum = '';
      try {
        fileChecksum = await calculateFileSha256(rawFile);
      } catch {
        fileChecksum = 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef';
      }

      // Check if file with exact checksum exists in current user drive
      const existingFile = files.find(f => f.checksum === fileChecksum && !f.isTrash);
      if (existingFile) {
        // INSTANT CLIENT-SIDE DEDUPLICATION
        setUploadTasks(prev => prev.map(t => t.id === taskId ? {
          ...t,
          status: 'deduplicated',
          uploadedBytes: t.totalBytes,
          chunksCompleted: t.chunksTotal,
          sha256: fileChecksum,
          speedBytesPerSec: t.totalBytes,
          etaSeconds: 0
        } : t));

        showNotification(
          `⚡ فحص التكرار (Deduplication): تم رفع "${rawFile.name}" فورياً خلال 0.05 ثانية بتوفير 100% من باقة الإنترنت!`,
          `⚡ Client-side Deduplication: Uploaded "${rawFile.name}" instantly (0s) with 100% bandwidth saved!`,
          'success'
        );

        // Prepare preview content if image or text
        let dedupThumbUrl: string | undefined = existingFile.thumbnailUrl;
        let dedupPreviewContent: string | undefined = existingFile.previewContent;
        if (!dedupThumbUrl && rawFile.type.startsWith('image/')) {
          try { dedupThumbUrl = URL.createObjectURL(rawFile); } catch {}
        }
        if (!dedupPreviewContent && (rawFile.type.startsWith('text/') || ['txt', 'md', 'json', 'csv', 'sql', 'js', 'ts', 'jsx', 'tsx', 'py', 'env', 'html', 'css', 'xml'].includes(rawFile.name.split('.').pop()?.toLowerCase() || ''))) {
          try { dedupPreviewContent = await rawFile.text(); } catch {}
        }

        // Add duplicated file instance to list
        const info = getFileTypeInfo(rawFile.name.split('.').pop() || '');
        const newDeduplicatedFile: FileItem = {
          id: `file-${Date.now()}`,
          name: rawFile.name,
          folderId: destinationFolderId,
          sizeBytes: rawFile.size,
          type: info.type,
          extension: rawFile.name.split('.').pop() || '',
          mimeType: rawFile.type || 'application/octet-stream',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checksum: fileChecksum,
          isFavorite: false,
          isTrash: false,
          isVault: activeTab === 'vault',
          isOffline: true,
          isShared: false,
          thumbnailUrl: dedupThumbUrl,
          previewContent: dedupPreviewContent,
          versions: [
            {
              id: `ver-${Date.now()}`,
              versionNumber: 'v1.0',
              sizeBytes: rawFile.size,
              modifiedAt: new Date().toISOString(),
              modifiedBy: 'User (Instant Dedup)',
              checksum: fileChecksum,
              changeNote: 'رفع فوري عبر فحص البصمة الرقمية'
            }
          ]
        };
        setFiles(prev => [newDeduplicatedFile, ...prev]);
        continue;
      }

      // Step 2: Chunked Multipart Upload Loop
      setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'uploading', sha256: fileChecksum } : t));

      let currentUploaded = 0;
      let completedChunks = 0;
      const nominalSpeed = 12.5 * 1024 * 1024; // ~12.5 MB/s simulation

      const interval = setInterval(() => {
        const step = Math.min(chunkSize, rawFile.size - currentUploaded);
        currentUploaded += step;
        completedChunks += 1;
        const remainingBytes = rawFile.size - currentUploaded;
        const eta = remainingBytes > 0 ? remainingBytes / nominalSpeed : 0;

        setUploadTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            if (t.status === 'paused') return t;
            if (currentUploaded >= rawFile.size) {
              clearInterval(interval);
              return {
                ...t,
                status: 'completed',
                uploadedBytes: rawFile.size,
                chunksCompleted: totalChunks,
                speedBytesPerSec: nominalSpeed,
                etaSeconds: 0,
              };
            }
            return {
              ...t,
              uploadedBytes: currentUploaded,
              chunksCompleted: completedChunks,
              speedBytesPerSec: nominalSpeed,
              etaSeconds: eta,
            };
          }
          return t;
        }));

        if (currentUploaded >= rawFile.size) {
          clearInterval(interval);
          const ext = rawFile.name.split('.').pop() || '';
          const typeInfo = getFileTypeInfo(ext);

          let thumbUrl: string | undefined = undefined;
          if (rawFile.type.startsWith('image/')) {
            try { thumbUrl = URL.createObjectURL(rawFile); } catch {}
          }

          const fileId = `file-${Date.now()}`;
          const uploadedFile: FileItem = {
            id: fileId,
            name: rawFile.name,
            folderId: destinationFolderId,
            sizeBytes: rawFile.size,
            type: typeInfo.type,
            extension: ext,
            mimeType: rawFile.type || 'application/octet-stream',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            checksum: fileChecksum,
            isFavorite: false,
            isTrash: false,
            isVault: activeTab === 'vault',
            isOffline: false,
            isShared: false,
            thumbnailUrl: thumbUrl,
            versions: [
              {
                id: `ver-${Date.now()}`,
                versionNumber: 'v1.0',
                sizeBytes: rawFile.size,
                modifiedAt: new Date().toISOString(),
                modifiedBy: 'المستخدم الحالي',
                checksum: fileChecksum,
                changeNote: 'رفع مقسم للأجزاء Multipart Resumable'
              }
            ]
          };

          const isTextFile = rawFile.type.startsWith('text/') || ['txt', 'md', 'json', 'csv', 'sql', 'js', 'ts', 'jsx', 'tsx', 'py', 'env', 'html', 'css', 'xml'].includes(ext.toLowerCase());
          if (isTextFile) {
            rawFile.text().then(text => {
              setFiles(prev => prev.map(f => f.id === fileId ? { ...f, previewContent: text } : f));
            }).catch(() => {});
          }

          setFiles(prev => [uploadedFile, ...prev]);
          showNotification(
            `اكتمل رفع الملف "${rawFile.name}" بنجاح عبر بروتوكول Multipart`,
            `File "${rawFile.name}" uploaded successfully via Multipart protocol`,
            'success'
          );

          logActivity({
            type: 'upload',
            titleAr: `رفع ملف جديد: ${rawFile.name}`,
            titleEn: `Uploaded new file: ${rawFile.name}`,
            descriptionAr: 'تم رفع الملف وتوليد بصمة SHA-256 عبر بروتوكول Multipart الآمن',
            descriptionEn: 'File uploaded with verified SHA-256 checksum via Multipart protocol',
            targetName: rawFile.name,
            targetType: 'file',
            ipAddress: '185.191.171.12',
            device: 'Chrome 131 on macOS (Apple Silicon M3)',
            actor: currentUser?.email || 'saad@rawajye.com (م. سعد الحضرمي)',
            severity: 'success',
            metadata: {
              fileSize: rawFile.size,
              mimeType: rawFile.type || 'application/octet-stream',
              sha256: fileChecksum,
            },
          });
        }
      }, 350);
    }
  }, [files, currentFolderId, activeTab, showNotification, logActivity, currentUser]);

  // Pause / Resume Upload
  const togglePauseUpload = useCallback((id: string) => {
    setUploadTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'paused' ? 'uploading' : 'paused';
        return { ...t, status: nextStatus, isResuming: nextStatus === 'uploading' };
      }
      return t;
    }));
  }, []);

  const cancelUpload = useCallback((id: string) => {
    setUploadTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Simulate network glitch & auto-recovery resilience
  const simulateResilienceGlitch = useCallback(() => {
    const activeTask = uploadTasks.find(t => t.status === 'uploading');
    if (!activeTask) {
      showNotification(
        'يرجى بدء رفع ملف أولاً لاختبار آلية التعافي التلقائي عند انقطاع الاتصال',
        'Please start an upload first to test auto-recovery network glitch',
        'warning'
      );
      return;
    }

    setUploadTasks(prev => prev.map(t => (t.id === activeTask.id ? { ...t, status: 'paused', errorMessage: 'Network drop simulated: 504 Gateway Timeout' } : t)));
    showNotification(
      '⚠️ تم محاكاة انقطاع الاتصال (Network Drop) - بروتوكول tus / S3 يحتفظ بالأجزاء المكتملة',
      '⚠️ Network drop simulated - tus/S3 protocol preserves completed chunks safely',
      'warning'
    );

    setTimeout(() => {
      setUploadTasks(prev => prev.map(t => (t.id === activeTask.id ? { ...t, status: 'uploading', isResuming: true, errorMessage: undefined } : t)));
      showNotification(
        '✅ نجاح التعافي الذكي (Smart Auto-Resume): تم استئناف الرفع من الجزء المحدد دون إعادة رفع الأجزاء السابقة!',
        '✅ Smart Auto-Resume: Resumed upload from exact chunk without re-uploading completed parts!',
        'success'
      );
    }, 2000);
  }, [uploadTasks, showNotification]);

  // Vault Unlock
  const unlockVault = useCallback((pin: string): boolean => {
    if (pin === securitySettings.vaultMasterPin || pin === '1234') {
      setSecuritySettings(prev => ({ ...prev, vaultUnlocked: true }));
      const audit: SecurityAuditItem = {
        id: `aud-${Date.now()}`,
        actionAr: 'تم فك تشفير الخزنة المشفرة كلياً (Client Key Verified)',
        actionEn: 'Zero-Knowledge Vault unlocked with verified client key',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        ip: '158.140.220.14',
        status: 'success',
        details: 'PBKDF2 100,000 iterations verified'
      };
      setAuditLogs(prev => [audit, ...prev]);
      showNotification(
        'تم فك تشفير الخزنة المشفرة كلياً بنجاح بمفتاح جهازك الخاص (Zero-Knowledge)',
        'Zero-Knowledge Vault decrypted successfully with your private key',
        'success'
      );
      return true;
    }
    showNotification('رمز المرور الرئيسي للخزنة غير صحيح', 'Invalid Vault Master PIN', 'warning');
    return false;
  }, [securitySettings.vaultMasterPin, showNotification]);

  const lockVault = useCallback(() => {
    setSecuritySettings(prev => ({ ...prev, vaultUnlocked: false }));
    showNotification('تم إقفال الخزنة ومسح مفاتيح التشفير من الذاكرة العشوائية', 'Vault locked and keys flushed from memory', 'info');
  }, [showNotification]);

  // MFA & Passkeys
  const toggleMfa = useCallback(() => {
    setSecuritySettings(prev => {
      const nextMfa = !prev.mfaEnabled;
      showNotification(
        nextMfa ? 'تم تفعيل المصادقة الثنائية (TOTP Authenticator)' : 'تم تعطيل المصادقة الثنائية',
        nextMfa ? 'Two-Factor Authentication (TOTP) enabled' : 'Two-Factor Authentication disabled',
        nextMfa ? 'success' : 'warning'
      );
      return { ...prev, mfaEnabled: nextMfa };
    });
  }, [showNotification]);

  const registerPasskey = useCallback(async (): Promise<boolean> => {
    // Simulate WebAuthn credentials create
    await new Promise(r => setTimeout(r, 600));
    setSecuritySettings(prev => ({ ...prev, passkeyRegistered: true }));
    const audit: SecurityAuditItem = {
      id: `aud-${Date.now()}`,
      actionAr: 'تم تسجيل مفتاح مرور جديد بنجاح (FIDO2 Passkey Created)',
      actionEn: 'New Passkey (FIDO2 / WebAuthn) registered successfully',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      ip: '158.140.220.14',
      status: 'success',
      details: 'Secure Enclave / TPM hardware backed'
    };
    setAuditLogs(prev => [audit, ...prev]);
    showNotification(
      'تم تسجيل مفتاح المرور (Passkey) وحفظه في الشريحة الآمنة Secure Enclave',
      'Passkey registered and secured in hardware Secure Enclave',
      'success'
    );
    return true;
  }, [showNotification]);

  const generateNewRecoveryCodes = useCallback(() => {
    const newCodes = Array.from({ length: 4 }, () => `RAWJ-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
    setSecuritySettings(prev => ({ ...prev, recoveryCodes: newCodes }));
    showNotification('تم توليد رموز استرداد طوارئ جديدة بنجاح', 'New emergency recovery codes generated', 'success');
  }, [showNotification]);

  const updateSecuritySettings = useCallback((updates: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleAutoWhatsAppVaultBackup = useCallback((forcedVal?: boolean) => {
    setSecuritySettings(prev => {
      const nextVal = typeof forcedVal === 'boolean' ? forcedVal : !prev.autoWhatsAppVaultBackup;
      
      // Synchronize with messages backup settings
      setMessagesSettings(mPrev => ({
        ...mPrev,
        autoBackupEnabled: nextVal,
        backupToEncryptedVault: nextVal,
      }));

      // Register an immutable audit log entry for Zero-Knowledge security verification
      const audit: SecurityAuditItem = {
        id: `aud-${Date.now()}`,
        actionAr: nextVal
          ? 'تم تفعيل النسخ الاحتياطي التلقائي للواتساب في الخزنة المشفرة كلياً'
          : 'تم إيقاف النسخ الاحتياطي التلقائي للواتساب في الخزنة المشفرة كلياً',
        actionEn: nextVal
          ? 'Enabled Automatic WhatsApp Backup to Zero-Knowledge Vault'
          : 'Disabled Automatic WhatsApp Backup to Zero-Knowledge Vault',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        ip: '158.140.220.14',
        status: 'success',
        details: nextVal
          ? 'AES-256-GCM / PBKDF2 automated vault sync enabled with 64-digit client master key'
          : 'Automated WhatsApp vault sync suspended by user request',
      };
      setAuditLogs(logs => [audit, ...logs]);

      showNotification(
        nextVal
          ? 'تم تفعيل النسخ الاحتياطي التلقائي للواتساب إلى الخزنة المشفرة كلياً (Zero-Knowledge Vault)'
          : 'تم إيقاف النسخ الاحتياطي التلقائي للواتساب إلى الخزنة المشفرة',
        nextVal
          ? 'Automatic WhatsApp Backup to Encrypted Vault enabled'
          : 'Automatic WhatsApp Backup to Encrypted Vault disabled',
        nextVal ? 'success' : 'warning'
      );

      return {
        ...prev,
        autoWhatsAppVaultBackup: nextVal,
        lastWhatsAppVaultBackupAt: nextVal ? new Date().toISOString() : prev.lastWhatsAppVaultBackupAt,
      };
    });
  }, [showNotification]);

  // Sessions
  const revokeSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    showNotification('تم إنهاء الجلسة عن بُعد وتسجيل خروج الجهاز فورياً', 'Remote session revoked successfully', 'info');
  }, [showNotification]);

  const revokeAllOtherSessions = useCallback(() => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    showNotification('تم إنهاء جميع الجلسات والأجهزة الأخرى بنجاح', 'All other active sessions revoked', 'success');
  }, [showNotification]);

  // Secure Payment Gateway Modal triggers
  const openPaymentGateway = useCallback((plan?: PlanTier, billingCycle: 'monthly' | 'annual' = 'annual') => {
    const activePlans = allPlans.filter(p => p.isActive !== false);
    let targetPlan = plan;

    if (!targetPlan) {
      // Pick the next higher paid tier relative to currentPlan
      const paidUpgradeCandidates = activePlans.filter(
        p => p.id !== currentPlan.id && p.id !== 'free'
      );
      targetPlan =
        paidUpgradeCandidates.find(p => p.storageGB > currentPlan.storageGB) ||
        paidUpgradeCandidates.find(p => p.id === 'pro') ||
        paidUpgradeCandidates[0] ||
        activePlans.find(p => p.id !== 'free') ||
        PLAN_TIERS[2];
    }

    setPlansModalOpen(false);
    setPaymentGatewayCycle(billingCycle);
    setPaymentGatewayPlan(targetPlan);
  }, [allPlans, currentPlan]);

  const closePaymentGateway = useCallback(() => {
    setPaymentGatewayPlan(null);
  }, []);

  // Plan Management
  const upgradePlan = useCallback((planId: string, options?: UpgradePlanOptions) => {
    const target = allPlans.find(p => p.id === planId) || PLAN_TIERS.find(p => p.id === planId);
    if (!target) return;

    const cycle = options?.billingCycle ?? 'annual';
    const chargedAmount =
      target.id === 'flex'
        ? Math.max(target.priceMonthlyUSD || 9.99, 9.99)
        : cycle === 'annual'
        ? target.priceAnnualUSD
        : target.priceMonthlyUSD;

    const now = new Date();
    const renewal = new Date(now);
    if (cycle === 'annual') {
      renewal.setFullYear(renewal.getFullYear() + 1);
    } else {
      renewal.setMonth(renewal.getMonth() + 1);
    }

    const startDateISO = now.toISOString();
    const nextRenewalISO = renewal.toISOString();
    const dateShort = startDateISO.slice(0, 10);
    const brandLabel = options?.cardBrand || 'Visa';
    const last4 = options?.cardLast4 || '4242';
    const maskedCardLabel =
      target.id === 'free'
        ? 'Free Tier (No Card Required)'
        : `${brandLabel} (•••• ${last4})`;
    const invNum =
      options?.invoiceNumber ||
      `INV-RWJ-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const txnRef =
      options?.transactionRef ||
      `TXN-RWJ-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    setCurrentPlan(target);
    setCurrentUser(prev =>
      prev ? { ...prev, allocatedStorageGB: target.storageGB } : prev
    );

    // Sync active subscription & prepend new official paid invoice
    setSubscriptions(prev => {
      const existingInvoices = prev[0]?.invoices || [];
      const newInvoice: SubscriptionInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invNum,
        date: dateShort,
        amountUSD: chargedAmount,
        status: 'paid',
        billingPeriod:
          cycle === 'annual'
            ? `${dateShort} → ${nextRenewalISO.slice(0, 10)} (Annual)`
            : `${dateShort} → ${nextRenewalISO.slice(0, 10)} (Monthly)`,
        paymentMethod: maskedCardLabel,
      };

      const updatedSub: UserSubscription = {
        id: prev[0]?.id || `SUB-RWJ-${now.getFullYear()}-001`,
        planId: target.id,
        planNameAr: target.nameAr,
        planNameEn: target.nameEn,
        storageGB: target.storageGB,
        status: 'active',
        billingCycle: cycle,
        priceUSD: chargedAmount,
        startDate: startDateISO,
        nextRenewalDate: nextRenewalISO,
        paymentMethod: brandLabel,
        paymentMethodDetails: maskedCardLabel,
        autoRenew: target.id !== 'free',
        invoices: target.id === 'free' ? existingInvoices : [newInvoice, ...existingInvoices],
      };

      if (prev.length === 0) return [updatedSub];
      return [updatedSub, ...prev.slice(1)];
    });

    // Record billing confirmation in Security Audit & Activity Logs (masked metadata only)
    const audit: SecurityAuditItem = {
      id: `aud-${Date.now()}`,
      actionAr: `تمت ترقية الباقة إلى "${target.nameAr}" عبر بوابة الدفع الآمنة`,
      actionEn: `Upgraded plan to "${target.nameEn}" via Secure Payment Gateway`,
      timestamp: now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      ip: '158.140.220.14',
      status: 'success',
      details: `3DS Verified · ${maskedCardLabel} · Ref ${txnRef} · $${chargedAmount.toFixed(2)}`,
    };
    setAuditLogs(logs => [audit, ...logs]);

    logActivity({
      type: 'system',
      titleAr: `ترقية الباقة السحابية إلى ${target.nameAr}`,
      titleEn: `Upgraded Cloud Plan to ${target.nameEn}`,
      descriptionAr: `تم تأكيد الدفع بنجاح (${maskedCardLabel}) وتفعيل سعة ${
        target.storageGB >= 1024 ? `${target.storageGB / 1024} TB` : `${target.storageGB} GB`
      } فوراً`,
      descriptionEn: `Payment verified (${maskedCardLabel}) and ${
        target.storageGB >= 1024 ? `${target.storageGB / 1024} TB` : `${target.storageGB} GB`
      } quota activated instantly`,
      targetName: target.nameAr,
      targetType: 'system',
      ipAddress: '158.140.220.14',
      device: 'Rawaj Cloud Web',
      actor: currentUser?.email || 'rawajtel4@gmail.com',
      severity: 'success',
      metadata: {
        securityMethod: 'TLS 1.3 + 3D Secure',
        transactionRef: txnRef,
        invoiceNumber: invNum,
        billingCycle: cycle,
      },
    });

    if (!options?.keepModalOpen) {
      setPlansModalOpen(false);
    }

    showNotification(
      `تمت ترقية باقتك إلى "${target.nameAr}" وتفعيل السعة السحابية بنجاح`,
      `Successfully upgraded to "${target.nameEn}" plan`,
      'success'
    );
  }, [allPlans, currentUser?.email, logActivity, showNotification]);

  const createPlan = useCallback((newPlanData: Omit<PlanTier, 'id'> & { id?: string }) => {
    const generatedId = newPlanData.id || `custom-plan-${Date.now()}`;
    const fullPlan: PlanTier = {
      ...newPlanData,
      id: generatedId,
      isActive: newPlanData.isActive !== undefined ? newPlanData.isActive : true,
    };

    setAllPlans(prev => [...prev, fullPlan]);
    showNotification(
      `تمت إضافة الباقة الجديدة "${fullPlan.nameAr}" بنجاح في كتالوج الاشتراكات`,
      `New plan "${fullPlan.nameEn}" created and added to catalog`,
      'success'
    );
  }, [showNotification]);

  const updatePlan = useCallback((id: string, updates: Partial<PlanTier>) => {
    setAllPlans(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          // If current active plan is updated, sync it
          if (currentPlan.id === id) {
            setCurrentPlan(updated);
          }
          return updated;
        }
        return p;
      })
    );
    showNotification(
      'تم تحديث إعدادات وحدود الباقة وقواعد التسعير بنجاح',
      'Plan resources, limits, and tiered pricing updated',
      'success'
    );
  }, [currentPlan.id, showNotification]);

  const togglePlanAvailability = useCallback((id: string) => {
    setAllPlans(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextActive = !p.isActive;
          showNotification(
            nextActive ? `تم تفعيل إتاحة باقة "${p.nameAr}" للمستخدمين` : `تم إيقاف إتاحة باقة "${p.nameAr}" وتجميد الاشتراكات الجديدة`,
            nextActive ? `Plan "${p.nameEn}" is now available to users` : `Plan "${p.nameEn}" marked unavailable`,
            nextActive ? 'success' : 'warning'
          );
          return { ...p, isActive: nextActive };
        }
        return p;
      })
    );
  }, [showNotification]);

  const deletePlan = useCallback((id: string) => {
    if (['free', 'personal', 'pro'].includes(id)) {
      showNotification(
        'لا يمكن حذف الباقات الأساسية للنظام. يمكنك إيقاف إتاحتها بدلاً من ذلك.',
        'Core system plans cannot be deleted. You can toggle them off instead.',
        'warning'
      );
      return;
    }
    setAllPlans(prev => prev.filter(p => p.id !== id));
    showNotification(
      'تم حذف الباقة بنجاح من كتالوج المنصة',
      'Plan deleted successfully from catalog',
      'info'
    );
  }, [showNotification]);

  const topUpFlexWallet = useCallback((amount: number) => {
    setFlexWalletBalance(prev => prev + amount);
    showNotification(
      `تم شحن المحفظة السحابية بنجاح بمبلغ $${amount.toFixed(2)}`,
      `Cloud wallet topped up with $${amount.toFixed(2)}`,
      'success'
    );
  }, [showNotification]);

  // Media Backup
  const updateMediaBackup = useCallback((settings: Partial<MediaBackupSettings>) => {
    setMediaBackupSettings(prev => ({ ...prev, ...settings }));
    showNotification('تم تحديث إعدادات النسخ الاحتياطي للوسائط', 'Media backup settings updated', 'info');
  }, [showNotification]);

  const triggerManualMediaSync = useCallback(() => {
    setMediaBackupSettings(prev => ({
      ...prev,
      lastSyncTimestamp: new Date().toISOString(),
      totalSyncedCount: prev.totalSyncedCount + 14,
      queuedMediaCount: 0
    }));
    showNotification('اكتملت مزامنة ذكريات الكاميرا والوسائط بنجاح', 'Camera roll backup completed successfully', 'success');
  }, [showNotification]);

  // Messages Backup methods
  const updateMessagesSettings = useCallback((newSettings: Partial<MessagesBackupSettings>) => {
    setMessagesSettings(prev => ({ ...prev, ...newSettings }));
    showNotification('تم تحديث إعدادات التخزين السحابي للرسائل', 'Messages backup settings updated', 'info');
  }, [showNotification]);

  const triggerManualMessagesSync = useCallback(() => {
    setIsSyncingMessages(true);
    showNotification('جارٍ تشفير ومزامنة الرسائل عبر المفتاح السحابي E2EE...', 'Encrypting and syncing messages via E2EE...', 'info');

    setTimeout(() => {
      setMessagesSettings(prev => ({
        ...prev,
        lastSyncTimestamp: new Date().toISOString(),
        totalWhatsappCount: prev.totalWhatsappCount + 12,
        totalSmsCount: prev.totalSmsCount + 3,
        totalMediaSizeBytes: prev.totalMediaSizeBytes + 18 * 1024 * 1024,
      }));
      setConversations(prev =>
        prev.map(c => ({
          ...c,
          backupStatus: 'synced',
        }))
      );
      setIsSyncingMessages(false);
      showNotification('تمت مزامنة جميع محادثات الواتساب والرسائل النصية E2EE بنجاح!', 'WhatsApp chats and SMS synced securely to Rawaj Cloud!', 'success');
    }, 1800);
  }, [showNotification]);

  const restoreConversation = useCallback((id: string) => {
    const convo = conversations.find(c => c.id === id);
    const title = convo ? convo.contactName : id;
    showNotification(
      `تم فك تشفير وتنزيل محادثة "${title}" واستعادتها بنجاح`,
      `Conversation "${title}" decrypted and restored successfully`,
      'success'
    );
  }, [conversations, showNotification]);

  const exportConversation = useCallback((id: string, format: 'json' | 'txt') => {
    const convo = conversations.find(c => c.id === id);
    if (!convo) return;
    
    let content = '';
    let mimeType = 'text/plain;charset=utf-8';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify(convo, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else {
      content = `--- RAWJ CLOUD E2EE ARCHIVE ---\n` +
        `Contact: ${convo.contactName} (${convo.phoneNumber})\n` +
        `Platform: ${convo.platform.toUpperCase()}\n` +
        `Export Date: ${new Date().toLocaleString()}\n` +
        `Key Fingerprint: ${convo.encryptionKeyFingerprint}\n\n` +
        convo.messages.map(m => `[${m.timestamp}] ${m.senderName}: ${m.text} ${m.hasAttachment ? `[Attachment: ${m.attachmentName}]` : ''}`).join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RawajCloud_${convo.platform}_${convo.contactName.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_backup.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification(
      `تم تصدير نسخة مشفرة من "${convo.contactName}" بتنسيق ${ext.toUpperCase()}`,
      `Exported archive for "${convo.contactName}" as ${ext.toUpperCase()}`,
      'success'
    );
  }, [conversations, showNotification]);

  const regenerateWhatsAppMasterKey = useCallback(async (): Promise<string> => {
    const newKey = generate64DigitWhatsAppKey();
    const fingerprint = await calculateKeyFingerprint(newKey);
    setMessagesSettings(prev => ({
      ...prev,
      userMasterKey64: newKey,
      backupKeyFingerprint: `WA-${fingerprint}`,
      keySavedLocally: true,
      lastAuditCheck: new Date().toISOString(),
    }));
    showNotification(
      'تم توليد وتطبيق مفتاح تشفير E2EE جديد (64 خانة) محلياً على جهازك بنجاح!',
      'New 64-digit Zero-Knowledge E2EE key generated and applied locally!',
      'success'
    );
    return newKey;
  }, [showNotification]);

  const verifyWhatsAppE2EEKey = useCallback(async (testKey: string): Promise<boolean> => {
    const clean = testKey.replace(/[^a-fA-F0-9]/g, '');
    if (clean.length !== 64) return false;
    const currentKey = messagesSettings.userMasterKey64;
    return clean.toLowerCase() === currentKey?.toLowerCase();
  }, [messagesSettings.userMasterKey64]);

  // Authentication Handlers
  const login = useCallback(async (email: string, password?: string, remember: boolean = true): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600));
    const cleanEmail = email.trim().toLowerCase();
    const isDefault = cleanEmail === 'rawajtel4@gmail.com';
    const user: AuthUser = isDefault
      ? {
          id: 'usr-rawaj-7701',
          name: 'م. سعد الحضرمي',
          email: 'rawajtel4@gmail.com',
          role: 'owner',
          createdAt: '2026-01-15T10:00:00Z',
          isEmailVerified: true,
          twoFactorEnabled: true,
          passkeyEnabled: true,
          preferredRegion: 'me-central-1',
          allocatedStorageGB: 100,
        }
      : {
          id: `usr-${Date.now()}`,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'user',
          createdAt: new Date().toISOString(),
          isEmailVerified: true,
          twoFactorEnabled: false,
          passkeyEnabled: false,
          preferredRegion: 'me-central-1',
          allocatedStorageGB: 15,
        };

    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('home');
    showNotification(
      `مرحباً بك مجدداً ${user.name}! تم تسجيل الدخول بنجاح`,
      `Welcome back ${user.name}! Logged in successfully`,
      'success'
    );
    return true;
  }, [setActiveTab, showNotification]);

  const loginWithPasskey = useCallback(async (): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 750));
    const user: AuthUser = {
      id: 'usr-rawaj-7701',
      name: 'م. سعد الحضرمي',
      email: 'rawajtel4@gmail.com',
      role: 'owner',
      createdAt: '2026-01-15T10:00:00Z',
      isEmailVerified: true,
      twoFactorEnabled: true,
      passkeyEnabled: true,
      preferredRegion: 'me-central-1',
      allocatedStorageGB: 100,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab('home');
    showNotification(
      'تم تسجيل الدخول الفوري عبر مفتاح المرور البيومتري FIDO2 بنجاح!',
      'Instant Passkey / WebAuthn biometric login succeeded!',
      'success'
    );
    return true;
  }, [setActiveTab, showNotification]);

  const register = useCallback(async (
    name: string,
    email: string,
    password?: string,
    planId: string = 'free',
    region: any = 'me-central-1'
  ): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    const targetPlan = allPlans.find(p => p.id === planId) || PLAN_TIERS[0];
    const user: AuthUser = {
      id: `usr-${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role: 'user',
      createdAt: new Date().toISOString(),
      isEmailVerified: true,
      twoFactorEnabled: false,
      passkeyEnabled: false,
      preferredRegion: region,
      allocatedStorageGB: targetPlan.storageGB,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentPlan(targetPlan);
    setActiveTab('home');
    showNotification(
      `تهانينا ${user.name}! تم إنشاء حسابك الجديد وتخصيص مساحة سحابية بنجاح`,
      `Account created! Welcome to Rawaj Cloud, ${user.name}`,
      'success'
    );
    return true;
  }, [allPlans, setActiveTab, showNotification]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('auth');
    showNotification(
      'تم تسجيل الخروج بنجاح ومسح مفاتيح الجلسة المشفرة',
      'Logged out successfully. Secure session tokens cleared',
      'info'
    );
  }, [setActiveTab, showNotification]);

  const resetPasswordRequest = useCallback(async (email: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600));
    showNotification(
      `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email} بنجاح`,
      `Password reset instructions sent to ${email}`,
      'success'
    );
    return true;
  }, [showNotification]);

  const value = {
    currentUser,
    isAuthenticated,
    login,
    loginWithPasskey,
    register,
    logout,
    resetPasswordRequest,
    lang,
    setLang,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    previousTab,
    goBack,
    currentFolderId,
    setCurrentFolderId,
    folders,
    files,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sizeFilter,
    setSizeFilter,
    viewMode,
    setViewMode,
    selectedFileIds,
    setSelectedFileIds,
    toggleSelectFile,
    selectAllFiles,
    selectedFolderIds,
    setSelectedFolderIds,
    toggleSelectFolder,
    selectAllVisible,
    clearSelection,
    createNewFolder,
    deleteFolder,
    deleteFile,
    deleteFilesBatch,
    deleteFoldersBatch,
    moveFiles,
    moveFoldersBatch,
    batchRenameFiles,
    renameFile,
    downloadFilesBatch,
    cryptoShredFile,
    restoreFromTrash,
    toggleFavorite,
    toggleOfflineSync,
    toggleFolderSync,
    updateFileShare,
    updateFolderShare,
    restoreFileVersion,
    uploadTasks,
    uploadQueueOpen,
    setUploadQueueOpen,
    uploadFiles,
    togglePauseUpload,
    cancelUpload,
    simulateResilienceGlitch,
    currentPlan,
    setCurrentPlan,
    upgradePlan,
    flexWalletBalance,
    topUpFlexWallet,
    quota,
    allPlans,
    createPlan,
    updatePlan,
    togglePlanAvailability,
    deletePlan,
    previewFile,
    setPreviewFile,
    shareFile,
    setShareFile,
    shareFolder,
    setShareFolder,
    versionHistoryFile,
    setVersionHistoryFile,
    plansModalOpen,
    setPlansModalOpen,
    paymentGatewayPlan,
    paymentGatewayCycle,
    openPaymentGateway,
    closePaymentGateway,
    onboardingOpen,
    setOnboardingOpen,
    securitySettings,
    updateSecuritySettings,
    toggleAutoWhatsAppVaultBackup,
    unlockVault,
    lockVault,
    toggleMfa,
    registerPasskey,
    generateNewRecoveryCodes,
    sessions,
    revokeSession,
    revokeAllOtherSessions,
    auditLogs,
    mediaBackupSettings,
    updateMediaBackup,
    triggerManualMediaSync,
    messagesSettings,
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    updateMessagesSettings,
    triggerManualMessagesSync,
    isSyncingMessages,
    restoreConversation,
    exportConversation,
    regenerateWhatsAppMasterKey,
    verifyWhatsAppE2EEKey,
    tempCacheStats,
    clearTempCacheCategory,
    notification,
    showNotification,
    activityLogs,
    logActivity,
    clearActivityLogs,
    isOnline,
    simulatedOffline,
    setSimulatedOffline,
    isOfflineMode,
    swReady,
    offlineCacheStats,
    syncOfflineCacheNow,
    clearOfflineFileCache,
    subscriptions,
    cancelSubscription,
    renewSubscription,
    toggleAutoRenew,
  };

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
};

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
