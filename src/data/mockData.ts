import { FileItem, FolderItem, PlanTier, UserSession, SecurityAuditItem, UserSubscription } from '../types/storage';

export const INITIAL_FOLDERS: FolderItem[] = [
  {
    id: 'folder-docs',
    name: 'مستندات العمل والمشاريع',
    parentId: null,
    createdAt: '2026-10-15T10:00:00Z',
    color: '#0284C7',
    isSyncPinned: true,
  },
  {
    id: 'folder-media',
    name: 'الذكريات والصور العائلية 4K',
    parentId: null,
    createdAt: '2026-10-20T14:30:00Z',
    color: '#F97316',
    isSyncPinned: false, // Cloud-only virtual
  },
  {
    id: 'folder-backups',
    name: 'قواعد البيانات والأرشيف السحابي',
    parentId: null,
    createdAt: '2026-11-01T08:15:00Z',
    color: '#8B5CF6',
    isSyncPinned: true,
  },
  {
    id: 'folder-vault',
    name: 'الخزنة الخاصة المشفرة كلياً (E2EE Vault)',
    parentId: null,
    createdAt: '2026-11-02T19:00:00Z',
    color: '#10B981',
    isVault: true,
  },
  {
    id: 'folder-sub-arch',
    name: 'المخططات الهندسية والبنية السحابية 2026',
    parentId: 'folder-docs',
    createdAt: '2026-10-25T11:00:00Z',
    color: '#0284C7',
    isSyncPinned: true,
  },
  {
    id: 'folder-sub-contracts',
    name: 'العقود واتفاقيات SLA',
    parentId: 'folder-docs',
    createdAt: '2026-10-26T15:00:00Z',
    color: '#3B82F6',
    isSyncPinned: true,
  },
  {
    id: 'folder-sub-trips',
    name: 'رحلات الشتاء والعلا',
    parentId: 'folder-media',
    createdAt: '2026-10-28T09:30:00Z',
    color: '#F97316',
    isSyncPinned: false,
  },
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'file-1',
    name: 'Rawaj_Cloud_Whitepaper_Architecture_v3.pdf',
    folderId: 'folder-docs',
    sizeBytes: 14250000, // ~13.6 MB
    type: 'pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    createdAt: '2026-10-22T09:30:00Z',
    updatedAt: '2026-11-06T15:45:00Z',
    checksum: 'a89c74501fd6850c95ef393f9c6742510257ad3be241324316d97c73ff05c1d8',
    isFavorite: true,
    isTrash: false,
    isVault: false,
    isOffline: true,
    isShared: true,
    shareConfig: {
      isPublic: true,
      shareUrl: 'https://rawajcloud.com/s/whitepaper-arch-2026',
      hasPassword: true,
      password: 'RawajSecurity#99',
      expiresAt: '2026-12-31T23:59:59Z',
      allowDownload: true,
      accessLevel: 'view',
      collaborators: [{ email: 'ceo@rawajcloud.com', role: 'editor' }]
    },
    versions: [
      {
        id: 'ver-3',
        versionNumber: 'v3.2',
        sizeBytes: 14250000,
        modifiedAt: '2026-11-06T15:45:00Z',
        modifiedBy: 'طارق المهندس (Lead Architect)',
        checksum: 'a89c74501fd6850c95ef393f9c6742510257ad3be241324316d97c73ff05c1d8',
        changeNote: 'تحديث معايير التشفير الصفري والدمج مع Cloudflare R2'
      },
      {
        id: 'ver-2',
        versionNumber: 'v2.0',
        sizeBytes: 12100000,
        modifiedAt: '2026-10-28T11:20:00Z',
        modifiedBy: 'طارق المهندس',
        checksum: '7b25e1a3bc89140d34f0c97892b157e84126c8a2098b44a2b16df82c730e61fa',
        changeNote: 'إضافة مواصفات استرداد النسخ السابقة وفحص التكرار العميل'
      },
      {
        id: 'ver-1',
        versionNumber: 'v1.0',
        sizeBytes: 9800000,
        modifiedAt: '2026-10-22T09:30:00Z',
        modifiedBy: 'طارق المهندس',
        checksum: '4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d',
        changeNote: 'الإصدار الأولي لمواصفات البنية التحتية'
      }
    ],
    previewContent: 'رواج كلاود: وثيقة البنية الهندسية الفائقة للتخزين السحابي الهجين الآمن بنموذج التشفير الصفري AES-256-GCM ومعدل بقاء بيانات 11 تسعات.'
  },
  {
    id: 'file-2',
    name: 'Rawaj_Launch_Reel_4K_ProRes.mp4',
    folderId: 'folder-media',
    sizeBytes: 1850000000, // ~1.72 GB
    type: 'video',
    extension: 'mp4',
    mimeType: 'video/mp4',
    createdAt: '2026-11-03T18:10:00Z',
    updatedAt: '2026-11-03T18:10:00Z',
    checksum: '6e8140db79234ba9841f32a5e82847a937dc93847291a0b36c49f80214a1c5d9',
    isFavorite: true,
    isTrash: false,
    isVault: false,
    isOffline: false,
    isShared: false,
    versions: [
      {
        id: 'v-reel-1',
        versionNumber: 'v1.0',
        sizeBytes: 1850000000,
        modifiedAt: '2026-11-03T18:10:00Z',
        modifiedBy: 'فريق الإنتاج الرقمي',
        checksum: '6e8140db79234ba9841f32a5e82847a937dc93847291a0b36c49f80214a1c5d9',
        changeNote: 'العرض الترويجي الرسمي بدقة 4K فائقة الوضوح'
      }
    ],
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/assets/aistudio/_________________20261107_140807______425b22ac.png'
  },
  {
    id: 'file-3',
    name: 'Rawaj_Brand_Identity_Official_Vector.png',
    folderId: null,
    sizeBytes: 4200000, // 4 MB
    type: 'image',
    extension: 'png',
    mimeType: 'image/png',
    createdAt: '2026-11-01T12:00:00Z',
    updatedAt: '2026-11-01T12:00:00Z',
    checksum: '3a7b9c1d5e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b',
    isFavorite: true,
    isTrash: false,
    isVault: false,
    isOffline: true,
    isShared: true,
    shareConfig: {
      isPublic: true,
      shareUrl: 'https://rawajcloud.com/s/brand-logo-official',
      hasPassword: false,
      allowDownload: true,
      accessLevel: 'view',
      collaborators: []
    },
    versions: [
      {
        id: 'ver-logo-1',
        versionNumber: 'v1.0',
        sizeBytes: 4200000,
        modifiedAt: '2026-11-01T12:00:00Z',
        modifiedBy: 'الإدارة الإبداعية',
        checksum: '3a7b9c1d5e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b',
        changeNote: 'الشعار المعتمد لرواج كلاود بالألوان الرسمية'
      }
    ],
    thumbnailUrl: '/assets/aistudio/_________________20261107_140807______425b22ac.png'
  },
  {
    id: 'file-4',
    name: 'PostgreSQL_Database_Cluster_Dump_20261105.tar.gz',
    folderId: 'folder-backups',
    sizeBytes: 840000000, // 800 MB
    type: 'archive',
    extension: 'tar.gz',
    mimeType: 'application/gzip',
    createdAt: '2026-11-05T03:00:00Z',
    updatedAt: '2026-11-05T03:00:00Z',
    checksum: '9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c',
    isFavorite: false,
    isTrash: false,
    isVault: false,
    isOffline: false,
    isShared: false,
    versions: [
      {
        id: 'ver-db-1',
        versionNumber: 'v1.0',
        sizeBytes: 840000000,
        modifiedAt: '2026-11-05T03:00:00Z',
        modifiedBy: 'Automated Backup Cron',
        checksum: '9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c',
        changeNote: 'النسخة الاحتياطية المجدولة الشاملة'
      }
    ]
  },
  {
    id: 'file-5',
    name: 'Family_Vacation_AlUla_GoldenHour_DSC9201.jpg',
    folderId: 'folder-media',
    sizeBytes: 18400000, // ~17.5 MB
    type: 'image',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    createdAt: '2026-10-30T17:20:00Z',
    updatedAt: '2026-10-30T17:20:00Z',
    checksum: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    isFavorite: true,
    isTrash: false,
    isVault: false,
    isOffline: false,
    isShared: false,
    versions: [
      {
        id: 'ver-img-1',
        versionNumber: 'v1.0',
        sizeBytes: 18400000,
        modifiedAt: '2026-10-30T17:20:00Z',
        modifiedBy: 'مزامنة الكاميرا التلقائية',
        checksum: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
        changeNote: 'تمت المزامنة بجودة الكاميرا الأصلية غير المضغوطة'
      }
    ],
    thumbnailUrl: '/assets/aistudio/_________________20261107_140807______425b22ac.png'
  },
  {
    id: 'file-6',
    name: 'Financial_Investor_Model_Prorated_2026.xlsx',
    folderId: 'folder-docs',
    sizeBytes: 3100000, // 3 MB
    type: 'spreadsheet',
    extension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    createdAt: '2026-11-04T13:40:00Z',
    updatedAt: '2026-11-05T16:15:00Z',
    checksum: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    isFavorite: false,
    isTrash: false,
    isVault: false,
    isOffline: true,
    isShared: false,
    versions: [
      {
        id: 'ver-xls-2',
        versionNumber: 'v1.2',
        sizeBytes: 3100000,
        modifiedAt: '2026-11-05T16:15:00Z',
        modifiedBy: 'المدير المالي (CFO)',
        checksum: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        changeNote: 'تعديل هوامش ربحية باقة Pro 2TB والاشتراكات السنوية'
      }
    ],
    previewContent: 'جدول الميزانية والتوقعات المالية لعام 2026: نسبة النمو الشهري المتوقعة 18%، مع هوامش ربحية مستهدفة 64% للباقات السنوية وتكامل مدفوعات مدى وتمارا.'
  },
  {
    id: 'file-7',
    name: 'ZeroKnowledge_Private_Crypto_Seed_Recovery.txt',
    folderId: 'folder-vault',
    sizeBytes: 4200, // 4.2 KB
    type: 'document',
    extension: 'txt',
    mimeType: 'text/plain',
    createdAt: '2026-11-05T21:00:00Z',
    updatedAt: '2026-11-05T21:00:00Z',
    checksum: 'c0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff',
    isFavorite: true,
    isTrash: false,
    isVault: true, // Only visible when vault unlocked!
    isOffline: false,
    isShared: false,
    versions: [],
    previewContent: `# Rawaj Cloud - Zero-Knowledge Seed Recovery
==================================================
WARNING: Keep this file confidential! Do NOT share your private keys.
Algorithm: Argon2id (Memory: 64MB, Iterations: 100,000, Parallelism: 4)
Cipher: AES-256-GCM authenticated encryption tag

Recovery Seed Words:
01: beacon    02: desert    03: horizon   04: security
05: summit    06: shield    07: cipher    08: quantum
09: falcon    10: oasis     11: granite   12: victory

Public Identity Hash:
7f9a8b1c2d3e4f5061728394a5b6c7d8e9f01234`
  },
  {
    id: 'file-8',
    name: 'Rawaj_Architecture_Overview.txt',
    folderId: null,
    sizeBytes: 12400, // 12.4 KB
    type: 'document',
    extension: 'txt',
    mimeType: 'text/plain',
    createdAt: '2026-11-06T14:20:00Z',
    updatedAt: '2026-11-06T14:20:00Z',
    checksum: '88a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde',
    isFavorite: true,
    isTrash: false,
    isVault: false,
    isOffline: true,
    isShared: true,
    shareConfig: {
      isPublic: true,
      shareUrl: 'https://rawajcloud.com/s/architecture-overview',
      hasPassword: false,
      allowDownload: true,
      accessLevel: 'view',
      collaborators: []
    },
    versions: [
      {
        id: 'ver-txt-1',
        versionNumber: 'v1.0',
        sizeBytes: 12400,
        modifiedAt: '2026-11-06T14:20:00Z',
        modifiedBy: 'طارق المهندس',
        checksum: '88a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde',
        changeNote: 'وثيقة مبادئ البنية السحابية الهجينة'
      }
    ],
    previewContent: `=======================================================
رواج كلاود (Rawaj Cloud) - المعمارية الهندسية ومبادئ التصميم
=======================================================

1. مبدأ التكلفة الصفرية لسحب البيانات (Zero Egress Architecture):
   - استخدام طبقة تجريد S3-compatible مدعومة بشبكة Cloudflare R2 عالمياً.
   - منع احتكار مزودي السحابة التقليديين وإلغاء رسوم التحميل والتنزيل.

2. تقنية الرفع المقسم المرن (Resumable Multipart Upload):
   - تجزئة الملفات الكبيرة إلى كتل بحجم 4MB إلى 64MB.
   - التحقق الفوري من التجزئة قبل البدء لتفعيل ميزة Instant Deduplication.
   - استئناف ذكي عند انقطاع الاتصال بنقاط تفتيش محلية (Checkpoints).

3. الأمان والتشفير متعدد الطبقات:
   - طبقة النقل: TLS 1.3 مع HSTS وتثبيت الشهادات الرقمية (Cert Pinning).
   - التشفير في السكون: خوارزمية AES-256-GCM مع تدوير دوري للمفاتيح.
   - الخزنة الخاصة: تشفير صفري كامل (Zero-Knowledge) بمفتاح العميل.

4. متانة البيانات والاعتمادية الجغرافية:
   - نسخ متزامن عبر 3 مناطق جغرافية (Riyadh, Dubai, Frankfurt).
   - تحقيق متانة بيانات 11 تسعات (99.999999999%) وضمان توافر 99.9%.`
  },
  {
    id: 'file-9',
    name: 'Server_Configuration_Production.json',
    folderId: 'folder-backups',
    sizeBytes: 3800,
    type: 'code',
    extension: 'json',
    mimeType: 'application/json',
    createdAt: '2026-11-05T19:40:00Z',
    updatedAt: '2026-11-05T19:40:00Z',
    checksum: '55f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4',
    isFavorite: false,
    isTrash: false,
    isVault: false,
    isOffline: false,
    isShared: false,
    versions: [],
    previewContent: `{
  "serviceName": "rawaj-cloud-edge-gateway",
  "environment": "production",
  "version": "3.2.0-rc1",
  "regions": [
    {
      "regionId": "me-central-1",
      "city": "Riyadh",
      "primary": true,
      "latencyTargetMs": 30
    },
    {
      "regionId": "me-south-1",
      "city": "Dubai",
      "primary": false,
      "latencyTargetMs": 35
    },
    {
      "regionId": "eu-central-1",
      "city": "Frankfurt",
      "primary": false,
      "latencyTargetMs": 75
    }
  ],
  "storageTiers": {
    "hot": {
      "provider": "Cloudflare R2 + NVMe Cache",
      "egressFeeUSD": 0.0,
      "readThroughputMBs": 3500
    },
    "cold": {
      "provider": "S3 Glacier Deep Archive",
      "costPerGB": 0.002,
      "restoreTimeHours": 3
    }
  },
  "security": {
    "enforceTls13": true,
    "fido2Passkeys": true,
    "cryptoShreddingOnDelete": true,
    "aesKeyLength": 256
  }
}`
  },
  {
    id: 'file-3-dup',
    name: 'Rawaj_Brand_Identity_Official_Vector_backup.png',
    folderId: 'folder-docs',
    sizeBytes: 4200000,
    type: 'image',
    extension: 'png',
    mimeType: 'image/png',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z',
    checksum: '3a7b9c1d5e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b',
    isFavorite: false,
    isTrash: false,
    isVault: false,
    isOffline: false,
    isShared: false,
    versions: [],
    thumbnailUrl: '/assets/aistudio/_________________20261107_140807______425b22ac.png'
  },
  {
    id: 'file-5-dup',
    name: 'Family_Vacation_AlUla_GoldenHour_DSC9201 (1).jpg',
    folderId: 'folder-sub-trips',
    sizeBytes: 18400000,
    type: 'image',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    createdAt: '2026-11-01T15:30:00Z',
    updatedAt: '2026-11-01T15:30:00Z',
    checksum: 'e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    isFavorite: false,
    isTrash: false,
    isVault: false,
    isOffline: false,
    isShared: false,
    versions: [],
    thumbnailUrl: '/assets/aistudio/_________________20261107_140807______425b22ac.png'
  },
  {
    id: 'file-1-dup',
    name: 'Rawaj_Cloud_Whitepaper_Architecture_v3_copy.pdf',
    folderId: 'folder-sub-contracts',
    sizeBytes: 14250000,
    type: 'pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    createdAt: '2026-10-29T14:00:00Z',
    updatedAt: '2026-10-29T14:00:00Z',
    checksum: 'a89c74501fd6850c95ef393f9c6742510257ad3be241324316d97c73ff05c1d8',
    isFavorite: false,
    isTrash: false,
    isVault: false,
    isOffline: false,
    isShared: false,
    versions: []
  }
];

