import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStorage, ActiveTabType } from '../../context/StorageContext';
import { SmartphoneMockup } from './SmartphoneMockup';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Tag,
  ArrowUpRight,
  Copy,
  Check,
  PlusCircle,
  X,
  Maximize2,
  ExternalLink,
  Layers,
  Camera,
  Globe,
  BellRing,
  Award,
  Lock,
  Zap,
  Info,
  Radio,
  Sliders,
} from 'lucide-react';

export type MediaSlideType = 'promo' | 'video' | 'announcement' | 'logo' | 'gallery';

export interface CarouselSlide {
  id: string;
  type: MediaSlideType;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr: string;
  badgeEn: string;
  badgeColorClass: string;
  targetTab?: ActiveTabType;
  ctaTextAr?: string;
  ctaTextEn?: string;
  imageSrc?: string;
  videoSrc?: string;
  videoPoster?: string;
  couponCode?: string;
  announcementDate?: string;
  metricHighlight?: {
    labelAr: string;
    labelEn: string;
    value: string;
  };
  tagsAr?: string[];
  tagsEn?: string[];
  accentGradient: string;
}

export const HeroMediaSlider: React.FC = () => {
  const { lang, setActiveTab, showNotification } = useStorage();
  const isAr = lang === 'ar';

  // Rich set of promotional banners, featured app videos, and company announcements
  const initialSlides: CarouselSlide[] = useMemo(
    () => [
      {
        id: 'mockup-hero-showcase',
        type: 'promo',
        titleAr: 'روّج لأعمالك بثقة',
        titleEn: 'Promote Your Business With Confidence',
        subtitleAr: 'كل ما تحتاجه لإدارة أعمالك في مكان واحد.',
        subtitleEn: 'Everything you need to manage your business in one place.',
        badgeAr: 'مرحبًا بك في رواج',
        badgeEn: 'Welcome to Rawaj',
        badgeColorClass: 'bg-white/10 text-white/90 border-transparent',
        targetTab: 'services',
        ctaTextAr: 'استعراض خدمات رواج',
        ctaTextEn: 'Explore Services',
        accentGradient: 'from-[#35073E] via-[#4A0E55] to-[#2E0536]',
      },
      {
        id: 'promo-annual-sale',
        type: 'promo',
        titleAr: 'عرض حصري: وفر 20% على باقات التخزين السنوية الفائقة',
        titleEn: 'Exclusive Offer: Save 20% on Annual Cloud Storage Tiers',
        subtitleAr:
          'احصل على مساحات تخزين تبدأ من 200 GB وحتى 2 TB مع نسخ احتياطي فوري للواتساب والكاميرا وضمان استرجاع للأموال لمدة 14 يوماً.',
        subtitleEn:
          'Upgrade to premium annual storage tiers with automated WhatsApp E2EE backups, 4K camera sync, and a 14-day money-back guarantee.',
        badgeAr: 'عرض ترويجي محدود · خصم 20%',
        badgeEn: 'Limited Promo · 20% Off',
        badgeColorClass: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        couponCode: 'RAWAJ2026',
        targetTab: 'available-plans',
        ctaTextAr: 'ترقية الخطة والاستفادة من العرض',
        ctaTextEn: 'Claim 20% Discount',
        metricHighlight: {
          labelAr: 'توفير سنوي يصل إلى',
          labelEn: 'Annual Savings Up To',
          value: '$48 / سنة',
        },
        tagsAr: ['كود الخصم: RAWAJ2026', 'سداد محلي متاح', 'تفعيل فوري'],
        tagsEn: ['Coupon: RAWAJ2026', 'Local Gateways', 'Instant Activation'],
        accentGradient: 'from-amber-500/20 via-purple-900/30 to-purple-950/40',
      },
      {
        id: 'video-security-walkthrough',
        type: 'video',
        titleAr: 'فيديو المنصة: كيف يحمي رواج كلاود بياناتك بتقنية Zero-Knowledge؟',
        titleEn: 'Featured App Video: Inside Client-Side Zero-Knowledge Encryption',
        subtitleAr:
          'شاهد عرضاً مرئياً توضيحياً مدته 60 ثانية يشرح خطوة بخطوة كيف يتم تشفير ملفاتك ومجلداتك على جهازك قبل رفعها للسحابة.',
        subtitleEn:
          'Watch a 60-second interactive visual walkthrough of client-side encryption and how private keys never leave your device.',
        badgeAr: 'فيديو تعريفي تفاعلي · 4K UHD',
        badgeEn: 'Interactive Video Demo · 4K',
        badgeColorClass: 'bg-rose-500/25 text-rose-300 border-rose-400/40',
        videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        videoPoster: '/assets/aistudio/Screenshot__________________4e014340.jpg',
        targetTab: 'vault',
        ctaTextAr: 'استكشاف الخزنة فائقة التشفير',
        ctaTextEn: 'Explore Encrypted Vault',
        metricHighlight: {
          labelAr: 'مدة العرض المرئي',
          labelEn: 'Video Duration',
          value: '01:15 دقيقة',
        },
        tagsAr: ['دقة فائقة 4K', 'مشغل تفاعلي', 'تحكم بالصوت'],
        tagsEn: ['4K Ultra HD', 'Interactive Player', 'Audio Controls'],
        accentGradient: 'from-rose-500/20 via-purple-900/30 to-slate-950/40',
      },
      {
        id: 'announcement-whatsapp-vault',
        type: 'announcement',
        titleAr: 'إعلان رسمي: إطلاق النسخ الاحتياطي التلقائي للواتساب والرسائل E2EE',
        titleEn: 'Official Announcement: Automated WhatsApp E2EE Backup Released',
        subtitleAr:
          'يسر إدارة رواج كلاود الإعلان عن إتاحة ميزة المزامنة السحابية المؤتمتة لمحادثات الواتساب مع تشفير محلي تام لحماية خصوصيتك العائلية والمهنية.',
        subtitleEn:
          'Rawaj Cloud announces the rollout of automated cloud synchronization for WhatsApp chats with client-side Zero-Knowledge encryption.',
        badgeAr: 'بيان وتحديث رسمي · إصدار 2026',
        badgeEn: 'Official Release · Update 2026',
        badgeColorClass: 'bg-emerald-500/25 text-[#1AD062] border-emerald-400/40',
        announcementDate: isAr ? '10 نوفمبر 2026' : 'Nov 10, 2026',
        targetTab: 'messages',
        ctaTextAr: 'تفعيل نسخ الواتساب الآن',
        ctaTextEn: 'Enable WhatsApp Sync',
        metricHighlight: {
          labelAr: 'مستوى الأمان',
          labelEn: 'Security Standard',
          value: 'Argon2id + AES-256',
        },
        tagsAr: ['حماية مشفرة 100%', 'بدون معرفة الخادم', 'تزامن ذكي'],
        tagsEn: ['100% Encrypted', 'Zero-Knowledge', 'Smart Sync'],
        accentGradient: 'from-emerald-500/20 via-purple-900/30 to-purple-950/40',
      },
      {
        id: 'brand-official-sovereign',
        type: 'logo',
        titleAr: 'رواج كلاود | هويتك السحابية السيادية المعتمدة بأعلى معايير الأمان',
        titleEn: 'Rawaj Cloud | Verified Sovereign Enterprise Cloud Storage',
        subtitleAr:
          'شعار وهوية موثوقة لحفظ المستندات الحساسة، إدارة الاشتراكات، والربط البرمجي S3 API مع جاهزية تشغيلية بنسبة 99.98% SLA.',
        subtitleEn:
          'Verified national cloud infrastructure delivering high availability, S3 API compatibility, and zero egress fees.',
        badgeAr: 'هوية موثقة · معايير ISO / SLA',
        badgeEn: 'Verified Identity · ISO / SLA',
        badgeColorClass: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40',
        imageSrc: '/assets/aistudio/_________________20261107_140807______425b22ac.png',
        targetTab: 'files',
        ctaTextAr: 'تصفح ملفاتك ومجلداتك',
        ctaTextEn: 'Open Files Explorer',
        metricHighlight: {
          labelAr: 'نسبة الجاهزية التشغيلية',
          labelEn: 'System Reliability',
          value: '99.98% SLA',
        },
        tagsAr: ['علامة موثقة 100%', 'تشفير قبل الرفع', 'دعم فني 24/7'],
        tagsEn: ['100% Verified', 'Pre-upload Encryption', '24/7 Support'],
        accentGradient: 'from-cyan-500/20 via-purple-900/30 to-purple-950/40',
      },
      {
        id: 'promo-hostinger-ai-bundles',
        type: 'promo',
        titleAr: 'إعلان الشراكة: حجز دومينات هوستينجر واشتراكات منصات الذكاء الاصطناعي',
        titleEn: 'Partner Promo: Hostinger Official Domains & AI Platform Subscriptions',
        subtitleAr:
          'احجز دومين موقعك الرسمي (.com, .ye, .ai) مع استضافة فائقة السرعة وشهادة SSL، وفعّل اشتراكات ChatGPT Plus و Midjourney بدفع محلي ميسر.',
        subtitleEn:
          'Register official top-level domains via Hostinger partner and activate official AI subscriptions with seamless local payments.',
        badgeAr: 'خدمات سحابية · هوستينجر & AI',
        badgeEn: 'Cloud Services · Hostinger & AI',
        badgeColorClass: 'bg-indigo-500/25 text-indigo-300 border-indigo-400/40',
        targetTab: 'services',
        ctaTextAr: 'استعراض كتالوج الخدمات الرقمية',
        ctaTextEn: 'Explore Services Catalog',
        metricHighlight: {
          labelAr: 'الدومينات المتاحة',
          labelEn: 'Available Domains',
          value: '.com · .ye · .ai',
        },
        tagsAr: ['شريك معتمد', 'تفعيل فوري', 'بوابات دفع محلية'],
        tagsEn: ['Official Partner', 'Instant Setup', 'Local Payments'],
        accentGradient: 'from-indigo-500/20 via-purple-900/30 to-purple-950/40',
      },
      {
        id: 'gallery-smart-camera-sync',
        type: 'gallery',
        titleAr: 'معرض الوسائط الذكي: نسخ صور وفيديوهات 4K بجودتها الأصلية الكاملة',
        titleEn: 'Smart Media Gallery: Lossless 4K Photo & Video Cloud Backup',
        subtitleAr:
          'احتفظ بذكرياتك المصورة والملفات المرئية دون أي ضغط أو تقليل للألوان، مع تنظيم تلقائي بالخط الزمني والألبومات المشفرة.',
        subtitleEn:
          'Lossless high-resolution camera roll sync supporting RAW and HEIC formats, categorized by intelligent chronological albums.',
        badgeAr: 'معرض صور وفيديوهات 4K',
        badgeEn: '4K Ultra-HD Media Sync',
        badgeColorClass: 'bg-teal-500/25 text-teal-300 border-teal-400/40',
        imageSrc: '/assets/aistudio/Screenshot__________________4e014340.jpg',
        targetTab: 'media',
        ctaTextAr: 'الانتقال إلى معرض الوسائط',
        ctaTextEn: 'Open Media Backup',
        metricHighlight: {
          labelAr: 'جودة الحفظ',
          labelEn: 'Image Quality',
          value: '100% Original',
        },
        tagsAr: ['دعم RAW & HEIC', 'ألبومات ذكية', 'مزامنة بالخلفية'],
        tagsEn: ['RAW & HEIC Support', 'Smart Albums', 'Background Sync'],
        accentGradient: 'from-teal-500/20 via-purple-900/30 to-purple-950/40',
      },
    ],
    [isAr]
  );

  const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides);
  const [activeFilter, setActiveFilter] = useState<'all' | MediaSlideType>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoFullscreenModalOpen, setIsVideoFullscreenModalOpen] = useState(false);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Slide duration in milliseconds
  const SLIDE_DURATION_MS = 6000;
  const TICK_INTERVAL_MS = 50;

  // Filtered slides based on user category tab
  const filteredSlides = useMemo(() => {
    if (activeFilter === 'all') return slides;
    return slides.filter(slide => slide.type === activeFilter);
  }, [slides, activeFilter]);

  // Keep index in safe range when filter changes
  useEffect(() => {
    if (currentIndex >= filteredSlides.length) {
      setCurrentIndex(0);
      setProgressPercent(0);
    }
  }, [filteredSlides.length, currentIndex]);

  const activeSlide = filteredSlides[currentIndex] || filteredSlides[0] || slides[0];

  // Navigation handlers
  const goToNextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % filteredSlides.length);
    setProgressPercent(0);
    // Pause video if moving away
    if (videoElementRef.current && isVideoPlaying) {
      videoElementRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, [filteredSlides.length, isVideoPlaying]);

  const goToPrevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + filteredSlides.length) % filteredSlides.length);
    setProgressPercent(0);
    // Pause video if moving away
    if (videoElementRef.current && isVideoPlaying) {
      videoElementRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, [filteredSlides.length, isVideoPlaying]);

  // High-Precision Auto-Play Timer with Continuous Progress Indicator
  useEffect(() => {
    // If auto-play is off, user is hovering/interacting, or video is actively playing: pause timer
    if (!isAutoPlayEnabled || isUserInteracting || isVideoPlaying || filteredSlides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setProgressPercent(prev => {
        const next = prev + (TICK_INTERVAL_MS / SLIDE_DURATION_MS) * 100;
        if (next >= 100) {
          goToNextSlide();
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isAutoPlayEnabled, isUserInteracting, isVideoPlaying, filteredSlides.length, goToNextSlide]);

  // Touch and Pointer Drag Gestures Handling (Smooth Swipe)
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useRefState(0);
  const isDragging = useRef(false);

  function useRefState<T>(initialValue: T): [T, (val: T) => void, React.MutableRefObject<T>] {
    const [state, setState] = useState<T>(initialValue);
    const ref = useRef<T>(initialValue);
    const setBoth = (val: T) => {
      ref.current = val;
      setState(val);
    };
    return [state, setBoth, ref];
  }

  const handlePointerDown = (clientX: number, clientY: number) => {
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    isDragging.current = true;
    setIsUserInteracting(true);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || dragStartX.current === null || dragStartY.current === null) return;
    const diffX = clientX - dragStartX.current;
    const diffY = clientY - dragStartY.current;

    // If vertical scroll is dominant, don't drag carousel
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 20) {
      isDragging.current = false;
      setDragOffset(0);
      return;
    }

    // Apply damped resistance to visual drag
    const damping = 0.55;
    setDragOffset(diffX * damping);
  };

  const handlePointerUp = () => {
    if (!isDragging.current || dragStartX.current === null) {
      isDragging.current = false;
      setIsUserInteracting(false);
      setDragOffset(0);
      return;
    }

    const threshold = 45; // pixels to trigger slide change
    const offset = dragOffset;

    if (Math.abs(offset) > threshold) {
      if (offset < 0) {
        // Dragged left
        if (isAr) goToPrevSlide();
        else goToNextSlide();
      } else {
        // Dragged right
        if (isAr) goToNextSlide();
        else goToPrevSlide();
      }
    }

    dragStartX.current = null;
    dragStartY.current = null;
    isDragging.current = false;
    setDragOffset(0);
    setIsUserInteracting(false);
  };

  // Keyboard navigation listener (ArrowLeft / ArrowRight)
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isAr) goToPrevSlide();
      else goToNextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isAr) goToNextSlide();
      else goToPrevSlide();
    } else if (e.key === ' ') {
      e.preventDefault();
      setIsAutoPlayEnabled(prev => !prev);
    }
  };

  // Video Playback Controls
  const toggleVideoPlayback = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoElementRef.current) {
      if (isVideoPlaying) {
        videoElementRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoElementRef.current.play().catch(err => {
          console.log('Video play interrupted', err);
        });
        setIsVideoPlaying(true);
      }
    }
  };

  const toggleVideoAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoElementRef.current) {
      const nextMuted = !isVideoMuted;
      videoElementRef.current.muted = nextMuted;
      setIsVideoMuted(nextMuted);
    }
  };

  // Copy coupon handler
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    showNotification(
      `تم نسخ كود الخصم "${code}" إلى الحافظة بنجاح`,
      `Coupon code "${code}" copied to clipboard`,
      'success'
    );
    setTimeout(() => setCopiedCoupon(false), 2200);
  };

  // Dynamic filter tab definitions
  const filterTabs: { id: 'all' | MediaSlideType; labelAr: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Sliders },
    { id: 'promo', labelAr: 'عروض ترويجية', labelEn: 'Promos', icon: Tag },
    { id: 'video', labelAr: 'فيديوهات التطبيق', labelEn: 'Videos', icon: Video },
    { id: 'announcement', labelAr: 'إعلانات الشركة', labelEn: 'Announcements', icon: BellRing },
    { id: 'logo', labelAr: 'شعارات الهوية', labelEn: 'Branding', icon: ShieldCheck },
    { id: 'gallery', labelAr: 'معرض الوسائط', labelEn: 'Gallery', icon: Camera },
  ];

  // Publish New Slide Form State
  const [newSlideType, setNewSlideType] = useState<MediaSlideType>('promo');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSubtitleAr, setNewSubtitleAr] = useState('');
  const [newSubtitleEn, setNewSubtitleEn] = useState('');
  const [newBadgeAr, setNewBadgeAr] = useState('');
  const [newBadgeEn, setNewBadgeEn] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newTargetTab, setNewTargetTab] = useState<ActiveTabType>('available-plans');

  const handlePublishCustomSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAr.trim()) {
      showNotification('يرجى إدخال عنوان الإعلان أو الشريحة', 'Please provide a title', 'warning');
      return;
    }

    const newSlide: CarouselSlide = {
      id: `custom-${Date.now()}`,
      type: newSlideType,
      titleAr: newTitleAr.trim(),
      titleEn: newTitleEn.trim() || newTitleAr.trim(),
      subtitleAr:
        newSubtitleAr.trim() || 'إعلان ترويجي نشط عبر منصة رواج كلاود',
      subtitleEn:
        newSubtitleEn.trim() || 'Active promotional announcement on Rawaj Cloud',
      badgeAr:
        newBadgeAr.trim() ||
        (newSlideType === 'promo'
          ? 'عرض ترويجي خاص'
          : newSlideType === 'video'
          ? 'فيديو مميز'
          : newSlideType === 'announcement'
          ? 'إعلان رسمي'
          : 'شعار وهوية'),
      badgeEn:
        newBadgeEn.trim() ||
        (newSlideType === 'promo' ? 'Special Promo' : 'Featured Announcement'),
      badgeColorClass:
        newSlideType === 'promo'
          ? 'bg-amber-400/25 text-amber-300 border-amber-400/40'
          : newSlideType === 'video'
          ? 'bg-rose-500/25 text-rose-300 border-rose-400/40'
          : newSlideType === 'announcement'
          ? 'bg-emerald-500/25 text-[#1AD062] border-emerald-400/40'
          : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40',
      imageSrc:
        newSlideType !== 'video'
          ? newMediaUrl.trim() || '/assets/aistudio/_________________20261107_140807______425b22ac.png'
          : undefined,
      videoSrc:
        newSlideType === 'video'
          ? newMediaUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          : undefined,
      couponCode: newCouponCode.trim() || undefined,
      targetTab: newTargetTab,
      ctaTextAr: isAr ? 'عرض التفاصيل' : 'View Details',
      ctaTextEn: 'View Details',
      tagsAr: ['إعلان مخصص', 'نشط الآن'],
      tagsEn: ['Custom Slide', 'Active Now'],
      accentGradient: 'from-purple-500/20 via-purple-900/30 to-purple-950/40',
    };

    setSlides(prev => [newSlide, ...prev]);
    setCurrentIndex(0);
    setProgressPercent(0);
    setIsPublishModalOpen(false);

    // Reset fields
    setNewTitleAr('');
    setNewTitleEn('');
    setNewSubtitleAr('');
    setNewSubtitleEn('');
    setNewBadgeAr('');
    setNewBadgeEn('');
    setNewMediaUrl('');
    setNewCouponCode('');

    showNotification(
      'تم نشر الشريحة بنجاح في السلايدر الرئيسي',
      'Slide successfully published to the carousel',
      'success'
    );
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsUserInteracting(true)}
      onMouseLeave={() => setIsUserInteracting(false)}
      onTouchStart={e => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={e => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handlePointerUp}
      onMouseDown={e => handlePointerDown(e.clientX, e.clientY)}
      onMouseMove={e => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerUp}
      role="region"
      aria-roledescription="carousel"
      aria-label={isAr ? 'سلايدر إعلانات وفيديوهات وعروض رواج كلاود' : 'Rawaj Cloud Carousel'}
      className="relative rounded-3xl bg-gradient-to-br from-white/12 via-white/8 to-white/5 dark:from-slate-900/80 dark:via-purple-950/40 dark:to-slate-950/90 backdrop-blur-xl border border-white/20 dark:border-white/15 p-4 sm:p-6 shadow-2xl overflow-hidden select-none transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-[#1AD062]/40"
    >
      {/* Background Ambient Glow matching current slide type */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${activeSlide.accentGradient} pointer-events-none transition-all duration-700 opacity-90`}
      />

      {/* Decorative Light Flares */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#1AD062]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#A38540]/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* ======================================================== */}
      {/* TOP BAR: CATEGORY FILTER TABS + PUBLISH + SLIDE CONTROLS */}
      {/* ======================================================== */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-white/15">
        
        {/* Category Pills Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full scrollbar-none">
          {filterTabs.map(tab => {
            const isActive = activeFilter === tab.id;
            const Icon = tab.icon;
            const count = tab.id === 'all' ? slides.length : slides.filter(s => s.type === tab.id).length;
            if (tab.id !== 'all' && count === 0) return null;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id);
                  setCurrentIndex(0);
                  setProgressPercent(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                  isActive
                    ? 'bg-white text-[#4E115A] dark:text-purple-950 shadow-md scale-102 font-black'
                    : 'bg-white/10 text-white/80 hover:text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-[#4E115A]/15 text-[#4E115A]' : 'bg-black/20 text-white/90'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Publish Modal + Auto-Play + Prev/Next Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Publish New Announcement / Video / Banner Button */}
          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1AD062] hover:bg-[#17b856] text-white text-xs font-bold transition-all shadow-md hover:scale-102 active:scale-95 cursor-pointer"
            title={isAr ? 'نشر إعلان، فيديو أو شعار جديد في السلايدر' : 'Publish new banner, video, or announcement'}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'نشر إعلان / فيديو' : 'Publish Banner'}</span>
          </button>

          {/* Auto-Play Toggle (Pause/Play) */}
          <button
            type="button"
            onClick={() => setIsAutoPlayEnabled(prev => !prev)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer shadow-2xs"
            title={
              isAutoPlayEnabled
                ? (isAr ? 'إيقاف التمرير التلقائي مؤقتاً' : 'Pause Auto-Play')
                : (isAr ? 'تشغيل التمرير التلقائي' : 'Resume Auto-Play')
            }
          >
            {isAutoPlayEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Nav Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrevSlide}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white border border-white/15 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title={isAr ? 'الشريحة السابقة' : 'Previous Slide'}
            >
              {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={goToNextSlide}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white border border-white/15 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title={isAr ? 'الشريحة التالية' : 'Next Slide'}
            >
              {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* ACTIVE SLIDE VIEWPORT WITH RESPONSIVE TOUCH TRANSFORM     */}
      {/* ======================================================== */}
      <div
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging.current ? 'none' : 'transform 250ms ease-out',
        }}
        className="relative z-10 flex flex-col justify-between min-h-[175px] sm:min-h-[195px] transition-opacity duration-300"
      >
        
        {/* Slide Header: Badges + Coupon / Announcement Date */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Category Tag */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${activeSlide.badgeColorClass}`}
            >
              {activeSlide.type === 'promo' && <Tag className="w-3.5 h-3.5" />}
              {activeSlide.type === 'video' && <Video className="w-3.5 h-3.5" />}
              {activeSlide.type === 'announcement' && <BellRing className="w-3.5 h-3.5 animate-bounce" />}
              {activeSlide.type === 'logo' && <ShieldCheck className="w-3.5 h-3.5" />}
              {activeSlide.type === 'gallery' && <Camera className="w-3.5 h-3.5" />}
              <span>{isAr ? activeSlide.badgeAr : activeSlide.badgeEn}</span>
            </span>

            {/* Discount Coupon Chip (if promo) */}
            {activeSlide.couponCode && (
              <button
                type="button"
                onClick={() => handleCopyCoupon(activeSlide.couponCode!)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-mono font-bold transition-all cursor-pointer border border-white/30 shadow-xs"
                title={isAr ? 'انقر لنسخ كود الخصم' : 'Click to copy coupon code'}
              >
                <span>{activeSlide.couponCode}</span>
                {copiedCoupon ? <Check className="w-3.5 h-3.5 text-[#1AD062]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Announcement Date (if announcement) */}
            {activeSlide.announcementDate && (
              <span className="text-[11px] font-mono text-white/80 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/10">
                {activeSlide.announcementDate}
              </span>
            )}
          </div>

          {/* Slide Numeric Pagination Index Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-white/90 bg-black/25 px-2.5 py-1 rounded-full border border-white/15">
            <span>{currentIndex + 1}</span>
            <span className="opacity-50">/</span>
            <span>{filteredSlides.length}</span>
          </div>

        </div>

        {/* Main Content Body: Dedicated Mockup Hero Slide OR Dynamic Media Scaling Container */}
        {activeSlide.id === 'mockup-hero-showcase' ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-3 px-2 sm:px-6">
            {/* Smartphone Mockup on Left */}
            <div className="order-2 sm:order-1 shrink-0 flex justify-center">
              <SmartphoneMockup />
            </div>

            {/* Typography on Right */}
            <div className="order-1 sm:order-2 flex-1 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left space-y-3">
              <span className="text-xs sm:text-sm text-white/85 font-medium block">
                {isAr ? 'مرحبًا بك في رواج' : 'Welcome to Rawaj'}
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
                <span className="text-[#F5BA13]">{isAr ? 'روّج لأعمالك' : 'Promote Your Business'}</span>{' '}
                <span className="text-white">{isAr ? 'بثقة' : 'With Confidence'}</span>
              </h1>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-lg font-normal">
                {isAr
                  ? 'كل ما تحتاجه لإدارة أعمالك في مكان واحد.'
                  : 'Everything you need to manage your business in one place.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5 justify-center sm:justify-start rtl:sm:justify-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#4E115A] hover:bg-[#F5EFF7] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  <span>{isAr ? 'استعراض خدمات رواج' : 'Explore Services'}</span>
                  <ArrowUpRight className="w-4 h-4 rtl:rotate-270" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
                >
                  <span>{isAr ? 'ملفاتي السحابية' : 'Cloud Drive'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center">
            
            {/* Main Info Column */}
            <div
              className={`${
                activeSlide.imageSrc || activeSlide.videoSrc ? 'md:col-span-8' : 'md:col-span-12'
              } space-y-2`}
            >
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                {isAr ? activeSlide.titleAr : activeSlide.titleEn}
              </h2>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl">
                {isAr ? activeSlide.subtitleAr : activeSlide.subtitleEn}
              </p>

              {/* Dynamic Metric & Tags Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activeSlide.metricHighlight && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/15 border border-white/25 text-white text-[11px] font-bold">
                    <span className="opacity-80">
                      {isAr ? activeSlide.metricHighlight.labelAr : activeSlide.metricHighlight.labelEn}:
                    </span>
                    <span className="font-mono text-[#1AD062] font-black">
                      {activeSlide.metricHighlight.value}
                    </span>
                  </div>
                )}

                {(isAr ? activeSlide.tagsAr : activeSlide.tagsEn)?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-white/10 text-white/90 border border-white/15"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Responsive Media Scaling Column (Video Player / Brand Logo / Photo Gallery) */}
            {(activeSlide.imageSrc || activeSlide.videoSrc) && (
              <div className="md:col-span-4 flex items-center justify-center">
                
                {/* 1. BRAND LOGO SCALING */}
                {activeSlide.type === 'logo' && activeSlide.imageSrc && (
                  <div className="relative group/logo w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-3 shadow-2xl border-2 border-white/40 flex items-center justify-center transition-transform hover:scale-105">
                    <img
                      src={activeSlide.imageSrc}
                      alt={activeSlide.titleEn}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#1AD062] text-white flex items-center justify-center shadow-lg border border-white">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* 2. RESPONSIVE PHOTO GALLERY SCALING */}
                {(activeSlide.type === 'gallery' || activeSlide.type === 'promo') && activeSlide.imageSrc && (
                  <div className="relative w-full max-w-[240px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/30 shadow-2xl group/img">
                    <img
                      src={activeSlide.imageSrc}
                      alt={activeSlide.titleEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5">
                      <span className="text-[10px] text-white font-mono font-bold flex items-center gap-1">
                        <Camera className="w-3 h-3 text-[#1AD062]" />
                        <span>{isAr ? 'دقة 4K فائقة' : '4K Ultra-HD'}</span>
                      </span>
                      <span className="text-[10px] text-white/80 font-mono">RAW / HEIC</span>
                    </div>
                  </div>
                )}

                {/* 3. FEATURED APP VIDEO PLAYER WITH RESPONSIVE SCALING & CONTROLS */}
                {activeSlide.type === 'video' && activeSlide.videoSrc && (
                  <div className="relative w-full max-w-[260px] aspect-video rounded-2xl overflow-hidden bg-black/80 border border-white/30 shadow-2xl group/vid">
                    <video
                      ref={videoElementRef}
                      src={activeSlide.videoSrc}
                      poster={activeSlide.videoPoster}
                      muted={isVideoMuted}
                      playsInline
                      loop
                      className="w-full h-full object-cover opacity-90 transition-opacity group-hover/vid:opacity-100"
                    />

                    {/* Video Playback & Sound Overlay Controls */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={toggleVideoPlayback}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#4E115A] flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                        title={isVideoPlaying ? (isAr ? 'إيقاف الفيديو' : 'Pause Video') : (isAr ? 'تشغيل الفيديو' : 'Play Video')}
                      >
                        {isVideoPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current rtl:rotate-180 ml-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={toggleVideoAudio}
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer border border-white/20"
                        title={isVideoMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
                      >
                        {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsVideoFullscreenModalOpen(true);
                        }}
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer border border-white/20"
                        title={isAr ? 'مشاهدة في مسرح الشاشة الكاملة' : 'Expand Video Theater'}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Video Status Badge */}
                    <div className="absolute bottom-1.5 rtl:right-2 ltr:left-2 flex items-center gap-1.5 text-[9px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                      <span className={`w-1.5 h-1.5 rounded-full ${isVideoPlaying ? 'bg-[#1AD062] animate-ping' : 'bg-white/60'}`} />
                      <span>{isVideoPlaying ? (isAr ? 'جاري التشغيل' : 'Playing') : '01:15'}</span>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* Mockup Centered Navigation Controls: Circular Button <, 4 Dots, Circular Button > */}
        <div className="flex items-center justify-center gap-3 pt-4 select-none">
          {/* Circular Left Arrow Button */}
          <button
            type="button"
            onClick={goToPrevSlide}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-90 cursor-pointer shadow-sm border border-white/20"
            title={isAr ? 'السابق' : 'Previous'}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          {/* 4 Dots Pagination Indicator matching Screenshot */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map(dotIdx => {
              const isActive = (currentIndex % 4) === dotIdx;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(dotIdx);
                    setProgressPercent(0);
                  }}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-2.5 h-2.5 bg-white shadow-xs ring-2 ring-white/30'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Slide ${dotIdx + 1}`}
                />
              );
            })}
          </div>

          {/* Circular Right Arrow Button */}
          <button
            type="button"
            onClick={goToNextSlide}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center backdrop-blur-xs transition-all active:scale-90 cursor-pointer shadow-sm border border-white/20"
            title={isAr ? 'التالي' : 'Next'}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>

      {/* Full-Width Bottom Progress Countdown Bar */}
      {isAutoPlayEnabled && !isUserInteracting && !isVideoPlaying && filteredSlides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1AD062] via-amber-300 to-white transition-all duration-75 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* EXPANDED VIDEO THEATER MODAL                             */}
      {/* ======================================================== */}
      {isVideoFullscreenModalOpen && activeSlide.videoSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#4E115A] to-[#3a0c43] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-300" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? activeSlide.titleAr : activeSlide.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoFullscreenModalOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={activeSlide.videoSrc}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <p className="line-clamp-1">{isAr ? activeSlide.subtitleAr : activeSlide.subtitleEn}</p>
              {activeSlide.targetTab && (
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoFullscreenModalOpen(false);
                    setActiveTab(activeSlide.targetTab!);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#4E115A] text-white font-bold shrink-0 hover:bg-[#3d0d46]"
                >
                  {isAr ? activeSlide.ctaTextAr : activeSlide.ctaTextEn}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PUBLISH NEW BANNER / VIDEO / ANNOUNCEMENT MODAL          */}
      {/* ======================================================== */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#DCD3DF] dark:border-slate-800 flex flex-col overflow-hidden max-h-[92vh] text-[#1E1E24] dark:text-white animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#DCD3DF] dark:border-slate-800 bg-gradient-to-r from-[#4E115A] to-[#3a0c43] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-[#1AD062]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'نشر إعلان، فيديو أو بيان جديد في السلايدر' : 'Publish Banner, Video, or Announcement'}
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    {isAr ? 'إضافة محتوى ترويجي يظهر للمستخدمين بالسلايدر التفاعلي' : 'Add custom media slides to the home carousel'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublishCustomSlide} className="p-5 space-y-4 text-xs overflow-y-auto">
              
              {/* Type Selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  {isAr ? 'تصنيف المحتوى:' : 'Content Category:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'promo', labelAr: 'إعلان', labelEn: 'Promo', icon: Tag },
                    { id: 'video', labelAr: 'فيديو', labelEn: 'Video', icon: Video },
                    { id: 'announcement', labelAr: 'بيان رسمي', labelEn: 'News', icon: BellRing },
                    { id: 'logo', labelAr: 'شعار', labelEn: 'Logo', icon: ShieldCheck },
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewSlideType(t.id as MediaSlideType)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 font-bold transition-all cursor-pointer ${
                          newSlideType === t.id
                            ? 'bg-[#4E115A] text-white border-[#4E115A] shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{isAr ? t.labelAr : t.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {isAr ? 'عنوان الشريحة / الإعلان (بالعربية):' : 'Slide Title (Arabic):'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: عرض خاص لسعة 500 GB مع نسخ للواتساب' : 'e.g. 500GB Special Cloud Offer'}
                  value={newTitleAr}
                  onChange={e => setNewTitleAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {isAr ? 'الوصف والتفاصيل الترويجية:' : 'Description:'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isAr ? 'شرح المزايا أو تفاصيل الإعلان...' : 'Promotional text...'}
                  value={newSubtitleAr}
                  onChange={e => setNewSubtitleAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Media URL */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {newSlideType === 'video'
                    ? (isAr ? 'رابط الفيديو (MP4 / WebM):' : 'Video URL:')
                    : (isAr ? 'رابط الصورة أو الشعار:' : 'Image or Logo URL:')}
                </label>
                <input
                  type="text"
                  placeholder={
                    newSlideType === 'video'
                      ? 'https://example.com/video.mp4'
                      : '/assets/aistudio/... or https://...'
                  }
                  value={newMediaUrl}
                  onChange={e => setNewMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              {/* Promo Coupon Code if Promo */}
              {newSlideType === 'promo' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    {isAr ? 'كود الخصم الترويجي (اختياري):' : 'Promo Coupon Code (Optional):'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RAWAJ2026"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
              )}

              {/* Target Tab Action */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  {isAr ? 'الزر التفاعلي يوجه إلى:' : 'Interactive CTA Button Action:'}
                </label>
                <select
                  value={newTargetTab}
                  onChange={e => setNewTargetTab(e.target.value as ActiveTabType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="available-plans">{isAr ? 'الخطط والباقات المتاحة' : 'Available Plans'}</option>
                  <option value="subscriptions">{isAr ? 'اشتراكاتي وفواتيري' : 'My Subscriptions'}</option>
                  <option value="files">{isAr ? 'ملفاتي ومستنداتي' : 'My Files & Drive'}</option>
                  <option value="vault">{isAr ? 'الخزنة المشفرة Zero-Knowledge' : 'Zero-Knowledge Vault'}</option>
                  <option value="media">{isAr ? 'معرض الوسائط والكاميرا' : 'Media Backup'}</option>
                  <option value="messages">{isAr ? 'نسخ الواتساب والرسائل' : 'WhatsApp Messages'}</option>
                  <option value="services">{isAr ? 'الخدمات الرقمية وهوتينجر' : 'Digital Services'}</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4E115A] hover:bg-[#3d0d46] text-white font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'نشر في السلايدر الآن' : 'Publish to Carousel'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
