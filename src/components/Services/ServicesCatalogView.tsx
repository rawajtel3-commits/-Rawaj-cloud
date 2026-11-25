import React, { useState, useRef, useEffect } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Globe,
  Sparkles,
  Bot,
  Search,
  CheckCircle2,
  ShieldCheck,
  Server,
  Mail,
  ExternalLink,
  ArrowRight,
  Zap,
  CreditCard,
  MessageCircle,
  PhoneCall,
  Check,
  Flame,
  Clock,
  Layers,
  FileCheck,
  Cpu,
  BadgeCheck,
  HelpCircle,
  Plus,
  ChevronDown,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

interface DomainResult {
  tld: string;
  priceUSD: number;
  badge?: string;
  isPopular?: boolean;
  status: 'available' | 'taken';
  descriptionAr: string;
  descriptionEn: string;
}

interface AiToolItem {
  id: string;
  name: string;
  category: 'llm' | 'design' | 'coding' | 'search' | 'video';
  categoryAr: string;
  categoryEn: string;
  badgeAr: string;
  badgeEn: string;
  priceUSD: number;
  cycleAr: string;
  cycleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  featuresAr: string[];
  featuresEn: string[];
  isPopular?: boolean;
  iconBg: string;
  activationMethodAr: string;
  activationMethodEn: string;
}