export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    nameAr: 'البداية المجانية',
    nameEn: 'Starter Free',
    storageGB: 10,
    priceMonthlyUSD: 0,
    priceAnnualUSD: 0,
    maxFileSizeGB: 2,
    versionRetentionDays: 7,
    vaultEnabled: false,
    familyMembers: 1,
    badgeAr: 'مجاناً مدى الحياة',
    badgeEn: 'Free Forever',
    isActive: true,
    bandwidthEgressGB: 50,
    iopsLimitMonthly: 25000,
    computeHoursLimit: 10,
    backupRetentionSnapshots: 2,
    overageStoragePerGBUSD: 0.02,
    overageEgressPerGBUSD: 0.025,
    featuresAr: [
      'مساحة تخزينية سحابية مجانية 10 جيجابايت',
      'تشفير قياسي TLS 1.3 و AES-256',
      'مشاركة الروابط مع حد أقصى 2GB للملف',
      'تاريخ النسخ السابقة لمدة 7 أيام',
      'وصول عبر تطبيقات الجوال والويب',
      'بدون رسوم سحب خفية (Zero Egress)'
    ],
    featuresEn: [
      '10 GB Free Lifetime Storage',
      'TLS 1.3 & Standard AES-256 Encryption',
      'Share links with up to 2 GB per file',
      '7 days file version history',
      'Mobile and Web access',
      'Zero Egress bandwidth fees'
    ]
  },
  {
    id: 'personal',
    nameAr: 'المستخدم النشط',
    nameEn: 'Personal 200GB',
    storageGB: 200,
    priceMonthlyUSD: 2.99,
    priceAnnualUSD: 29.99,
    maxFileSizeGB: 50,
    versionRetentionDays: 30,
    vaultEnabled: true,
    familyMembers: 1,
    badgeAr: 'الأكثر شعبية',
    badgeEn: 'Most Popular',
    isActive: true,
    isPopular: true,
    bandwidthEgressGB: 500,
    iopsLimitMonthly: 150000,
    computeHoursLimit: 40,
    backupRetentionSnapshots: 10,
    overageStoragePerGBUSD: 0.015,
    overageEgressPerGBUSD: 0.018,
    featuresAr: [
      'مساحة تخزينية 200 جيجابايت فائقة السرعة',
      'رفع ملفات ضخمة حتى 50GB عبر Multipart Chunking',
      'الخزنة المشفرة كلياً (Zero-Knowledge Vault)',
      'روابط مشاركة محمية بكلمة سر وتاريخ انتهاء',
      'تاريخ النسخ السابقة واستعادة لحظية لـ 30 يوماً',
      'المزامنة التلقائية لصور الجوال مع ضغط ذكي WebP/HEIC',
      'دعم فني ذو أولوية على مدار الساعة'
    ],
    featuresEn: [
      '200 GB High-Performance Storage',
      'Upload files up to 50 GB via Multipart Chunking',
      'Zero-Knowledge Encrypted Vault',
      'Password protected & expiring share links',
      '30-day point-in-time version restore',
      'Auto camera roll backup with smart compression',
      '24/7 Priority Support'
    ]
  },
  {
    id: 'pro',
    nameAr: 'العائلة والمحترفين',
    nameEn: 'Pro & Family 2TB',
    storageGB: 2000,
    priceMonthlyUSD: 9.99,
    priceAnnualUSD: 99.99,
    maxFileSizeGB: 200,
    versionRetentionDays: 90,
    vaultEnabled: true,
    familyMembers: 5,
    badgeAr: 'أفضل قيمة',
    badgeEn: 'Best Value',
    isActive: true,
    bandwidthEgressGB: 3000,
    iopsLimitMonthly: 1000000,
    computeHoursLimit: 150,
    backupRetentionSnapshots: 30,
    overageStoragePerGBUSD: 0.012,
    overageEgressPerGBUSD: 0.014,
    featuresAr: [
      'مساحة تخزينية عملاقة 2 تيرابايت (2,000GB)',
      'مشاركة المساحة بين 5 أفراد مع حسابات مستقلة تماماً',
      'تاريخ النسخ السابقة الموسع حتى 90 يوماً',
      'الخزنة المشفرة كلياً غير المحدودة لجميع الأفراد',
      'منع التنزيل وحماية الحقوق الرقمية (View-Only Links)',
      'ربط واجهة البرمجة S3 API للمطورين والتطبيقات',
      'ضمان متانة بيانات 99.999999999% عبر 3 مناطق جغرافية'
    ],
    featuresEn: [
      '2 Terabytes (2,000 GB) Massive Storage',
      'Share quota with up to 5 family/team members',
      'Extended 90-day version history retention',
      'Unlimited Zero-Knowledge Vault for all members',
      'Download restriction & DRM protection links',
      'S3-compatible API access for developers',
      '11 Nines (99.999999999%) multi-AZ durability'
    ]
  },
  {
    id: 'flex',
    nameAr: 'المساحة المرنة',
    nameEn: 'Flex Pay-As-You-Go',
    storageGB: 500,
    priceMonthlyUSD: 0,
    priceAnnualUSD: 0,
    priceFlexPerGB: 0.008, // $0.008 per GB
    maxFileSizeGB: 500,
    versionRetentionDays: 90,
    vaultEnabled: true,
    familyMembers: 10,
    badgeAr: 'للشركات والمطورين',
    badgeEn: 'Enterprise & Devs',
    isActive: true,
    bandwidthEgressGB: 10000,
    iopsLimitMonthly: 5000000,
    computeHoursLimit: 500,
    backupRetentionSnapshots: 60,
    overageStoragePerGBUSD: 0.008,
    overageEgressPerGBUSD: 0.01,
    tieredPricingRules: [
      { minStorageGB: 0, maxStorageGB: 500, unitPricePerGBUSD: 0.008, tierNameAr: 'الشريحة الأولى (0 - 500 GB)', tierNameEn: 'Tier 1 (0 - 500 GB)' },
      { minStorageGB: 501, maxStorageGB: 5000, unitPricePerGBUSD: 0.0065, tierNameAr: 'الشريحة الثانية (500GB - 5TB)', tierNameEn: 'Tier 2 (500GB - 5TB)' },
      { minStorageGB: 5001, unitPricePerGBUSD: 0.0048, tierNameAr: 'الشريحة الكبرى (> 5TB)', tierNameEn: 'Tier 3 (Enterprise > 5TB)' },
    ],
    featuresAr: [
      'ادفع فقط مقابل ما تستهلكه بدقة البايت (0.008$ لكل GB)',
      'بدون اشتراك شهري إلزامي أو رسوم خفية',
      'محفظة سحابية مع ميزة الشحن التلقائي',
      'أعلى سقف لحجم الملف المفرد (يتجاوز 100GB)',
      'توجيه هجين للملفات الباردة والساخنة لتقليل التكلفة',
      'مفاتيح S3 API غير محدودة وتكامل مع Cloudflare R2'
    ],
    featuresEn: [
      'Pay only for what you store ($0.008 / GB)',
      'No fixed monthly commitment or egress fees',
      'Cloud wallet balance with auto-recharge',
      'Massive single-file support (>100 GB)',
      'Intelligent Hot/Cold tiering lifecycle',
      'Full S3 API access & Cloudflare R2 zero egress'
    ]
  }
];

