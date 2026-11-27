import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Upload,
  Search,
  ChevronRight,
  ChevronLeft,
  Download,
  Trash2,
  ExternalLink,
  AlertCircle,
  User,
  Building2,
  CreditCard,
  Zap,
  MessageCircle,
  Check,
  X,
  Plus,
  Link2,
} from 'lucide-react';

export type SocialPlatformId =
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'tiktok'
  | 'snapchat'
  | 'whatsapp';

export type VerificationAccountType = 'personal' | 'business';

export type VerificationRequestStatus =
  | 'submitted'
  | 'in_review'
  | 'action_required'
  | 'verified';

export interface SocialPlatformSpec {
  id: SocialPlatformId;
  nameAr: string;
  nameEn: string;
  badgeTitleAr: string;
  badgeTitleEn: string;
  badgeColor: string;
  brandBg: string;
  personalPriceUSD: number;
  businessPriceUSD: number;
  cycleAr: string;
  cycleEn: string;
  turnaroundAr: string;
  turnaroundEn: string;
  requirementsAr: string[];
  requirementsEn: string[];
}

export interface VerificationRequestRecord {
  id: string;
  platformId: SocialPlatformId;
  accountType: VerificationAccountType;
  username: string;
  profileUrl: string;
  legalOrBrandName: string;
  niche: string;
  contactEmail: string;
  contactPhone: string;
  paymentMethod: 'kuraimi' | 'floosak' | 'jawali' | 'mada' | 'flex';
  priceUSD: number;
  documentName?: string;
  pressLinks?: string;
  status: VerificationRequestStatus;
  createdAt: string;
  updatedAt: string;
  notesAr?: string;
  notesEn?: string;
}

const STORAGE_KEY = 'rawaj_social_verifications_v1';

export const SOCIAL_PLATFORMS: SocialPlatformSpec[] = [
  {
    id: 'instagram',
    nameAr: 'إنستغرام (Instagram)',
    nameEn: 'Instagram',
    badgeTitleAr: 'شارة Meta Verified الزرقاء',
    badgeTitleEn: 'Meta Verified Blue Badge',
    badgeColor: '#0095F6',
    brandBg: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    personalPriceUSD: 19,
    businessPriceUSD: 49,
    cycleAr: 'شهرياً / رسمي',
    cycleEn: 'Monthly / Official',
    turnaroundAr: '24 – 48 ساعة',
    turnaroundEn: '24 – 48 hours',
    requirementsAr: [
      'تطابق الاسم الكامل وصورة الملف الشخصي مع الهوية الرسمية أو السجل التجاري',
      'تفعيل المصادقة الثنائية (2FA) على الحساب',
      'حساب عام ونشط يحتوي على منشورات حديثة',
    ],
    requirementsEn: [
      'Profile name and photo matching official ID or business registration',
      'Two-factor authentication (2FA) enabled on the account',
      'Public active profile with recent posting history',
    ],
  },
  {
    id: 'facebook',
    nameAr: 'فيسبوك (Facebook)',
    nameEn: 'Facebook',
    badgeTitleAr: 'توثيق الصفحات والحسابات (Meta)',
    badgeTitleEn: 'Meta Page & Profile Verification',
    badgeColor: '#1877F2',
    brandBg: 'bg-[#1877F2]',
    personalPriceUSD: 18,
    businessPriceUSD: 45,
    cycleAr: 'شهرياً / رسمي',
    cycleEn: 'Monthly / Official',
    turnaroundAr: '24 – 72 ساعة',
    turnaroundEn: '24 – 72 hours',
    requirementsAr: [
      'إثبات ملكية الصفحة عبر مدير الأعمال (Meta Business Manager)',
      'اكتمال بيانات النبذة التعريفية والموقع الإلكتروني الرسمي',
      'خلو الصفحة من مخالفات سياسات النشر خلال آخر 90 يوماً',
    ],
    requirementsEn: [
      'Verified ownership via Meta Business Manager',
      'Completed About section and official website link',
      'Clean policy record over the past 90 days',
    ],
  },
  {
    id: 'x',
    nameAr: 'منصة إكس (X / Twitter)',
    nameEn: 'X (Twitter)',
    badgeTitleAr: 'الشارة الزرقاء أو الذهبية للشركات',
    badgeTitleEn: 'Blue Premium or Gold Organization Badge',
    badgeColor: '#1D9BF0',
    brandBg: 'bg-slate-900 dark:bg-slate-700',
    personalPriceUSD: 14,
    businessPriceUSD: 199,
    cycleAr: 'شهرياً / رسمي',
    cycleEn: 'Monthly / Official',
    turnaroundAr: '1 – 3 أيام عمل',
    turnaroundEn: '1 – 3 business days',
    requirementsAr: [
      'رقم هاتف موثق ومربوط بالحساب مع بريد إلكتروني رسمي',
      'عدم تعديل اسم المستخدم أو الصورة خلال آخر 3 أيام قبل التقديم',
      'للشارة الذهبية: دومين رسمي وبريد عمل مطابق للعلامة التجارية',
    ],
    requirementsEn: [
      'Verified phone number and email linked to the account',
      'No username or avatar edits within the last 3 days',
      'For Gold Badge: official corporate domain and business email',
    ],
  },
  {
    id: 'tiktok',
    nameAr: 'تيك توك (TikTok)',
    nameEn: 'TikTok',
    badgeTitleAr: 'الشارة الزرقاء لصناع المحتوى والعلامات',
    badgeTitleEn: 'TikTok Verified Creator & Brand Badge',
    badgeColor: '#20D5EC',
    brandBg: 'bg-slate-950 dark:bg-slate-800',
    personalPriceUSD: 120,
    businessPriceUSD: 180,
    cycleAr: 'طلب ملف توثيق شامل',
    cycleEn: 'Full Verification Filing',
    turnaroundAr: '5 – 14 يوم عمل',
    turnaroundEn: '5 – 14 business days',
    requirementsAr: [
      'ملف تغطية إعلامية أو روابط مقالات تثبت الشهرة والأصالة',
      'محتوى أصلي متوافق مع إرشادات المجتمع دون انتهاكات',
      'تأكيد البريد الإلكتروني وتفعيل التحقق بخطوتين',
    ],
    requirementsEn: [
      'Notable press coverage or verified media references',
      'Original content compliant with Community Guidelines',
      'Verified email and multi-factor authentication enabled',
    ],
  },
  {
    id: 'snapchat',
    nameAr: 'سناب شات (Snapchat)',
    nameEn: 'Snapchat',
    badgeTitleAr: 'النجمة الذهبية للملف العام (Snap Star)',
    badgeTitleEn: 'Snapchat Public Profile Gold Star',
    badgeColor: '#F59E0B',
    brandBg: 'bg-[#FFFC00] text-slate-950',
    personalPriceUSD: 140,
    businessPriceUSD: 210,
    cycleAr: 'تجهيز وتقديم الملف',
    cycleEn: 'Verification Dossier Filing',
    turnaroundAr: '7 – 14 يوم عمل',
    turnaroundEn: '7 – 14 business days',
    requirementsAr: [
      'تحويل الحساب إلى ملف عام (Public Profile) بنشاط مستمر',
      'توثيق هوية صانع المحتوى أو العلامة التجارية رسمياً',
      'ارتباط الحساب بحضور رقمي موثق على منصات أخرى أو موقع رسمي',
    ],
    requirementsEn: [
      'Active Public Profile with consistent Stories or Spotlight publishing',
      'Verified creator identity or registered trademark documentation',
      'Established presence across web or verified sister platforms',
    ],
  },
  {
    id: 'whatsapp',
    nameAr: 'واتساب للأعمال (WhatsApp Business)',
    nameEn: 'WhatsApp Business',
    badgeTitleAr: 'شارة الحساب التجاري الرسمي (Meta)',
    badgeTitleEn: 'Official Business Account Badge',
    badgeColor: '#1AD062',
    brandBg: 'bg-[#16A34A]',
    personalPriceUSD: 35,
    businessPriceUSD: 65,
    cycleAr: 'تأسيس وتوثيق API / Meta',
    cycleEn: 'Meta Business API Verification',
    turnaroundAr: '2 – 5 أيام عمل',
    turnaroundEn: '2 – 5 business days',
    requirementsAr: [
      'حساب Meta Business موثق مع سجل تجاري ساري المفعول',
      'موقع إلكتروني رسمي يطابق اسم النشاط التجاري على واتساب',
      'رقم هاتف مخصص للنشاط غير مرتبط بحساب واتساب شخصي',
    ],
    requirementsEn: [
      'Verified Meta Business account with valid commercial registration',
      'Official website matching the WhatsApp Business display name',
      'Dedicated business phone number not tied to a personal account',
    ],
  },
];