export const ServicesCatalogView: React.FC = () => {
  const { lang, setActiveTab, showNotification } = useStorage();
  const isAr = lang === 'ar';

  // Category and Filter State
  const [activeCategory, setActiveCategory] = useState<'all' | 'domains' | 'ai' | 'hosting'>('all');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Domain Search and Extension Dropdown State
  const [domainSearchQuery, setDomainSearchQuery] = useState('');
  const [selectedTldExtension, setSelectedTldExtension] = useState<string>('all');
  const [tldDropdownOpen, setTldDropdownOpen] = useState(false);
  const [searchedDomain, setSearchedDomain] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // AI Category Dropdown Filter State
  const [aiSubCategoryFilter, setAiSubCategoryFilter] = useState<'all' | 'llm' | 'design' | 'coding' | 'search' | 'video'>('all');
  const [aiCategoryDropdownOpen, setAiCategoryDropdownOpen] = useState(false);

  // Sorting Dropdown State
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    title: string;
    type: 'domain' | 'ai' | 'hosting';
    priceUSD: number;
    details?: string;
  } | null>(null);

  const [customerEmail, setCustomerEmail] = useState('user@rawajye.com');
  const [customerPhone, setCustomerPhone] = useState('770000000');
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'kuraimi' | 'floosak' | 'jawali' | 'mada' | 'flex'>('kuraimi');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Refs for click-outside detection
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const tldDropdownRef = useRef<HTMLDivElement>(null);
  const aiCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }
      if (tldDropdownRef.current && !tldDropdownRef.current.contains(target)) {
        setTldDropdownOpen(false);
      }
      if (aiCategoryDropdownRef.current && !aiCategoryDropdownRef.current.contains(target)) {
        setAiCategoryDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category Definitions
  const categoriesList = [
    {
      id: 'all' as const,
      labelAr: 'جميع الخدمات الرقمية',
      labelEn: 'All Digital Services',
      icon: Layers,
      count: 19,
      descriptionAr: 'استعراض كافة الدومينات واشتراكات الذكاء الاصطناعي والاستضافة',
      descriptionEn: 'Browse all domains, AI apps subscriptions, and cloud hosting',
    },
    {
      id: 'domains' as const,
      labelAr: 'حجز دومينات هوستينجر (Hostinger)',
      labelEn: 'Hostinger Domains',
      icon: Globe,
      count: 8,
      badge: isAr ? 'معتمد' : 'Authorized',
      badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
      descriptionAr: 'حجز وشراء النطاقات العالمية والوطنية (.com, .ye, .ai) مع DNS مجاني',
      descriptionEn: 'Official domain registration with free WHOIS and SSL',
    },
    {
      id: 'ai' as const,
      labelAr: 'اشتراكات تطبيقات الذكاء الاصطناعي',
      labelEn: 'AI Tools Subscriptions',
      icon: Bot,
      count: 8,
      badge: isAr ? 'رسمي 100%' : '100% Official',
      badgeColor: 'bg-[#1AD062]/15 text-[#1AD062] border border-[#1AD062]/30',
      descriptionAr: 'تفعيل فوري لـ ChatGPT Plus, Claude Pro, Midjourney بطرق دفع محلية',
      descriptionEn: 'Instant activation for top AI platforms with local payment',
    },
    {
      id: 'hosting' as const,
      labelAr: 'الاستضافة السحابية والبريد المهني',
      labelEn: 'Cloud Hosting & Business Email',
      icon: Server,
      count: 3,
      badge: isAr ? 'سيرفرات فائقة' : 'High Speed',
      badgeColor: 'bg-purple-500/15 text-[#4E115A] dark:text-purple-300 border border-purple-500/30',
      descriptionAr: 'استضافة ووردبريس، بريد إلكتروني باسم شركتك، وسيرفرات VPS خاصة',
      descriptionEn: 'Business mailboxes, WordPress NVMe hosting, and dedicated VPS',
    },
  ];

  const currentCategoryObj = categoriesList.find(c => c.id === activeCategory) || categoriesList[0];

  // Common TLDs with Hostinger Partnership pricing
  const defaultTlds: DomainResult[] = [
    {
      tld: '.com',
      priceUSD: 9.99,
      badge: isAr ? 'الأكثر طلباً' : 'Most Popular',
      isPopular: true,
      status: 'available',
      descriptionAr: 'النطاق التجاري العالمي الأول للشركات والمواقع الإلكترونية',
      descriptionEn: 'The #1 global commercial domain for businesses and stores',
    },
    {
      tld: '.ye',
      priceUSD: 35.0,
      badge: isAr ? 'النطاق الوطني الرسمي' : 'Official National',
      status: 'available',
      descriptionAr: 'النطاق الوطني لليمن، يعزز الهوية المحلية والمصداقية القانونية',
      descriptionEn: 'Official Yemeni ccTLD, builds regional trust and presence',
    },
    {
      tld: '.ai',
      priceUSD: 69.0,
      badge: isAr ? 'شركات الذكاء الاصطناعي' : 'AI Industry Standard',
      isPopular: true,
      status: 'available',
      descriptionAr: 'النطاق الحصري المفضل لشركات وتطبيقات الذكاء الاصطناعي والتقنية',
      descriptionEn: 'The premium domain choice for AI startups and apps',
    },
    {
      tld: '.net',
      priceUSD: 11.99,
      status: 'available',
      descriptionAr: 'مثالي للشبكات السحابية، البوابات الرقمية، ومزودي الخدمات التقنية',
      descriptionEn: 'Ideal for cloud networks, digital portals, and tech services',
    },
    {
      tld: '.org',
      priceUSD: 12.49,
      status: 'available',
      descriptionAr: 'النطاق المعتمد للمنظمات، الجمعيات، والمبادرات غير الربحية',
      descriptionEn: 'Trusted domain for organizations and non-profits',
    },
    {
      tld: '.io',
      priceUSD: 39.0,
      badge: isAr ? 'الشركات الناشئة' : 'Tech Startups',
      status: 'available',
      descriptionAr: 'المفضل للمطورين، البرمجيات، ومنصات SaaS الناشئة',
      descriptionEn: 'Beloved by developers, SaaS platforms, and tech innovators',
    },
    {
      tld: '.tech',
      priceUSD: 4.99,
      badge: isAr ? 'عرض خاص' : 'Special Offer',
      status: 'available',
      descriptionAr: 'نطاق عصري للمشاريع التقنية والمبرمجين بسعر اقتصادي',
      descriptionEn: 'Modern tech domain for developers and tech projects',
    },
    {
      tld: '.store',
      priceUSD: 2.99,
      badge: isAr ? 'خصم 80%' : '80% Off',
      status: 'available',
      descriptionAr: 'نطاق مخصص للمتاجر الإلكترونية والتجارة الرقمية المباشرة',
      descriptionEn: 'Dedicated extension for e-commerce and retail brands',
    },
  ];

  // AI Tools Subscriptions Catalog
  const aiToolsCatalog: AiToolItem[] = [
    {
      id: 'chatgpt-plus',
      name: 'ChatGPT Plus (OpenAI)',
      category: 'llm',
      categoryAr: 'نماذج لغوية وتوليد ذكي',
      categoryEn: 'LLM & Conversational AI',
      badgeAr: 'الأكثر شهرة',
      badgeEn: 'Best Seller',
      priceUSD: 22.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'الوصول الكامل إلى نموذج GPT-4o الأحدث مع ميزة الصوت المتقدم ومحرر Canvas وتوليد DALL-E 3',
      descriptionEn: 'Full access to GPT-4o, Advanced Voice Mode, Canvas editor, and DALL-E 3 image generation',
      featuresAr: [
        'وصول فوري لنموذج GPT-4o ونموذج o1 الاستدلالي المتقدم',
        'ميزة Canvas الذكية لكتابة وتعديل الأكواد والنصوص باحترافية',
        'محرر الصور DALL-E 3 مع تحليل المستندات وجداول البيانات',
        'تفعيل رسمي مضمون 100% على إيميلك الشخصي',
      ],
      featuresEn: [
        'Access to GPT-4o and advanced o1 reasoning models',
        'Smart Canvas workspace for code and long-form writing',
        'DALL-E 3 image generator and data analysis tools',
        '100% official activation on your personal account',
      ],
      isPopular: true,
      iconBg: 'bg-emerald-600',
      activationMethodAr: 'تفعيل رسمي على إيميل العميل مباشرة',
      activationMethodEn: 'Official activation on customer email',
    },
    {
      id: 'claude-pro',
      name: 'Claude Pro (Anthropic)',
      category: 'coding',
      categoryAr: 'تحليل أكواد وكتابة فائقة الدقة',
      categoryEn: 'Reasoning & Coding Expert',
      badgeAr: 'المفضل للمطورين',
      badgeEn: 'Developer Choice',
      priceUSD: 22.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'نموذج Claude 3.5 Sonnet الخارق في كتابة وهندسة البرمجيات، النوافذ التفاعلية Artifacts والمشاريع',
      descriptionEn: 'Uncapped Claude 3.5 Sonnet with Artifacts workspace, Projects, and 5x higher usage limits',
      featuresAr: [
        'أعلى ذكاء واستدلال في البرمجة وتوليد واجهات React والأنظمة',
        'ميزة Artifacts لمعاينة التطبيقات والمخططات لحظياً',
        'مساحة Projects لتنظيم المستندات البرمجية ومشاريع الفرق',
        'حدود استخدام مضاعفة 5 مرات مقارنة بالخطة المجانية',
      ],
      featuresEn: [
        'Leading coding intelligence and software architecture',
        'Interactive Artifacts canvas for live app previews',
        'Projects workspace for codebase documentation',
        '5x higher message capacity during peak hours',
      ],
      isPopular: true,
      iconBg: 'bg-amber-600',
      activationMethodAr: 'تفعيل فوري على حسابك أو حساب جاهز',
      activationMethodEn: 'Instant activation on your personal account',
    },
    {
      id: 'midjourney-std',
      name: 'Midjourney v6.1 (Standard)',
      category: 'design',
      categoryAr: 'توليد الصور والفن الرقمي',
      categoryEn: 'Generative AI Art',
      badgeAr: 'جودة سنمائية',
      badgeEn: 'Cinematic Quality',
      priceUSD: 32.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'المعيار الذهبي عالمياً لتوليد الصور الفوتوغرافية، التصاميم المعمارية، وفن الهويات البصرية',
      descriptionEn: 'The global standard for hyper-realistic photos, architectural designs, and brand art',
      featuresAr: [
        '15 ساعة Fast GPU لتوليد فوري فائق السرعة شهرياً',
        'توليد غير محدود في وضع Relax Mode دون توقف',
        'دخول كامل لخادم Discord والموقع الإلكتروني الرسمي',
        'حقوق الاستخدام التجاري الكامل للأعمال المنتجة',
      ],
      featuresEn: [
        '15 hours Fast GPU time per month',
        'Unlimited Relax generations with zero throttling',
        'Full web interface and Discord bot access',
        'Commercial usage rights for all created assets',
      ],
      isPopular: true,
      iconBg: 'bg-indigo-600',
      activationMethodAr: 'حساب مخصص أو تفعيل على الديسكورد',
      activationMethodEn: 'Dedicated account or Discord subscription',
    },
    {
      id: 'perplexity-pro',
      name: 'Perplexity Pro',
      category: 'search',
      categoryAr: 'محرك بحث استقصائي وبحوث ذكية',
      categoryEn: 'AI Search & Research',
      badgeAr: 'أفضل محرك بحث',
      badgeEn: 'Smart Search',
      priceUSD: 20.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'محرك البحث الأذكى في العالم مع استشهادات دقيقة بمصادر الويب الحية وإمكانية تبديل النماذج',
      descriptionEn: 'Search the web with verifiable citations, file uploads, and model switcher (Claude, GPT, Sonar)',
      featuresAr: [
        'استعلامات بحث Pro غير محدودة يومياً',
        'إمكانية الاختيار بين نماذج Claude 3.5 و GPT-4o و Sonar',
        'رفع وتحليل ملفات PDF والبيانات مع استخراج التقارير',
        'رصيد API شهري مجاني مضمن مع الحساب',
      ],
      featuresEn: [
        'Unlimited Pro Search queries per day',
        'Toggle between Claude 3.5, GPT-4o, and Sonar models',
        'Document analysis for unlimited research files',
        '$5 monthly API credit included',
      ],
      iconBg: 'bg-cyan-700',
      activationMethodAr: 'تفعيل رسمي على بريد العميل',
      activationMethodEn: 'Official activation on user email',
    },
    {
      id: 'canva-pro',
      name: 'Canva Pro (Magic Studio)',
      category: 'design',
      categoryAr: 'التصميم الجرافيكي وصناعة المحتوى',
      categoryEn: 'Graphic Design & Magic Studio',
      badgeAr: 'شامل الأدوات',
      badgeEn: 'All-in-One Design',
      priceUSD: 13.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'أدوات التصميم المتكاملة مع حزمة Magic AI لإزالة الخلفيات، توليد الصور، والتحريك الآلي',
      descriptionEn: 'Full design suite with Magic Studio AI, background remover, and 100M+ premium assets',
      featuresAr: [
        'أكثر من 100 مليون صورة وفيديو وقالب مميز عالي الدقة',
        'أدوات Magic Expand و Magic Eraser لحذف العناصر بضغطة زر',
        'حفظ هوية العلامة التجارية والخطوط المخصصة بدون قيود',
        'تصدير بجودة فائقة مع خلفية شفافة و SVG',
      ],
      featuresEn: [
        '100M+ premium photos, videos, audio, and graphics',
        'Magic Eraser and one-click background remover',
        'Brand Kit setup with custom fonts and palettes',
        'High-res vector SVG and transparent PNG exports',
      ],
      iconBg: 'bg-gradient-to-r from-blue-500 to-purple-600',
      activationMethodAr: 'دعوة عضوية Pro رسمية لحسابك',
      activationMethodEn: 'Official Pro team invite to your email',
    },
    {
      id: 'gemini-advanced',
      name: 'Google Gemini Advanced',
      category: 'llm',
      categoryAr: 'ذكاء جوجل ونظام Workspaces',
      categoryEn: 'Google Deep Intelligence',
      badgeAr: '2M سياق',
      badgeEn: '2M Context Window',
      priceUSD: 20.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'النموذج الأكبر من جوجل مع نافذة سياق عملاقة تتسع لأكثر من 1,500 صفحة وتكامل مع Gmail و Drive',
      descriptionEn: 'Google flagship model with 2M token context window and integration with Docs, Gmail, and Drive',
      featuresAr: [
        'نافذة سياق ضخمة 2M Tokens لتحليل كتب ومجلدات كود كاملة',
        'تكامل كامل مع تطبيقات Google Docs, Gmail, Drive',
        'تخزين سحابي 2TB مجاني مع اشتراك Google One',
        'توليد صور متطور بمحرك Imagen 3',
      ],
      featuresEn: [
        'Massive 2M token window for analyzing whole books',
        'Deep integration with Docs, Drive, and Gmail',
        'Includes 2TB Google One cloud storage tier',
        'Advanced image generation powered by Imagen 3',
      ],
      iconBg: 'bg-blue-600',
      activationMethodAr: 'تفعيل على حساب Gmail الخاص بك',
      activationMethodEn: 'Direct Google account activation',
    },
    {
      id: 'cursor-copilot',
      name: 'Cursor Pro / GitHub Copilot',
      category: 'coding',
      categoryAr: 'البرمجة والأكواد البرمجية',
      categoryEn: 'Developer IDE AI',
      badgeAr: 'للمبرمجين',
      badgeEn: 'For Coders',
      priceUSD: 20.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'محرر الأكواد الأذكى في العالم لمطوري الويب والتطبيقات مع فهم شامل لكامل مجلدات المشروع',
      descriptionEn: 'AI-first code editor and assistant that understands your entire repository and dependencies',
      featuresAr: [
        'طلب أكواد وتعديل ملفات متعددة في وقت واحد Multi-file Edit',
        'شات ذكي مرتبط بكامل قاعدة الكود البرمجي @codebase',
        'توليد الفحوصات وإصلاح الأخطاء تلقائياً',
        'دعم لجميع لغات البرمجة وأطر العمل الحديثة',
      ],
      featuresEn: [
        'Multi-file edit and direct repository diff generation',
        '@codebase contextual indexing and chat',
        'Automated bug fixing and terminal command assistance',
        'Full support for TypeScript, Python, Go, and all stacks',
      ],
      iconBg: 'bg-slate-800',
      activationMethodAr: 'تفعيل رسمي على حساب GitHub أو Cursor',
      activationMethodEn: 'Official activation on GitHub or Cursor account',
    },
    {
      id: 'runway-gen3',
      name: 'Runway Gen-3 Alpha',
      category: 'video',
      categoryAr: 'توليد وإخراج الفيديو بالذكاء الاصطناعي',
      categoryEn: 'Generative AI Video',
      badgeAr: 'فيديو سينمائي',
      badgeEn: 'Cinematic Video',
      priceUSD: 15.0,
      cycleAr: 'شهرياً',
      cycleEn: 'per month',
      descriptionAr: 'الأداة الرائدة عالمياً لتحويل النصوص والصور إلى مقاطع فيديو فائقة الواقعية بجودة استوديوهات هوليوود',
      descriptionEn: 'Industry-leading text-to-video and image-to-video generation with cinematic motion controls',
      featuresAr: [
        'توليد فيديوهات 4K واقعية مع تحكم كامل بالكاميرا والحركة',
        'ميزة تحويل الصور إلى فيديو متناغم Image-to-Video',
        'أدوات Motion Brush لتحديد حركة عناصر محددة في المشهد',
        'حذف الخلفيات وتعديل الفيديو بالذكاء الاصطناعي',
      ],
      featuresEn: [
        'Realistic 4K video generation with camera controls',
        'Image-to-video animation and interpolation',
        'Motion Brush for targeted directional dynamics',
        'AI video inpainting and green screen replacement',
      ],
      iconBg: 'bg-fuchsia-700',
      activationMethodAr: 'حساب مخصص أو تفعيل على إيميلك',
      activationMethodEn: 'Official activation on your account',
    },
  ];

  // AI Subcategory list for dropdown filter
  const aiCategoriesList = [
    { id: 'all' as const, labelAr: 'جميع تطبيقات الذكاء الاصطناعي (8)', labelEn: 'All AI Applications (8)' },
    { id: 'llm' as const, labelAr: 'نماذج لغوية وتوليد ذكي (ChatGPT, Gemini)', labelEn: 'LLMs & Conversational AI' },
    { id: 'coding' as const, labelAr: 'البرمجة وهندسة الأكواد (Claude, Cursor)', labelEn: 'Coding & Development' },
    { id: 'design' as const, labelAr: 'التصميم وتوليد الصور (Midjourney, Canva)', labelEn: 'Design & Image Generation' },
    { id: 'search' as const, labelAr: 'البحث والاستقصاء الذكي (Perplexity)', labelEn: 'Smart Search & Research' },
    { id: 'video' as const, labelAr: 'توليد وإخراج الفيديو (Runway Gen-3)', labelEn: 'AI Video Generation' },
  ];

  // Filtered and Sorted Domains
  const filteredTlds = defaultTlds.filter(item => {
    if (selectedTldExtension === 'all') return true;
    return item.tld === selectedTldExtension;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceUSD - b.priceUSD;
    if (sortBy === 'price-desc') return b.priceUSD - a.priceUSD;
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

  // Filtered and Sorted AI Tools
  const filteredAiTools = aiToolsCatalog.filter(tool => {
    if (aiSubCategoryFilter === 'all') return true;
    return tool.category === aiSubCategoryFilter;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceUSD - b.priceUSD;
    if (sortBy === 'price-desc') return b.priceUSD - a.priceUSD;
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

  // Handle Domain Search
  const handleDomainSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainSearchQuery.trim()) return;

    setIsSearching(true);
    setSearchedDomain(domainSearchQuery.trim().toLowerCase().replace(/\s+/g, ''));

    setTimeout(() => {
      setIsSearching(false);
      showNotification(
        `تم فحص النطاق "${domainSearchQuery.trim()}" عبر شبكة هوستينجر العالمية`,
        `Checked domain "${domainSearchQuery.trim()}" across Hostinger registry`,
        'success'
      );
    }, 600);
  };

  const handleOpenOrderModal = (service: {
    title: string;
    type: 'domain' | 'ai' | 'hosting';
    priceUSD: number;
    details?: string;
  }) => {
    setSelectedService(service);
    setOrderModalOpen(true);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmittingOrder(true);
    setTimeout(() => {
      setIsSubmittingOrder(false);
      setOrderModalOpen(false);

      showNotification(
        `تم تسجيل طلبك بنجاح لخدمة "${selectedService.title}". سيتواصل معك فريق خدمة العملاء فوراً!`,
        `Order registered for "${selectedService.title}". Our team will contact you promptly!`,
        'success'
      );

      // Open WhatsApp direct conversation with pre-filled order text
      const orderMessage = isAr
        ? `مرحباً رواج كلاود، أود تأكيد طلبي لخدمة: *${selectedService.title}* بقيمة $${selectedService.priceUSD} USD. رقم الهاتف: ${customerPhone}. طريقة الدفع: ${selectedPaymentGateway}.`
        : `Hello Rawaj Cloud, I want to confirm my order for: *${selectedService.title}* ($${selectedService.priceUSD} USD). Phone: ${customerPhone}. Payment: ${selectedPaymentGateway}.`;
      
      const whatsappUrl = `https://wa.me/967730005955?text=${encodeURIComponent(orderMessage)}`;
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  const CurrentCategoryIcon = currentCategoryObj.icon;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950 overflow-y-auto">
      
      {/* Top Header Banner (Relative to prevent content being trapped or hidden beneath when scrolling) */}
      <div className="border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-4 sm:py-5 relative z-20 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shadow-md shadow-[#4E115A]/25 shrink-0">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'الخدمات الرقمية وحلول السحابة' : 'Digital Services & Cloud Store'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1AD062]/15 text-[#1AD062] border border-[#1AD062]/30 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {isAr ? 'موزع معتمد وشريك' : 'Authorized Reseller'}
                </span>
              </div>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {isAr
                  ? 'حجز دومينات Hostinger الرسمية وتفعيل اشتراكات منصات وتطبيقات الذكاء الاصطناعي بدفع محلي'
                  : 'Hostinger domain registration and official AI subscriptions activation with local payment'}
              </p>
            </div>
          </div>

          {/* Contact Direct Triggers */}
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/967730005955"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1AD062] hover:bg-[#16b755] text-white text-xs font-bold shadow-md transition-all transform active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isAr ? 'واتساب خدمة العملاء' : 'WhatsApp'}</span>
            </a>
            <a
              href="tel:00967780080555"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#1E1E24] dark:text-white hover:bg-slate-50 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#A38540]" />
              <span className="font-mono text-[11px]">00967780080555</span>
            </a>
          </div>
        </div>

        {/* RESPONSIVE CATEGORY CONTROLS: Dropdown on Mobile/Tablet & Tabs on Desktop */}
        <div className="max-w-6xl mx-auto mt-4 pt-3 border-t border-[#DCD3DF]/60 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          {/* 1. Mobile & Tablet Interactive Dropdown Menu (القائمة المنسدلة للتصنيفات) */}
          <div className="relative w-full sm:max-w-xs md:hidden" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-800 border-2 border-[#4E115A] text-[#1E1E24] dark:text-white rounded-2xl text-xs font-bold shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CurrentCategoryIcon className="w-4 h-4 text-[#4E115A] dark:text-purple-300 shrink-0" />
                <span className="truncate">{isAr ? currentCategoryObj.labelAr : currentCategoryObj.labelEn}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 text-[10px] font-mono font-bold shrink-0">
                  {currentCategoryObj.count}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#4E115A] transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {categoryDropdownOpen && (
              <div className="absolute top-full mt-2 inset-x-0 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A75] dark:text-slate-400 px-3 py-1 font-mono">
                  {isAr ? 'اختر تصنيف الخدمات' : 'Select Service Category'}
                </div>
                <div className="space-y-1 mt-1">
                  {categoriesList.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left rtl:text-right font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#4E115A] text-white font-bold shadow-xs'
                            : 'hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CatIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#4E115A] dark:text-purple-300'}`} />
                          <div className="truncate">
                            <div className="leading-tight">{isAr ? cat.labelAr : cat.labelEn}</div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-[#6E6A75] dark:text-slate-400'}`}>
                              {isAr ? cat.descriptionAr : cat.descriptionEn}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 rtl:mr-2 ltr:ml-2">
                          {cat.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${isSelected ? 'bg-white/20 text-white' : cat.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                              {cat.badge}
                            </span>
                          )}
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                            {cat.count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Horizontal Category Tabs */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categoriesList.map((cat) => {
              const CatIcon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#4E115A] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-[#6E6A75] dark:text-slate-300 border border-[#DCD3DF] dark:border-slate-700 hover:text-[#1E1E24]'
                  }`}
                >
                  <CatIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#4E115A] dark:text-purple-300'}`} />
                  <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                  {cat.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-[#1AD062] text-white'}`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 2. Sorting & Filter Dropdown (قائمة منسدلة للترتيب والتصفية) */}
          <div className="relative self-end sm:self-auto shrink-0" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#1E1E24] dark:text-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#A38540]" />
              <span>
                {sortBy === 'popular'
                  ? (isAr ? 'الترتيب: الأكثر طلباً' : 'Sort: Most Popular')
                  : sortBy === 'price-asc'
                  ? (isAr ? 'الترتيب: السعر (الأقل أولاً)' : 'Sort: Price Low to High')
                  : (isAr ? 'الترتيب: السعر (الأعلى أولاً)' : 'Sort: Price High to Low')}
              </span>
              <ChevronDown className={`w-3 h-3 text-[#6E6A75] transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute top-full mt-2 rtl:left-0 ltr:right-0 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('popular');
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    sortBy === 'popular' ? 'bg-[#4E115A] text-white font-bold' : 'hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200'
                  }`}
                >
                  <span>{isAr ? 'الأكثر طلباً وشعبية' : 'Most Popular'}</span>
                  {sortBy === 'popular' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSortBy('price-asc');
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    sortBy === 'price-asc' ? 'bg-[#4E115A] text-white font-bold' : 'hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200'
                  }`}
                >
                  <span>{isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</span>
                  {sortBy === 'price-asc' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSortBy('price-desc');
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                    sortBy === 'price-desc' ? 'bg-[#4E115A] text-white font-bold' : 'hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200'
                  }`}
                >
                  <span>{isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</span>
                  {sortBy === 'price-desc' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 pb-28 space-y-8 sm:space-y-10">

        {/* SECTION 1: HOSTINGER DOMAIN REGISTRATION & CHECKER */}
        {(activeCategory === 'all' || activeCategory === 'domains') && (
          <div className="space-y-6">
            
            {/* Hostinger Hero Banner (overflow-hidden moved to inner background so dropdowns are never clipped) */}
            <div className="relative rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-gradient-to-br from-[#4E115A] via-[#3a0c43] to-[#25082b] text-white p-5 sm:p-7 shadow-xl">
              {/* Isolated background decorative elements */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-[#1AD062]/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/15 text-white backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{isAr ? 'شراكة هوستينجر المعتمدة' : 'Official Hostinger Partner'}</span>
                  </span>
                  <span className="text-xs text-white/80">
                    {isAr ? 'شراء وتجديد بالعملة المحلية' : 'Local currency renewal'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  {isAr
                    ? 'احجز اسم نطاقك (دومين) الآن بأفضل الأسعار وأعلى سرعة DNS'
                    : 'Register your custom domain with fast DNS & free privacy shield'}
                </h2>
                <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
                  {isAr
                    ? 'نوفر لك حجز وتفعيل كافة أنواع النطاقات العالمية والوطنية (.com, .ye, .ai, .net) عبر منصة هوستينجر Hostinger مع حماية الخصوصية WHOIS مجاناً، شهادة SSL مدى الحياة، ودون الحاجة لبطاقات بنكية دولية.'
                    : 'Instant registration for .com, .ye, .ai, .net with free WHOIS privacy, lifetime SSL, and full DNS management.'}
                </p>

                {/* Domain Search Box with Integrated TLD Dropdown */}
                <form onSubmit={handleDomainSearch} className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 relative z-30">
                  
                  {/* Search Input */}
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-5 h-5 text-white/70 absolute rtl:right-3.5 ltr:left-3.5" />
                    <input
                      type="text"
                      placeholder={isAr ? 'اكتب اسم مشروعك (مثال: rawaj, brand)...' : 'Type brand name (e.g. rawaj, store)...'}
                      value={domainSearchQuery}
                      onChange={(e) => setDomainSearchQuery(e.target.value)}
                      className="w-full rtl:pr-11 rtl:pl-3 ltr:pl-11 ltr:pr-3 py-2.5 bg-transparent text-sm text-white placeholder-white/60 focus:outline-none"
                    />
                  </div>

                  {/* 3. TLD Extension Selector Dropdown (قائمة منسدلة متجاوبة بالكامل لاختيار الامتداد) */}
                  <div className="relative shrink-0" ref={tldDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setTldDropdownOpen(!tldDropdownOpen)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-mono text-xs font-bold transition-all flex items-center justify-between sm:justify-center gap-2 cursor-pointer border border-white/25 active:scale-95"
                    >
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-300" />
                        <span>
                          {selectedTldExtension === 'all'
                            ? (isAr ? 'جميع الامتدادات' : 'All Extensions')
                            : selectedTldExtension}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${tldDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* TLD Dropdown Menu (Full width on mobile, w-64 on desktop, scrolls up to 8 items smoothly) */}
                    {tldDropdownOpen && (
                      <div className="absolute top-full mt-2 inset-x-0 sm:inset-x-auto sm:w-64 rtl:sm:left-0 ltr:sm:right-0 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto ring-1 ring-black/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A75] dark:text-slate-400 px-3 py-1 font-mono">
                          {isAr ? 'اختر امتداد الدومين' : 'Select TLD Extension'}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTldExtension('all');
                            setTldDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                            selectedTldExtension === 'all'
                              ? 'bg-[#4E115A] text-white font-bold'
                              : 'hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            <span>{isAr ? 'جميع الامتدادات (الكل)' : 'All Extensions (8)'}</span>
                          </div>
                          {selectedTldExtension === 'all' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-1.5" />

                        <div className="space-y-1">
                          {defaultTlds.map(tldItem => (
                            <button
                              key={tldItem.tld}
                              type="button"
                              onClick={() => {
                                setSelectedTldExtension(tldItem.tld);
                                setTldDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-medium cursor-pointer transition-colors ${
                                selectedTldExtension === tldItem.tld
                                  ? 'bg-[#4E115A] text-white font-bold'
                                  : 'hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{tldItem.tld}</span>
                                {tldItem.badge && (
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-sans font-bold ${
                                    selectedTldExtension === tldItem.tld
                                      ? 'bg-white/20 text-white'
                                      : 'bg-[#A38540]/15 text-[#A38540]'
                                  }`}>
                                    {tldItem.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-sans font-bold ${
                                  selectedTldExtension === tldItem.tld ? 'text-white' : 'text-[#1AD062]'
                                }`}>
                                  ${tldItem.priceUSD.toFixed(2)}
                                </span>
                                {selectedTldExtension === tldItem.tld && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Submit Button */}
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-[#4E115A] font-black text-xs hover:bg-[#F5EFF7] transition-all flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#4E115A] border-t-transparent rounded-full animate-spin" />
                        <span>{isAr ? 'جارِ الفحص...' : 'Checking...'}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-[#4E115A]" />
                        <span>{isAr ? 'فحص الدومين' : 'Check Domain'}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Search result preview */}
                {searchedDomain && (
                  <div className="mt-3 p-3 rounded-xl bg-[#1AD062]/20 border border-[#1AD062]/40 text-xs text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1AD062]" />
                      <span>
                        {isAr
                          ? `اسم النطاق "${searchedDomain}" متاح للاقتناء عبر الامتدادات الموضحة بالأسفل:`
                          : `Domain "${searchedDomain}" is available for registration below:`}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-300">
                      {isAr ? 'فحص لحظي ناجح' : 'Live Check OK'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hostinger Included Free Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1AD062]/15 text-[#1AD062] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? 'حماية WHOIS مجاناً' : 'Free WHOIS Privacy'}
                  </div>
                  <div className="text-[10px] text-[#6E6A75] dark:text-slate-400">
                    {isAr ? 'إخفاء بيانات المالك بالكامل' : 'Hide owner contact data'}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? 'نظام DNS فائق السرعة' : 'Ultra-Fast DNS'}
                  </div>
                  <div className="text-[10px] text-[#6E6A75] dark:text-slate-400">
                    {isAr ? 'استجابة سريعة حول العالم' : 'Global low-latency DNS'}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? 'شهادة SSL مدى الحياة' : 'Lifetime SSL'}
                  </div>
                  <div className="text-[10px] text-[#6E6A75] dark:text-slate-400">
                    {isAr ? 'تأمين الموقع والتشفير' : 'HTTPS secure encryption'}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/50 dark:bg-slate-900/50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? 'دفع محلي بالريال والدولار' : 'Local Payment'}
                  </div>
                  <div className="text-[10px] text-[#6E6A75] dark:text-slate-400">
                    {isAr ? 'الكريمي / فلوسك / جوالي' : 'Kuraimi / Floosak / Mada'}
                  </div>
                </div>
              </div>
            </div>

            {/* Domains Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTlds.map((domain) => {
                const domainLabel = searchedDomain ? `${searchedDomain}${domain.tld}` : `yourbrand${domain.tld}`;
                return (
                  <div
                    key={domain.tld}
                    className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                      domain.isPopular
                        ? 'border-[#4E115A] bg-white dark:bg-slate-900 shadow-md ring-1 ring-[#4E115A]/20'
                        : 'border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base font-black font-mono text-[#4E115A] dark:text-purple-300">
                          {domain.tld}
                        </span>
                        {domain.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A38540]/10 text-[#A38540] border border-[#A38540]/20">
                            {domain.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono font-bold text-[#1E1E24] dark:text-white truncate mb-2">
                        {domainLabel}
                      </div>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-black text-[#1E1E24] dark:text-white">
                          ${domain.priceUSD.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                          / {isAr ? 'سنة' : 'year'}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#6E6A75] dark:text-slate-400 leading-relaxed mb-4">
                        {isAr ? domain.descriptionAr : domain.descriptionEn}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenOrderModal({
                        title: `حجز دومين ${domain.tld} (${domainLabel})`,
                        type: 'domain',
                        priceUSD: domain.priceUSD,
                        details: `امتداد ${domain.tld} من هوستينجر مع حماية WHOIS و DNS مجاني`,
                      })}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-95"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حجز الدومين الآن' : 'Register Domain'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: AI TOOLS SUBSCRIPTIONS */}
        {(activeCategory === 'all' || activeCategory === 'ai') && (
          <div className="space-y-6 pt-4">
            
            {/* AI Catalog Header with Subcategory Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-[#1E1E24] dark:text-white">
                    {isAr ? 'الاشتراك في مواقع وتطبيقات الذكاء الاصطناعي' : 'Official AI Tools & Apps Subscriptions'}
                  </h3>
                </div>
                <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1">
                  {isAr
                    ? 'اشتراكات رسمية 100% في أقوى منصات الذكاء الاصطناعي العالمية مع التفعيل الفوري على بريدك الشخصي وبطرق دفع محلية ميسرة'
                    : '100% official subscriptions for ChatGPT Plus, Claude Pro, Midjourney, Perplexity with instant email activation'}
                </p>
              </div>

              {/* 4. AI Subcategory Filter Dropdown (قائمة منسدلة لتصفية تطبيقات الذكاء الاصطناعي) */}
              <div className="relative shrink-0" ref={aiCategoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAiCategoryDropdownOpen(!aiCategoryDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-[#F5EFF7] dark:bg-slate-800 text-xs font-bold text-[#4E115A] dark:text-purple-300 hover:bg-[#F5EFF7]/80 transition-colors shadow-2xs cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
                  <span>
                    {aiCategoriesList.find(c => c.id === aiSubCategoryFilter)?.[isAr ? 'labelAr' : 'labelEn']}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aiCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {aiCategoryDropdownOpen && (
                  <div className="absolute top-full mt-2 rtl:left-0 ltr:right-0 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#6E6A75] dark:text-slate-400 px-3 py-1 font-mono">
                      {isAr ? 'تصفية حسب نوع التطبيق' : 'Filter by App Type'}
                    </div>
                    <div className="space-y-1 mt-1">
                      {aiCategoriesList.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setAiSubCategoryFilter(cat.id);
                            setAiCategoryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left rtl:text-right font-medium transition-colors cursor-pointer ${
                            aiSubCategoryFilter === cat.id
                              ? 'bg-[#4E115A] text-white font-bold'
                              : 'hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200'
                          }`}
                        >
                          <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                          {aiSubCategoryFilter === cat.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredAiTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900 ${
                    tool.isPopular
                      ? 'border-[#4E115A] shadow-lg shadow-[#4E115A]/10 ring-1 ring-[#4E115A]/20'
                      : 'border-[#DCD3DF] dark:border-slate-800 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Badge and Category */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold text-[#6E6A75] dark:text-slate-400">
                        {isAr ? tool.categoryAr : tool.categoryEn}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300">
                        {isAr ? tool.badgeAr : tool.badgeEn}
                      </span>
                    </div>

                    {/* Tool Title */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${tool.iconBg} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                        <Bot className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-[#1E1E24] dark:text-white leading-tight">
                        {tool.name}
                      </h4>
                    </div>

                    {/* Price Tag */}
                    <div className="mb-3 p-3 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800 border border-[#DCD3DF]/70 dark:border-slate-700">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#1E1E24] dark:text-white">
                          ${tool.priceUSD.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                          / {isAr ? tool.cycleAr : tool.cycleEn}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#1AD062] font-semibold mt-0.5 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isAr ? tool.activationMethodAr : tool.activationMethodEn}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#6E6A75] dark:text-slate-300 leading-relaxed mb-4">
                      {isAr ? tool.descriptionAr : tool.descriptionEn}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1.5 mb-5 border-t border-[#DCD3DF]/60 dark:border-slate-800 pt-3">
                      {(isAr ? tool.featuresAr : tool.featuresEn).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-[#1E1E24] dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-[#1AD062] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={() => handleOpenOrderModal({
                      title: `اشتراك ${tool.name}`,
                      type: 'ai',
                      priceUSD: tool.priceUSD,
                      details: `تفعيل رسمي مباشر مع ضمان كامل، السعر: $${tool.priceUSD} شهرياً`,
                    })}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-black shadow-md shadow-[#4E115A]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAr ? 'طلب تفعيل الاشتراك' : 'Subscribe Now'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: HOSTING & BUSINESS EMAIL SOLUTIONS */}
        {(activeCategory === 'all' || activeCategory === 'hosting') && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-[#4E115A] dark:text-purple-300 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'الاستضافة السحابية والبريد الإلكتروني المهني' : 'Cloud Hosting & Professional Business Email'}
                </h3>
                <p className="text-xs text-[#6E6A75] dark:text-slate-400">
                  {isAr ? 'بنية تحتية موثوقة لمواقع الشركات، المتاجر الإلكترونية، وحسابات البريد باسم علامتك التجارية' : 'Reliable business infrastructure, WordPress hosting, and custom branded emails'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/60 dark:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-black text-[#1E1E24] dark:text-white">
                    {isAr ? 'البريد الإلكتروني المؤسسي' : 'Business Branded Email'}
                  </h4>
                  <div className="text-xl font-black text-[#4E115A] dark:text-purple-300 mt-1 mb-2">
                    $1.99 <span className="text-xs font-normal text-[#6E6A75] dark:text-slate-400">/ {isAr ? 'حساب / شهر' : 'mailbox / mo'}</span>
                  </div>
                  <p className="text-xs text-[#6E6A75] dark:text-slate-400 leading-relaxed mb-4">
                    {isAr
                      ? 'بريد إلكتروني رسمي باسم شركتك (مثل info@yourcompany.com) مع سعة 10GB لكل حساب وتوافق كامل مع Outlook و Gmail.'
                      : 'Custom email matching your domain with 10GB per mailbox and seamless Outlook/Gmail sync.'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenOrderModal({
                    title: 'خدمة البريد المؤسسي المهني',
                    type: 'hosting',
                    priceUSD: 1.99,
                    details: 'بريد رسمي مع حماية مضادة للسبام وسعة 10GB',
                  })}
                  className="w-full py-2.5 rounded-xl border border-[#4E115A] text-[#4E115A] dark:text-purple-300 hover:bg-[#4E115A] hover:text-white text-xs font-bold transition-all text-center cursor-pointer"
                >
                  {isAr ? 'طلب إعداد البريد' : 'Setup Business Email'}
                </button>
              </div>

              <div className="p-6 rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/60 dark:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-3">
                    <Server className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-black text-[#1E1E24] dark:text-white">
                    {isAr ? 'استضافة ووردبريس ومواقع الويب' : 'Hostinger Cloud Web Hosting'}
                  </h4>
                  <div className="text-xl font-black text-[#4E115A] dark:text-purple-300 mt-1 mb-2">
                    $3.99 <span className="text-xs font-normal text-[#6E6A75] dark:text-slate-400">/ {isAr ? 'شهرياً' : 'mo'}</span>
                  </div>
                  <p className="text-xs text-[#6E6A75] dark:text-slate-400 leading-relaxed mb-4">
                    {isAr
                      ? 'استضافة سريعة على خوادم هوستينجر تدعم حتى 100 موقع، أقراص NVMe فائقة السرعة، نسخ احتياطي يومي مجاني، ودومين مجاني للسنة الأولى.'
                      : 'Host up to 100 websites with NVMe storage, daily auto-backups, and free first-year domain.'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenOrderModal({
                    title: 'استضافة هوستينجر السحابية للمواقع',
                    type: 'hosting',
                    priceUSD: 3.99,
                    details: 'استضافة 100 موقع مع أقراص NVMe ودومين مجاني',
                  })}
                  className="w-full py-2.5 rounded-xl border border-[#4E115A] text-[#4E115A] dark:text-purple-300 hover:bg-[#4E115A] hover:text-white text-xs font-bold transition-all text-center cursor-pointer"
                >
                  {isAr ? 'حجز الاستضافة' : 'Order Cloud Hosting'}
                </button>
              </div>

              <div className="p-6 rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/60 dark:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-black text-[#1E1E24] dark:text-white">
                    {isAr ? 'سيرفرات سحابية خاصة (VPS)' : 'Dedicated Cloud VPS'}
                  </h4>
                  <div className="text-xl font-black text-[#4E115A] dark:text-purple-300 mt-1 mb-2">
                    $9.99 <span className="text-xs font-normal text-[#6E6A75] dark:text-slate-400">/ {isAr ? 'شهرياً' : 'mo'}</span>
                  </div>
                  <p className="text-xs text-[#6E6A75] dark:text-slate-400 leading-relaxed mb-4">
                    {isAr
                      ? 'سيرفرات افتراضية مخصصة بالكامل بصلاحيات Root كاملة، عتاد عالي الأداء لمطوري الباك إند، التطبيقات، وقواعد البيانات.'
                      : 'Full root access VPS with dedicated vCPU, NVMe storage, and scalable resources for developers.'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenOrderModal({
                    title: 'سيرفر سحابي خاص VPS',
                    type: 'hosting',
                    priceUSD: 9.99,
                    details: 'سيرفر VPS مخصص مع Root Access وعنوان IP ثابت',
                  })}
                  className="w-full py-2.5 rounded-xl border border-[#4E115A] text-[#4E115A] dark:text-purple-300 hover:bg-[#4E115A] hover:text-white text-xs font-bold transition-all text-center cursor-pointer"
                >
                  {isAr ? 'حجز سيرفر VPS' : 'Order VPS Server'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enterprise Assistance & Custom Service Banner */}
        <div className="rounded-3xl border border-[#DCD3DF] dark:border-slate-800 bg-gradient-to-r from-[#F5EFF7] to-white dark:from-slate-900 dark:to-slate-950 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h4 className="text-base font-black text-[#1E1E24] dark:text-white">
                {isAr ? 'هل تحتاج إلى خدمة أو اشتراك غير مدرج في القائمة؟' : 'Need a custom tool or specialized domain?'}
              </h4>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1 max-w-xl">
                {isAr
                  ? 'نوفر لك أي اشتراك برمجي أو خدمة ذكاء اصطناعي أو تسجيل دومينات خاصة بنظام الدفع المحلي والتسليم الفوري عبر فريق الدعم المباشر.'
                  : 'We can procure and activate any specialized digital tool, license, or ccTLD domain. Reach out to our team.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="https://wa.me/967770600046"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#1AD062] hover:bg-[#16b755] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isAr ? 'واتساب الإدارة المباشر' : 'Management WhatsApp'}</span>
            </a>
            <a
              href="mailto:saad@rawajye.com"
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#1E1E24] dark:text-white hover:bg-slate-50 transition-colors text-center"
            >
              saad@rawajye.com
            </a>
          </div>
        </div>

      </div>

      {/* Order & Checkout Modal */}
      {orderModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4E115A] text-white flex items-center justify-center shrink-0">
                  {selectedService.type === 'domain' ? (
                    <Globe className="w-5 h-5 text-cyan-300" />
                  ) : selectedService.type === 'ai' ? (
                    <Bot className="w-5 h-5 text-amber-300" />
                  ) : (
                    <Server className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E1E24] dark:text-white">
                    {isAr ? 'تأكيد طلب الخدمة الرقمية' : 'Confirm Service Order'}
                  </h3>
                  <div className="text-xs text-[#6E6A75] dark:text-slate-400">
                    {selectedService.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Service Details Card */}
            <div className="p-4 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6E6A75] dark:text-slate-400">{isAr ? 'الخدمة المطلوبة' : 'Service'}</span>
                <span className="font-bold text-[#1E1E24] dark:text-white">{selectedService.title}</span>
              </div>
              {selectedService.details && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A75] dark:text-slate-400">{isAr ? 'التفاصيل' : 'Details'}</span>
                  <span className="text-[#1E1E24] dark:text-slate-200">{selectedService.details}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#DCD3DF]/70 dark:border-slate-700 flex items-center justify-between text-sm">
                <span className="font-black text-[#1E1E24] dark:text-white">{isAr ? 'القيمة الإجمالية' : 'Total Price'}</span>
                <span className="font-black text-[#4E115A] dark:text-purple-300 text-base">
                  ${selectedService.priceUSD.toFixed(2)} USD
                </span>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1E24] dark:text-white mb-1.5">
                    {isAr ? 'البريد الإلكتروني للتفعيل' : 'Activation Email'}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#4E115A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1E24] dark:text-white mb-1.5">
                    {isAr ? 'رقم الواتساب للتواصل' : 'WhatsApp Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="770000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#4E115A]"
                    required
                  />
                </div>
              </div>

              {/* Local Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-[#1E1E24] dark:text-white mb-2">
                  {isAr ? 'اختر طريقة الدفع المناسبة' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('kuraimi')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentGateway === 'kuraimi'
                        ? 'border-[#4E115A] bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 ring-1 ring-[#4E115A]'
                        : 'border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-white'
                    }`}
                  >
                    <span>{isAr ? 'بنك الكريمي' : 'Kuraimi Bank'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('floosak')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentGateway === 'floosak'
                        ? 'border-[#4E115A] bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 ring-1 ring-[#4E115A]'
                        : 'border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-white'
                    }`}
                  >
                    <span>{isAr ? 'محفظة فلوسك' : 'Floosak Wallet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('jawali')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentGateway === 'jawali'
                        ? 'border-[#4E115A] bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 ring-1 ring-[#4E115A]'
                        : 'border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-white'
                    }`}
                  >
                    <span>{isAr ? 'محفظة جوالي' : 'Jawali Wallet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('mada')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPaymentGateway === 'mada'
                        ? 'border-[#4E115A] bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 ring-1 ring-[#4E115A]'
                        : 'border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Mada / Visa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('flex')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-2 cursor-pointer ${
                      selectedPaymentGateway === 'flex'
                        ? 'border-[#4E115A] bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 ring-1 ring-[#4E115A]'
                        : 'border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#1AD062]" />
                    <span>{isAr ? 'رصيد محفظة Flex رواج' : 'Rawaj Flex Wallet'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#1AD062]/10 border border-[#1AD062]/20 text-[11px] text-[#1AD062] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isAr
                    ? 'سيتم توجيهك إلى واتساب خدمة العملاء فوراً لتأكيد التفعيل واستلام بيانات الحساب'
                    : 'You will be connected to WhatsApp support to finalize activation and receive credentials'}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#6E6A75] dark:text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 py-2.5 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold shadow-md shadow-[#4E115A]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? 'جارِ التسجيل...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{isAr ? 'إرسال الطلب والتفعيل' : 'Submit & Activate'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