export const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess-current',
    deviceName: 'iPhone 16 Pro Max',
    deviceType: 'mobile',
    os: 'iOS 18.2',
    browser: 'Rawaj iOS Native App',
    locationAr: 'الرياض، المملكة العربية السعودية',
    locationEn: 'Riyadh, Saudi Arabia',
    ipAddress: '158.140.220.14',
    lastActive: 'نشط الآن',
    isCurrent: true
  },
  {
    id: 'sess-2',
    deviceName: 'MacBook Pro 16" M3 Max',
    deviceType: 'desktop',
    os: 'macOS Sequoia 15.1',
    browser: 'Chrome 132.0 (Apple Silicon)',
    locationAr: 'دبي، الإمارات العربية المتحدة',
    locationEn: 'Dubai, United Arab Emirates',
    ipAddress: '94.200.112.89',
    lastActive: 'منذ ساعتين',
    isCurrent: false
  },
  {
    id: 'sess-3',
    deviceName: 'Custom Workstation PC',
    deviceType: 'desktop',
    os: 'Windows 11 Enterprise',
    browser: 'Edge 131.0',
    locationAr: 'صنعاء / القاهرة',
    locationEn: 'Sanaa / Cairo Region',
    ipAddress: '197.38.45.102',
    lastActive: 'أمس الساعة 18:20',
    isCurrent: false
  },
  {
    id: 'sess-4',
    deviceName: 'iPad Air 13" M2',
    deviceType: 'tablet',
    os: 'iPadOS 18.1',
    browser: 'Safari Mobile',
    locationAr: 'لندن، المملكة المتحدة',
    locationEn: 'London, United Kingdom',
    ipAddress: '51.148.21.33',
    lastActive: 'منذ 3 أيام',
    isCurrent: false
  }
];