const INITIAL_REQUESTS: VerificationRequestRecord[] = [
  {
    id: 'VER-2026-4810',
    platformId: 'instagram',
    accountType: 'business',
    username: '@rawajcloud',
    profileUrl: 'https://instagram.com/rawajcloud',
    legalOrBrandName: 'شركة رواج كلاود للحلول السحابية',
    niche: 'tech',
    contactEmail: 'rawajtel4@gmail.com',
    contactPhone: '770600046',
    paymentMethod: 'flex',
    priceUSD: 49,
    documentName: 'Rawaj_Commercial_Registry_2026.pdf',
    status: 'verified',
    createdAt: '2026-11-12T09:15:00Z',
    updatedAt: '2026-11-14T11:30:00Z',
    notesAr: 'تمت مطابقة السجل التجاري وتفعيل الشارة الزرقاء الرسمية بنجاح.',
    notesEn: 'Commercial registry verified and official Meta Blue Badge activated.',
  },
  {
    id: 'VER-2026-5204',
    platformId: 'whatsapp',
    accountType: 'business',
    username: '+967 730 005 955',
    profileUrl: 'https://wa.me/967730005955',
    legalOrBrandName: 'دعم رواج كلاود الرسمي',
    niche: 'business',
    contactEmail: 'rawajtel4@gmail.com',
    contactPhone: '730005955',
    paymentMethod: 'kuraimi',
    priceUSD: 65,
    documentName: 'Meta_Business_Domain_Proof.pdf',
    status: 'in_review',
    createdAt: '2026-11-23T14:40:00Z',
    updatedAt: '2026-11-25T16:10:00Z',
    notesAr: 'تم رفع ملف التوثيق لمدير أعمال Meta وبانتظار المصادقة النهائية للاسم التجاري.',
    notesEn: 'Submitted to Meta Business Manager; awaiting final display name approval.',
  },
];

const PlatformGlyph: React.FC<{ platformId: SocialPlatformId; className?: string }> = ({
  platformId,
  className = 'w-5 h-5',
}) => {
  switch (platformId) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M12 3c-3.1 0-5.2 2.2-5.2 5.4v2.1c-.4.2-1.1.1-1.5.5-.3.3-.2.9.3 1.1.8.3 1.4.6 1.3 1.2-.2 1.1-1.7 2.5-3.4 2.9-.5.1-.6.8-.1 1 .9.4 2 .5 2.6.8.3.2.3.8.7 1 .8.4 1.8-.1 2.9.3.8.3 1.5.7 2.4.7s1.6-.4 2.4-.7c1.1-.4 2.1.1 2.9-.3.4-.2.4-.8.7-1 .6-.3 1.7-.4 2.6-.8.5-.2.4-.9-.1-1-1.7-.4-3.2-1.8-3.4-2.9-.1-.6.5-.9 1.3-1.2.5-.2.6-.8.3-1.1-.4-.4-1.1-.3-1.5-.5V8.4C17.2 5.2 15.1 3 12 3Z" />
        </svg>
      );
    case 'whatsapp':
      return <MessageCircle className={className} aria-hidden="true" />;
  }
};

interface SocialVerificationViewProps {
  embedded?: boolean;
}