export const INITIAL_SECURITY_AUDIT: SecurityAuditItem[] = [
  {
    id: 'aud-1',
    actionAr: 'تسجيل دخول ناجح عبر مفتاح مرور (Passkey / FIDO2)',
    actionEn: 'Successful sign-in via Passkey (FIDO2 / Biometrics)',
    timestamp: '2026-11-07 08:32:10 UTC',
    ip: '158.140.220.14',
    status: 'success',
    details: 'iPhone 16 Pro Max Biometric Authenticator'
  },
  {
    id: 'aud-2',
    actionAr: 'توليد رابط مشاركة محمي بكلمة سر وتاريخ انتهاء',
    actionEn: 'Secure share link created with password & expiration',
    timestamp: '2026-11-06 15:45:22 UTC',
    ip: '158.140.220.14',
    status: 'success',
    details: 'Rawaj_Cloud_Whitepaper_Architecture_v3.pdf'
  },
  {
    id: 'aud-3',
    actionAr: 'إلغاء جلسة عن بعد لجهاز قديم بنجاح',
    actionEn: 'Remote session revoked for outdated device',
    timestamp: '2026-11-05 12:10:05 UTC',
    ip: '94.200.112.89',
    status: 'warning',
    details: 'Samsung Galaxy S22 terminated by user'
  },
  {
    id: 'aud-4',
    actionAr: 'فك تشفير محتويات الخزنة المشفرة كلياً بنجاح (Argon2id)',
    actionEn: 'Zero-Knowledge Vault unlocked with client key',
    timestamp: '2026-11-05 21:00:15 UTC',
    ip: '158.140.220.14',
    status: 'success',
    details: '100,000 PBKDF2 iterations validated in browser'
  }
];