export const SocialVerificationView: React.FC<SocialVerificationViewProps> = ({
  embedded = false,
}) => {
  const { lang, currentUser, showNotification, logActivity } = useStorage();
  const isAr = lang === 'ar';

  const docInputRef = useRef<HTMLInputElement>(null);

  const [requests, setRequests] = useState<VerificationRequestRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_REQUESTS;
  });

  const [activeSubView, setActiveSubView] = useState<'platforms' | 'apply' | 'tracker'>('platforms');
  const [accountType, setAccountType] = useState<VerificationAccountType>('personal');
  const [selectedPlatformId, setSelectedPlatformId] = useState<SocialPlatformId>('instagram');

  // Application form state
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [legalOrBrandName, setLegalOrBrandName] = useState(currentUser?.name || '');
  const [niche, setNiche] = useState('business');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'rawajtel4@gmail.com');
  const [contactPhone, setContactPhone] = useState('770600046');
  const [paymentMethod, setPaymentMethod] = useState<'kuraimi' | 'floosak' | 'jawali' | 'mada' | 'flex'>('kuraimi');
  const [pressLinks, setPressLinks] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Readiness checklist state
  const [checks, setChecks] = useState({
    twoFactor: true,
    officialId: true,
    publicProfile: true,
    nameMatches: true,
    policyClean: true,
  });

  // Tracker filter & search
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationRequestStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [certificateRecord, setCertificateRecord] = useState<VerificationRequestRecord | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch {
      // ignore quota errors
    }
  }, [requests]);

  const selectedPlatform = useMemo(
    () => SOCIAL_PLATFORMS.find(p => p.id === selectedPlatformId) || SOCIAL_PLATFORMS[0],
    [selectedPlatformId]
  );

  const selectedPriceUSD =
    accountType === 'personal' ? selectedPlatform.personalPriceUSD : selectedPlatform.businessPriceUSD;

  const completedChecksCount = Object.values(checks).filter(Boolean).length;

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter(req => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (!q) return true;
      const plat = SOCIAL_PLATFORMS.find(p => p.id === req.platformId);
      return (
        req.id.toLowerCase().includes(q) ||
        req.username.toLowerCase().includes(q) ||
        req.legalOrBrandName.toLowerCase().includes(q) ||
        (plat && (plat.nameAr.toLowerCase().includes(q) || plat.nameEn.toLowerCase().includes(q)))
      );
    });
  }, [requests, statusFilter, searchQuery]);

  const handleStartApplication = (platformId: SocialPlatformId) => {
    setSelectedPlatformId(platformId);
    setFormError(null);
    setActiveSubView('apply');
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setFormError(
        isAr ? 'حجم المستند يتجاوز الحد الأقصى (10 ميجابايت).' : 'Document exceeds 10 MB limit.'
      );
      return;
    }
    setFormError(null);
    setUploadedDocName(`${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
    e.target.value = '';
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUser = username.trim();
    const cleanName = legalOrBrandName.trim();
    const cleanPhone = contactPhone.trim();

    if (!cleanUser) {
      setFormError(isAr ? 'يرجى إدخال اسم المستخدم أو رقم الحساب.' : 'Please enter the account username or handle.');
      return;
    }
    if (!cleanName) {
      setFormError(isAr ? 'يرجى إدخال الاسم القانوني أو اسم العلامة التجارية.' : 'Please enter the legal or brand name.');
      return;
    }
    if (!cleanPhone) {
      setFormError(isAr ? 'يرجى إدخال رقم واتساب للتواصل وتأكيد التفعيل.' : 'Please enter a WhatsApp contact number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const normalizedHandle =
        selectedPlatformId === 'whatsapp'
          ? cleanUser
          : cleanUser.startsWith('@')
          ? cleanUser
          : `@${cleanUser}`;

      const defaultUrl =
        profileUrl.trim() ||
        (selectedPlatformId === 'whatsapp'
          ? `https://wa.me/${cleanUser.replace(/\D/g, '')}`
          : `https://${selectedPlatformId === 'x' ? 'x.com' : `${selectedPlatformId}.com`}/${normalizedHandle.replace(/^@/, '')}`);

      const newReq: VerificationRequestRecord = {
        id: `VER-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        platformId: selectedPlatformId,
        accountType,
        username: normalizedHandle,
        profileUrl: defaultUrl,
        legalOrBrandName: cleanName,
        niche,
        contactEmail: contactEmail.trim() || 'rawajtel4@gmail.com',
        contactPhone: cleanPhone,
        paymentMethod,
        priceUSD: selectedPriceUSD,
        documentName: uploadedDocName || undefined,
        pressLinks: pressLinks.trim() || undefined,
        status: completedChecksCount < 4 ? 'action_required' : 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notesAr:
          completedChecksCount < 4
            ? 'يرجى استكمال متطلبات الأهلية (مثل المصادقة الثنائية والمستند الرسمي) لتسريع الموافقة.'
            : 'تم استلام طلب التوثيق بنجاح وجارٍ مراجعة الملف من قبل فريق رواج كلاود.',
        notesEn:
          completedChecksCount < 4
            ? 'Additional eligibility items recommended (2FA & official ID) to expedite platform review.'
            : 'Verification request received and queued for Rawaj Cloud compliance review.',
      };

      setRequests(prev => [newReq, ...prev]);
      logActivity({
        type: 'security',
        titleAr: `طلب توثيق حساب: ${selectedPlatform.nameAr}`,
        titleEn: `Social Verification Request: ${selectedPlatform.nameEn}`,
        descriptionAr: `تم تسجيل طلب توثيق الحساب ${normalizedHandle} (${accountType === 'business' ? 'تجاري' : 'شخصي'}) بالمرجع ${newReq.id}`,
        descriptionEn: `Registered ${accountType} verification for ${normalizedHandle} (Ref: ${newReq.id})`,
        targetName: normalizedHandle,
        targetType: 'security',
        ipAddress: '158.140.220.14',
        device: 'Rawaj Verification Desk',
        actor: currentUser?.email || 'rawajtel4@gmail.com',
        severity: 'success',
        metadata: {
          requestId: newReq.id,
          platform: selectedPlatformId,
          priceUSD: selectedPriceUSD,
        },
      });

      showNotification(
        `تم تسجيل طلب توثيق ${normalizedHandle} بنجاح (${newReq.id})`,
        `Verification request ${newReq.id} for ${normalizedHandle} submitted`,
        'success'
      );

      setUsername('');
      setProfileUrl('');
      setPressLinks('');
      setUploadedDocName('');
      setIsSubmitting(false);
      setActiveSubView('tracker');
    }, 550);
  };

  const handleAdvanceStatus = (id: string) => {
    setRequests(prev =>
      prev.map(req => {
        if (req.id !== id) return req;
        const nextStatus: VerificationRequestStatus =
          req.status === 'action_required'
            ? 'submitted'
            : req.status === 'submitted'
            ? 'in_review'
            : 'verified';
        return {
          ...req,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          notesAr:
            nextStatus === 'in_review'
              ? 'تم رفع المستندات للمنصة الأم وجارٍ مطابقة البيانات الرسمية.'
              : nextStatus === 'verified'
              ? 'تهانينا! تم قبول الطلب وتفعيل شارة التوثيق الرسمية على الحساب.'
              : 'تم استكمال المتطلبات وإعادة إدراج الطلب في طابور المراجعة.',
          notesEn:
            nextStatus === 'in_review'
              ? 'Dossier forwarded to platform verification desk for identity review.'
              : nextStatus === 'verified'
              ? 'Approved! Official verified badge is now active on the account.'
              : 'Requirements completed; request returned to verification queue.',
        };
      })
    );
    showNotification(
      'تم تحديث حالة طلب التوثيق بنجاح',
      'Verification request status updated',
      'info'
    );
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    showNotification('تم إلغاء وإزالة طلب التوثيق', 'Verification request removed', 'info');
  };

  const handleDownloadReceipt = (req: VerificationRequestRecord) => {
    const plat = SOCIAL_PLATFORMS.find(p => p.id === req.platformId);
    const content = isAr
      ? [
          '====================================================',
          'شهادة / إيصال طلب توثيق حساب — رواج كلاود (Rawaj Cloud)',
          '====================================================',
          `رقم المرجع: ${req.id}`,
          `المنصة: ${plat?.nameAr || req.platformId}`,
          `نوع الحساب: ${req.accountType === 'business' ? 'شركة / علامة تجارية' : 'شخصي / صانع محتوى'}`,
          `اسم المستخدم: ${req.username}`,
          `رابط الحساب: ${req.profileUrl}`,
          `الاسم الرسمي: ${req.legalOrBrandName}`,
          `الحالة الحالية: ${getStatusMeta(req.status).ar}`,
          `القيمة: $${req.priceUSD.toFixed(2)} USD`,
          `تاريخ الطلب: ${new Date(req.createdAt).toLocaleString('ar-SA')}`,
          '====================================================',
        ].join('\n')
      : [
          '====================================================',
          'SOCIAL VERIFICATION RECEIPT — RAWAJ CLOUD',
          '====================================================',
          `Reference ID: ${req.id}`,
          `Platform: ${plat?.nameEn || req.platformId}`,
          `Account Type: ${req.accountType}`,
          `Handle: ${req.username}`,
          `Profile URL: ${req.profileUrl}`,
          `Legal / Brand Name: ${req.legalOrBrandName}`,
          `Current Status: ${getStatusMeta(req.status).en}`,
          `Amount: $${req.priceUSD.toFixed(2)} USD`,
          `Submitted At: ${new Date(req.createdAt).toISOString()}`,
          '====================================================',
        ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rawaj-Verification-${req.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusMeta = (status: VerificationRequestStatus) => {
    switch (status) {
      case 'submitted':
        return {
          ar: 'تم الاستلام',
          en: 'Submitted',
          stepIndex: 1,
          textCls: 'text-[#4E115A] dark:text-purple-300',
        };
      case 'in_review':
        return {
          ar: 'قيد المراجعة',
          en: 'In Review',
          stepIndex: 2,
          textCls: 'text-amber-600 dark:text-amber-400',
        };
      case 'action_required':
        return {
          ar: 'يحتاج مستندات',
          en: 'Action Required',
          stepIndex: 1,
          textCls: 'text-rose-600 dark:text-rose-400',
        };
      case 'verified':
        return {
          ar: 'تم التوثيق',
          en: 'Verified',
          stepIndex: 4,
          textCls: 'text-emerald-600 dark:text-emerald-400',
        };
    }
  };

  const verifiedCount = requests.filter(r => r.status === 'verified').length;
  const activeReviewCount = requests.filter(
    r => r.status === 'submitted' || r.status === 'in_review'
  ).length;

  const DirArrow = isAr ? ChevronLeft : ChevronRight;

  return (
    <div
      className={
        embedded
          ? 'space-y-6'
          : 'w-full flex-1 bg-white dark:bg-slate-950 p-4 sm:p-6 lg:p-8 pb-28 space-y-6 max-w-6xl mx-auto'
      }
    >
      {/* Hidden Document Upload Input */}
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleDocFileChange}
        className="hidden"
      />

      {/* Top Header & Navigation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#DCD3DF] dark:border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#3B004E] text-white flex items-center justify-center shrink-0">
            <BadgeCheck className="w-6 h-6 text-[#38BDF8]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-[#1E1E24] dark:text-white tracking-tight text-balance">
              {isAr ? 'توثيق حسابات مواقع التواصل الاجتماعي' : 'Social Media Account Verification'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6E6A75] dark:text-slate-400 mt-1">
              <span>{isAr ? '6 منصات عالمية مدعومة' : '6 Supported Platforms'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {verifiedCount} {isAr ? 'حساب موثق' : 'Verified'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {activeReviewCount} {isAr ? 'قيد المراجعة' : 'In Review'}
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Sub-View Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 w-fit self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubView('platforms')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubView === 'platforms'
                ? 'bg-[#3B004E] text-white'
                : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
            }`}
          >
            {isAr ? 'المنصات والباقات' : 'Platforms'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('apply')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubView === 'apply'
                ? 'bg-[#3B004E] text-white'
                : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
            }`}
          >
            {isAr ? 'تقديم طلب توثيق' : 'New Request'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('tracker')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubView === 'tracker'
                ? 'bg-[#3B004E] text-white'
                : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
            }`}
          >
            {isAr ? `متابعة الطلبات (${requests.length})` : `My Requests (${requests.length})`}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* VIEW 1: PLATFORMS CATALOG & ELIGIBILITY MATRIX                       */}
      {/* ==================================================================== */}
      {activeSubView === 'platforms' && (
        <div className="space-y-6">
          {/* Account Tier Toggle Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#6E6A75] dark:text-slate-400 max-w-2xl leading-relaxed">
              {isAr
                ? 'اختر المنصة ونوع الحساب (أفراد وصناع محتوى أو شركات وعلامات تجارية) لتجهيز ملف التوثيق الرسمي بضمان مطابقة المعايير ودفع محلي ميسر.'
                : 'Select your target platform and account tier to prepare an official verification dossier with local payment options.'}
            </p>

            <div className="inline-flex items-center p-1 rounded-xl bg-[#F5EFF7] dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAccountType('personal')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  accountType === 'personal'
                    ? 'bg-white dark:bg-slate-800 text-[#3B004E] dark:text-white shadow-2xs'
                    : 'text-[#6E6A75] dark:text-slate-400'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{isAr ? 'أفراد وصناع محتوى' : 'Personal / Creator'}</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('business')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  accountType === 'business'
                    ? 'bg-white dark:bg-slate-800 text-[#3B004E] dark:text-white shadow-2xs'
                    : 'text-[#6E6A75] dark:text-slate-400'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'شركات وعلامات تجارية' : 'Business / Brand'}</span>
              </button>
            </div>
          </div>

          {/* 6 Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIAL_PLATFORMS.map(platform => {
              const price =
                accountType === 'personal' ? platform.personalPriceUSD : platform.businessPriceUSD;
              const reqs = isAr ? platform.requirementsAr : platform.requirementsEn;

              return (
                <div
                  key={platform.id}
                  className="p-5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-4 hover:border-[#7C3AED]/60 transition-colors"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl ${platform.brandBg} ${
                            platform.id === 'snapchat' ? 'text-slate-950' : 'text-white'
                          } flex items-center justify-center shrink-0`}
                        >
                          <PlatformGlyph platformId={platform.id} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-sm font-black text-[#1E1E24] dark:text-white truncate">
                            {isAr ? platform.nameAr : platform.nameEn}
                          </h2>
                          <div className="text-xs text-[#6E6A75] dark:text-slate-400 truncate mt-0.5">
                            {isAr ? platform.badgeTitleAr : platform.badgeTitleEn}
                          </div>
                        </div>
                      </div>
                      <BadgeCheck
                        className="w-5 h-5 shrink-0"
                        style={{ color: platform.badgeColor }}
                      />
                    </div>

                    <div className="flex items-baseline justify-between py-2.5 border-y border-[#DCD3DF]/60 dark:border-slate-800">
                      <div className="font-mono tabular-nums">
                        <span className="text-2xl font-black text-[#3B004E] dark:text-purple-200">
                          ${price}
                        </span>
                        <span className="text-[11px] text-[#6E6A75] dark:text-slate-400 ms-1.5">
                          USD
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 text-end">
                        <div>{isAr ? platform.cycleAr : platform.cycleEn}</div>
                        <div className="font-mono tabular-nums text-[#1E1E24] dark:text-slate-300 font-semibold">
                          {isAr ? platform.turnaroundAr : platform.turnaroundEn}
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-[#6E6A75] dark:text-slate-300">
                      {reqs.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartApplication(platform.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{isAr ? 'ابدأ طلب التوثيق' : 'Start Verification'}</span>
                    <DirArrow className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 2: VERIFICATION APPLICATION FORM & READINESS CHECKLIST          */}
      {/* ==================================================================== */}
      {activeSubView === 'apply' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form Column (2/3) */}
          <form
            onSubmit={handleSubmitVerification}
            className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5"
          >
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#DCD3DF]/70 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'نموذج تقديم ملف التوثيق الرسمي' : 'Official Verification Application'}
                </h2>
                <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
                  {isAr
                    ? 'أدخل بيانات الحساب بدقة لتجهيز ملف المطابقة وتقديمه مباشرة للمنصة.'
                    : 'Provide accurate account details to prepare and submit your verification dossier.'}
                </p>
              </div>
              <div className="font-mono tabular-nums text-end shrink-0">
                <div className="text-lg font-black text-[#3B004E] dark:text-purple-200">
                  ${selectedPriceUSD} USD
                </div>
                <div className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                  {isAr ? selectedPlatform.turnaroundAr : selectedPlatform.turnaroundEn}
                </div>
              </div>
            </div>

            {/* Platform Selector Strip */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'اختر منصة التواصل الاجتماعي' : 'Target Platform'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOCIAL_PLATFORMS.map(p => {
                  const active = p.id === selectedPlatformId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlatformId(p.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'border-[#3B004E] bg-[#F5EFF7] dark:bg-purple-950/40 text-[#3B004E] dark:text-purple-200'
                          : 'border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-950 text-[#6E6A75] dark:text-slate-300 hover:border-[#7C3AED]/50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg ${p.brandBg} ${
                          p.id === 'snapchat' ? 'text-slate-950' : 'text-white'
                        } flex items-center justify-center shrink-0`}
                      >
                        <PlatformGlyph platformId={p.id} className="w-3.5 h-3.5" />
                      </span>
                      <span className="truncate">{isAr ? p.nameAr.split(' (')[0] : p.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Type & Niche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'فئة التوثيق' : 'Verification Tier'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('personal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      accountType === 'personal'
                        ? 'bg-[#3B004E] text-white border-[#3B004E]'
                        : 'border-[#DCD3DF] dark:border-slate-700 text-[#6E6A75] dark:text-slate-300'
                    }`}
                  >
                    {isAr ? 'شخصي' : 'Personal'} (${selectedPlatform.personalPriceUSD})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('business')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      accountType === 'business'
                        ? 'bg-[#3B004E] text-white border-[#3B004E]'
                        : 'border-[#DCD3DF] dark:border-slate-700 text-[#6E6A75] dark:text-slate-300'
                    }`}
                  >
                    {isAr ? 'شركة / متجر' : 'Business'} (${selectedPlatform.businessPriceUSD})
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'مجال الحساب / النشاط' : 'Account Category'}
                </label>
                <select
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                >
                  <option value="business">{isAr ? 'شركة أو علامة تجارية' : 'Business / Brand'}</option>
                  <option value="creator">{isAr ? 'صانع محتوى أو مؤثر' : 'Digital Creator / Influencer'}</option>
                  <option value="tech">{isAr ? 'تقنية وبرمجيات' : 'Technology & Software'}</option>
                  <option value="media">{isAr ? 'إعلام وصحافة' : 'Media & News'}</option>
                  <option value="ecommerce">{isAr ? 'متجر إلكتروني' : 'E-Commerce Store'}</option>
                  <option value="public">{isAr ? 'شخصية عامة' : 'Public Figure'}</option>
                </select>
              </div>
            </div>

            {/* Account Handle & Profile URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {selectedPlatformId === 'whatsapp'
                    ? isAr
                      ? 'رقم واتساب للأعمال المراد توثيقه'
                      : 'WhatsApp Business Number'
                    : isAr
                    ? 'اسم المستخدم (@Username)'
                    : 'Account Handle (@Username)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={selectedPlatformId === 'whatsapp' ? '+967 770 000 000' : '@yourbrand'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'رابط الحساب أو الموقع الرسمي' : 'Profile or Official Website URL'}
                </label>
                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
                  <input
                    type="url"
                    dir="ltr"
                    value={profileUrl}
                    onChange={e => setProfileUrl(e.target.value)}
                    placeholder="https://instagram.com/yourbrand"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            </div>

            {/* Legal Name, Email & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'الاسم القانوني / التجاري' : 'Legal / Brand Name'}
                </label>
                <input
                  type="text"
                  value={legalOrBrandName}
                  onChange={e => setLegalOrBrandName(e.target.value)}
                  placeholder={isAr ? 'الاسم المطابق للهوية أو السجل' : 'Name matching official ID'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'البريد الإلكتروني الرسمي' : 'Official Email'}
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'رقم واتساب للتواصل' : 'Contact WhatsApp'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="770000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>
            </div>

            {/* Supporting Document Upload & Press Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'مستند إثبات الهوية أو السجل التجاري (اختياري الآن)' : 'ID / Business Registry Document (Optional)'}
                </label>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-[#DCD3DF] dark:border-slate-700 bg-[#FAF7FC] dark:bg-slate-950 hover:border-[#7C3AED] text-xs font-semibold text-[#3B004E] dark:text-purple-200 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <span className="truncate">
                    {uploadedDocName || (isAr ? 'ارفع ملف PDF أو صورة المستند' : 'Upload PDF or ID image')}
                  </span>
                  <Upload className="w-4 h-4 shrink-0" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'روابط تغطية إعلامية أو موقع إلكتروني (اختياري)' : 'Press Articles or References (Optional)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={pressLinks}
                  onChange={e => setPressLinks(e.target.value)}
                  placeholder="https://news.example.com/article"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'طريقة الدفع المفضلة' : 'Preferred Payment Method'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'kuraimi', ar: 'بنك الكريمي', en: 'Kuraimi' },
                    { id: 'floosak', ar: 'فلوسك', en: 'Floosak' },
                    { id: 'jawali', ar: 'جوالي', en: 'Jawali' },
                    { id: 'mada', ar: 'مدى / فيزا', en: 'Mada / Visa', icon: CreditCard },
                    { id: 'flex', ar: 'محفظة Flex', en: 'Flex Wallet', icon: Zap },
                  ] as const
                ).map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      paymentMethod === method.id
                        ? 'border-[#3B004E] bg-[#3B004E] text-white'
                        : 'border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-950 text-[#1E1E24] dark:text-slate-200 hover:border-[#7C3AED]'
                    }`}
                  >
                    {'icon' in method && method.icon ? <method.icon className="w-3.5 h-3.5" /> : null}
                    <span className="truncate">{isAr ? method.ar : method.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#DCD3DF]/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveSubView('platforms')}
                className="px-4 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#6E6A75] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {isAr ? 'العودة للمنصات' : 'Back'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <BadgeCheck className="w-4 h-4 text-[#38BDF8]" />
                <span>
                  {isSubmitting
                    ? isAr
                      ? 'جارٍ تسجيل الطلب...'
                      : 'Submitting...'
                    : isAr
                    ? `تأكيد وإرسال طلب التوثيق ($${selectedPriceUSD})`
                    : `Submit Verification Request ($${selectedPriceUSD})`}
                </span>
              </button>
            </div>
          </form>

          {/* Readiness Checklist Sidebar (1/3) */}
          <div className="p-5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#FAF7FC] dark:bg-slate-900/70 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#DCD3DF]/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3B004E] dark:text-purple-300" />
                <h3 className="text-sm font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'قائمة فحص جاهزية الحساب' : 'Account Readiness Checklist'}
                </h3>
              </div>
              <span className="font-mono tabular-nums text-xs font-bold text-[#3B004E] dark:text-purple-300">
                {completedChecksCount}/5
              </span>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  {
                    key: 'twoFactor',
                    ar: 'المصادقة الثنائية (2FA) مفعّلة على الحساب',
                    en: 'Two-factor authentication (2FA) is enabled',
                  },
                  {
                    key: 'officialId',
                    ar: 'توفر هوية حكومية سارية أو سجل تجاري رسمي',
                    en: 'Valid government ID or commercial registration ready',
                  },
                  {
                    key: 'publicProfile',
                    ar: 'الحساب مضبوط على الوضع العام (Public) وليس خاصاً',
                    en: 'Account visibility is set to Public',
                  },
                  {
                    key: 'nameMatches',
                    ar: 'الاسم الظاهر في الحساب يطابق المستند الرسمي',
                    en: 'Profile display name matches official documents',
                  },
                  {
                    key: 'policyClean',
                    ar: 'سجل الحساب خالٍ من انتهاكات سياسات المنصة',
                    en: 'No active community guideline strikes',
                  },
                ] as const
              ).map(item => (
                <label
                  key={item.key}
                  className="flex items-start gap-2.5 text-xs text-[#1E1E24] dark:text-slate-200 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checks[item.key]}
                    onChange={e => setChecks(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="mt-0.5 accent-[#3B004E] rounded cursor-pointer"
                  />
                  <span className="leading-relaxed">{isAr ? item.ar : item.en}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-[#DCD3DF]/70 dark:border-slate-800 space-y-2 text-xs text-[#6E6A75] dark:text-slate-400">
              <div className="font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'ضمان سرية البيانات' : 'Zero-Credential Privacy'}
              </div>
              <p className="leading-relaxed">
                {isAr
                  ? 'لا يطلب فريق رواج كلاود كلمة مرور حسابك أبداً. تتم إجراءات التوثيق رسمياً عبر لوحات Meta Business وبوابات التوثيق المعتمدة فقط.'
                  : 'Rawaj Cloud never asks for your account password. All verifications are processed exclusively through official platform portals.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 3: REQUESTS TRACKER & VERIFICATION TIMELINE                     */}
      {/* ==================================================================== */}
      {activeSubView === 'tracker' && (
        <div className="space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', ar: `الكل (${requests.length})`, en: `All (${requests.length})` },
                  { id: 'in_review', ar: 'قيد المراجعة', en: 'In Review' },
                  { id: 'verified', ar: 'تم التوثيق', en: 'Verified' },
                  { id: 'action_required', ar: 'يحتاج مستندات', en: 'Action Required' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-[#3B004E] text-white border-[#3B004E]'
                      : 'bg-white dark:bg-slate-900 text-[#6E6A75] dark:text-slate-300 border-[#DCD3DF] dark:border-slate-800 hover:border-[#7C3AED]'
                  }`}
                >
                  {isAr ? tab.ar : tab.en}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'بحث بالمعرف أو اسم الحساب...' : 'Search by ref or @handle...'}
                  className="w-full rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-1.5 rounded-xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveSubView('apply')}
                className="px-3 py-1.5 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'طلب جديد' : 'New'}</span>
              </button>
            </div>
          </div>

          {/* Request List */}
          {filteredRequests.length === 0 ? (
            <div className="p-10 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <BadgeCheck className="w-8 h-8 text-[#6E6A75] mx-auto opacity-40" />
              <div className="text-sm font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'لا توجد طلبات توثيق مطابقة' : 'No verification requests found'}
              </div>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400">
                {isAr
                  ? 'ابدأ بتقديم طلب توثيق جديد لأي من حساباتك الاجتماعية لمتابعة حالته هنا.'
                  : 'Submit a verification request for any supported social platform to track progress here.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveSubView('apply')}
                className="px-4 py-2 rounded-xl bg-[#3B004E] text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? 'تقديم أول طلب توثيق' : 'Submit First Request'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(req => {
                const plat = SOCIAL_PLATFORMS.find(p => p.id === req.platformId) || SOCIAL_PLATFORMS[0];
                const meta = getStatusMeta(req.status);
                const whatsappMsg = encodeURIComponent(
                  isAr
                    ? `مرحباً رواج كلاود، أود متابعة طلب توثيق الحساب (${plat.nameAr}) للمعرف ${req.username} — رقم المرجع: ${req.id}`
                    : `Hello Rawaj Cloud, following up on ${plat.nameEn} verification for ${req.username} (Ref: ${req.id})`
                );

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl ${plat.brandBg} ${
                            plat.id === 'snapchat' ? 'text-slate-950' : 'text-white'
                          } flex items-center justify-center shrink-0`}
                        >
                          <PlatformGlyph platformId={plat.id} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-black text-[#1E1E24] dark:text-white font-mono">
                              {req.username}
                            </span>
                            {req.status === 'verified' && (
                              <BadgeCheck
                                className="w-4 h-4 shrink-0"
                                style={{ color: plat.badgeColor }}
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
                            <span>{req.legalOrBrandName}</span>
                            <span aria-hidden="true">·</span>
                            <span>{isAr ? plat.nameAr : plat.nameEn}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{req.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div className="text-end font-mono tabular-nums">
                          <div className={`font-black ${meta.textCls}`}>
                            {isAr ? meta.ar : meta.en}
                          </div>
                          <div className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                            ${req.priceUSD.toFixed(2)} USD
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4-Step Verification Progress Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {(
                        [
                          { step: 1, ar: 'استلام الطلب', en: 'Submitted' },
                          { step: 2, ar: 'فحص الهوية', en: 'Identity Check' },
                          { step: 3, ar: 'مراجعة المنصة', en: 'Platform Review' },
                          { step: 4, ar: 'تفعيل الشارة', en: 'Badge Active' },
                        ] as const
                      ).map(s => {
                        const done = meta.stepIndex >= s.step;
                        return (
                          <div key={s.step} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full transition-colors ${
                                done
                                  ? req.status === 'verified'
                                    ? 'bg-emerald-500'
                                    : 'bg-[#3B004E] dark:bg-purple-400'
                                  : 'bg-slate-200 dark:bg-slate-800'
                              }`}
                            />
                            <div
                              className={`text-[10px] font-semibold truncate ${
                                done
                                  ? 'text-[#1E1E24] dark:text-white'
                                  : 'text-[#6E6A75] dark:text-slate-500'
                              }`}
                            >
                              {isAr ? s.ar : s.en}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Notes + Action Strip */}
                    <div className="pt-3 border-t border-[#DCD3DF]/60 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="text-[#6E6A75] dark:text-slate-400 flex items-center gap-2 min-w-0">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {isAr ? req.notesAr : req.notesEn}
                          {req.documentName ? ` · ${req.documentName}` : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {req.status !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(req.id)}
                            className="px-3 py-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 bg-[#FAF7FC] dark:bg-slate-800 hover:border-[#3B004E] text-[#3B004E] dark:text-purple-200 font-bold text-[11px] cursor-pointer transition-colors"
                          >
                            {isAr ? 'تحديث مرحلة المراجعة' : 'Advance Review Step'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setCertificateRecord(req)}
                          className="px-3 py-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isAr ? 'الإيصال والشهادة' : 'Receipt'}</span>
                        </button>
                        <a
                          href={`https://wa.me/967730005955?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#1AD062] hover:bg-[#16b755] text-white font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'متابعة واتساب' : 'WhatsApp'}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(req.id)}
                          aria-label={isAr ? 'حذف الطلب' : 'Delete request'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Official Receipt / Certificate Modal */}
      {certificateRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF]/70 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-[#38BDF8]" />
                <h3 className="text-sm font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'ملخص وإيصال طلب التوثيق' : 'Verification Request Receipt'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCertificateRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6E6A75] dark:text-slate-400">{isAr ? 'رقم المرجع' : 'Reference ID'}</span>
                <span className="font-mono font-bold text-[#1E1E24] dark:text-white">{certificateRecord.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6A75] dark:text-slate-400">{isAr ? 'معرف الحساب' : 'Account Handle'}</span>
                <span className="font-mono font-bold text-[#3B004E] dark:text-purple-300">{certificateRecord.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6A75] dark:text-slate-400">{isAr ? 'الاسم الرسمي' : 'Legal Name'}</span>
                <span className="font-bold text-[#1E1E24] dark:text-white">{certificateRecord.legalOrBrandName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6A75] dark:text-slate-400">{isAr ? 'الحالة' : 'Status'}</span>
                <span className={`font-black ${getStatusMeta(certificateRecord.status).textCls}`}>
                  {isAr ? getStatusMeta(certificateRecord.status).ar : getStatusMeta(certificateRecord.status).en}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#DCD3DF]/60 dark:border-slate-800">
                <span className="font-bold text-[#1E1E24] dark:text-white">{isAr ? 'رسوم الخدمة' : 'Service Fee'}</span>
                <span className="font-mono tabular-nums font-black text-base text-[#3B004E] dark:text-purple-200">
                  ${certificateRecord.priceUSD.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={certificateRecord.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#1E1E24] dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isAr ? 'فتح الحساب' : 'Open Profile'}</span>
              </a>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(certificateRecord)}
                className="px-4 py-2 rounded-xl bg-[#3B004E] hover:bg-[#4E115A] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تنزيل الإيصال' : 'Download Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