export const INITIAL_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: 'sub-2026-pro',
    planId: 'pro',
    planNameAr: 'باقة المحترفين السحابية Pro 2TB',
    planNameEn: 'Pro Cloud 2TB',
    storageGB: 2048,
    status: 'active',
    billingCycle: 'annual',
    priceUSD: 99.99,
    startDate: '2026-01-15T00:00:00Z',
    nextRenewalDate: '2027-01-15T00:00:00Z',
    paymentMethod: 'mada',
    paymentMethodDetails: 'بطاقة مدى الرقمية ···· 8842',
    autoRenew: true,
    invoices: [
      {
        id: 'inv-2026-01',
        invoiceNumber: 'INV-RAWJ-2026-8812',
        date: '2026-01-15',
        amountUSD: 99.99,
        status: 'paid',
        billingPeriod: '15 يناير 2026 - 15 يناير 2027',
        paymentMethod: 'مدى (Mada Debit)'
      },
      {
        id: 'inv-2025-01',
        invoiceNumber: 'INV-RAWJ-2025-4209',
        date: '2025-01-15',
        amountUSD: 29.99,
        status: 'paid',
        billingPeriod: '15 يناير 2025 - 15 يناير 2026',
        paymentMethod: 'Apple Pay'
      }
    ]
  }
];
