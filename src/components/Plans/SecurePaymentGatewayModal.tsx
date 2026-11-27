import React, { useState, useEffect, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { PlanTier } from '../../types/storage';
import {
  X,
  Lock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  Check,
  Receipt,
  Layers,
  Calendar,
  User,
  Mail,
  Wand2,
  ArrowRight,
  HardDrive,
} from 'lucide-react';

type CardBrand = 'visa' | 'mastercard' | 'mada' | 'amex' | 'unknown';
type GatewayStep = 'form' | 'verifying' | 'success';

interface FormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  email?: string;
}

interface ReceiptSummary {
  planNameAr: string;
  planNameEn: string;
  storageLabel: string;
  billingCycle: 'monthly' | 'annual';
  amountUSD: number;
  cardBrandLabel: string;
  cardLast4: string;
  transactionRef: string;
  invoiceNumber: string;
  paidAt: string;
  email: string;
}

const MADA_PREFIXES = ['4406', '4407', '4017', '4071', '4073', '4106', '4176', '4578', '5888', '6361', '9682'];

function detectCardBrand(rawDigits: string): CardBrand {
  if (!rawDigits) return 'unknown';
  if (MADA_PREFIXES.some(prefix => rawDigits.startsWith(prefix))) return 'mada';
  if (/^4/.test(rawDigits)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(rawDigits)) return 'mastercard';
  if (/^3[47]/.test(rawDigits)) return 'amex';
  return 'unknown';
}

function getCardBrandLabel(brand: CardBrand, isAr: boolean): string {
  switch (brand) {
    case 'mada':
      return isAr ? 'مدى Mada' : 'Mada';
    case 'visa':
      return 'Visa';
    case 'mastercard':
      return 'Mastercard';
    case 'amex':
      return 'American Express';
    default:
      return isAr ? 'بطاقة ائتمانية' : 'Credit Card';
  }
}

function passesLuhnCheck(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (Number.isNaN(digit)) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function formatCardDigits(raw: string, brand: CardBrand): string {
  const maxLen = brand === 'amex' ? 15 : 16;
  const digits = raw.replace(/\D/g, '').slice(0, maxLen);
  if (brand === 'amex') {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiryInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length === 1) {
    return parseInt(digits, 10) > 1 ? `0${digits}/` : digits;
  }
  const month = digits.slice(0, 2);
  const year = digits.slice(2, 4);
  if (digits.length === 2) return `${month}`;
  return `${month}/${year}`;
}

function formatStorageLabel(storageGB: number): string {
  return storageGB >= 1024 ? `${(storageGB / 1024).toFixed(storageGB % 1024 === 0 ? 0 : 1)} TB` : `${storageGB} GB`;
}

export const SecurePaymentGatewayModal: React.FC = () => {
  const {
    lang,
    allPlans,
    currentPlan,
    currentUser,
    paymentGatewayPlan,
    paymentGatewayCycle,
    closePaymentGateway,
    upgradePlan,
    setActiveTab,
  } = useStorage();

  const isAr = lang === 'ar';

  // Local selected plan & cycle inside the modal so user can adjust before paying
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Form inputs (strictly transient — wiped right after verification)
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [billingEmail, setBillingEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Workflow state
  const [step, setStep] = useState<GatewayStep>('form');
  const [verifyStage, setVerifyStage] = useState<0 | 1 | 2 | 3>(0);
  const [receipt, setReceipt] = useState<ReceiptSummary | null>(null);

  // Sync whenever gateway opens with a plan
  useEffect(() => {
    if (paymentGatewayPlan) {
      setSelectedPlan(paymentGatewayPlan);
      setBillingCycle(paymentGatewayCycle);
      setBillingEmail(currentUser?.email || 'rawajtel4@gmail.com');
      setCardholderName('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setShowCvv(false);
      setErrors({});
      setStep('form');
      setVerifyStage(0);
      setReceipt(null);
    }
  }, [paymentGatewayPlan, paymentGatewayCycle, currentUser?.email]);

  const paidPlans = useMemo(
    () => allPlans.filter(p => p.isActive !== false && p.id !== 'free'),
    [allPlans]
  );

  if (!paymentGatewayPlan || !selectedPlan) return null;

  const rawDigits = cardNumber.replace(/\D/g, '');
  const detectedBrand = detectCardBrand(rawDigits);
  const expectedDigits = detectedBrand === 'amex' ? 15 : 16;
  const expectedCvvLen = detectedBrand === 'amex' ? 4 : 3;

  const isFlexPlan = selectedPlan.id === 'flex';
  const monthlyPrice = isFlexPlan ? 9.99 : selectedPlan.priceMonthlyUSD;
  const annualPrice = isFlexPlan ? 95.9 : selectedPlan.priceAnnualUSD;
  const totalDue = billingCycle === 'annual' ? annualPrice : monthlyPrice;
  const annualRegularPrice = monthlyPrice * 12;
  const annualSavings = Math.max(0, annualRegularPrice - annualPrice);

  const handleFillTestCard = () => {
    // Alternates between a Luhn-valid Visa test card and a Luhn-valid Mada test card
    const useMada = rawDigits.startsWith('4242');
    if (useMada) {
      setCardholderName(isAr ? 'SAAD ALHADRAMI' : 'SAAD ALHADRAMI');
      setCardNumber('4406 4710 0000 4812');
      setExpiry('08/29');
      setCvv('842');
    } else {
      setCardholderName(isAr ? 'SAAD ALHADRAMI' : 'SAAD ALHADRAMI');
      setCardNumber('4242 4242 4242 4242');
      setExpiry('11/28');
      setCvv('424');
    }
    setErrors({});
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    const trimmedName = cardholderName.trim();
    if (trimmedName.length < 3 || !/^[\p{L}\s.'-]+$/u.test(trimmedName)) {
      nextErrors.cardholderName = isAr
        ? 'يرجى إدخال الاسم الكامل كما يظهر على البطاقة'
        : 'Enter the full cardholder name as shown on card';
    }

    if (rawDigits.length !== expectedDigits) {
      nextErrors.cardNumber = isAr
        ? `يجب أن يتكون رقم البطاقة من ${expectedDigits} رقماً`
        : `Card number must be ${expectedDigits} digits`;
    } else if (!passesLuhnCheck(rawDigits)) {
      nextErrors.cardNumber = isAr
        ? 'رقم البطاقة غير صالح — يرجى التحقق من الأرقام أو استخدام زر البطاقة التجريبية'
        : 'Invalid card number checksum — verify digits or use the test card button';
    }

    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
    if (!expiryMatch) {
      nextErrors.expiry = isAr ? 'الصيغة المطلوبة MM/YY' : 'Use MM/YY format';
    } else {
      const mm = parseInt(expiryMatch[1], 10);
      const yy = 2000 + parseInt(expiryMatch[2], 10);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (mm < 1 || mm > 12) {
        nextErrors.expiry = isAr ? 'شهر انتهاء غير صحيح' : 'Invalid expiry month';
      } else if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        nextErrors.expiry = isAr ? 'البطاقة منتهية الصلاحية' : 'Card has expired';
      }
    }

    const cleanCvv = cvv.replace(/\D/g, '');
    if (cleanCvv.length < 3 || cleanCvv.length > 4 || (detectedBrand === 'amex' && cleanCvv.length !== 4)) {
      nextErrors.cvv = isAr
        ? `رمز الأمان (${expectedCvvLen} أرقام)`
        : `CVV must be ${expectedCvvLen} digits`;
    }

    if (!billingEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail.trim())) {
      nextErrors.email = isAr
        ? 'أدخل بريداً إلكترونياً صحيحاً لاستلام الفاتورة'
        : 'Enter a valid email address for your receipt';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const last4 = rawDigits.slice(-4);
    const brandLabel = getCardBrandLabel(detectedBrand, false);
    const now = new Date();
    const txnRef = `TXN-RWJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    const invNum = `INV-RWJ-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setStep('verifying');
    setVerifyStage(1);

    // Stage 1 -> Stage 2 (3D Secure bank verification)
    window.setTimeout(() => {
      setVerifyStage(2);
    }, 900);

    // Stage 2 -> Stage 3 (Confirming payment & upgrading plan)
    window.setTimeout(() => {
      setVerifyStage(3);
    }, 1850);

    // Stage 3 -> Success receipt & plan activation
    window.setTimeout(() => {
      upgradePlan(selectedPlan.id, {
        billingCycle,
        cardBrand: brandLabel,
        cardLast4: last4,
        transactionRef: txnRef,
        invoiceNumber: invNum,
        keepModalOpen: true,
      });

      setReceipt({
        planNameAr: selectedPlan.nameAr,
        planNameEn: selectedPlan.nameEn,
        storageLabel: formatStorageLabel(selectedPlan.storageGB),
        billingCycle,
        amountUSD: totalDue,
        cardBrandLabel: brandLabel,
        cardLast4: last4,
        transactionRef: txnRef,
        invoiceNumber: invNum,
        paidAt: now.toLocaleString(isAr ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        email: billingEmail.trim(),
      });

      // Immediately clear sensitive transient card inputs
      setCardNumber('');
      setCvv('');
      setExpiry('');

      setStep('success');
    }, 2650);
  };

  const handleSafeClose = () => {
    if (step === 'verifying') return;
    closePaymentGateway();
  };

  const previewCardNumber = (() => {
    const clean = rawDigits;
    if (!clean) return '••••  ••••  ••••  ••••';
    const padded = clean.padEnd(expectedDigits, '•');
    if (detectedBrand === 'amex') {
      return `${padded.slice(0, 4)}  ${padded.slice(4, 10)}  ${padded.slice(10, 15)}`;
    }
    return `${padded.slice(0, 4)}  ${padded.slice(4, 8)}  ${padded.slice(8, 12)}  ${padded.slice(12, 16)}`;
  })();

  const verificationSteps = [
    {
      stage: 1,
      titleAr: 'تشفير بيانات البطاقة والتحقق من الصلاحية',
      titleEn: 'Encrypting card payload & validating checksum',
      subAr: 'اتصال آمن محمي ببروتوكول TLS 1.3 (256-bit)',
      subEn: 'Protected via TLS 1.3 256-bit end-to-end tunnel',
    },
    {
      stage: 2,
      titleAr: 'المصادقة البنكية الآمنة (3D Secure)',
      titleEn: '3D Secure issuer authentication',
      subAr: 'مطابقة التفويض المالي مع البنك المصدر للبطاقة',
      subEn: 'Verifying authorization token with issuing bank',
    },
    {
      stage: 3,
      titleAr: 'تأكيد الاشتراك وتحديث سعة التخزين السحابية',
      titleEn: 'Confirming subscription & activating cloud quota',
      subAr: 'تحديث حالة الباقة وإصدار الفاتورة الرقمية الرسمية',
      subEn: 'Updating account tier & issuing official receipt',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="secure-gateway-title"
    >
      <div className="relative w-full max-w-3xl max-h-[93dvh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#DCD3DF] dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Top Security Gateway Bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#DCD3DF] dark:border-slate-800 bg-gradient-to-l from-[#4A0E5C] via-[#5E1675] to-[#3B0A4B] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="secure-gateway-title" className="text-sm sm:text-base font-black tracking-tight truncate">
                  {isAr ? 'بوابة الدفع الآمنة — رواج كلاود' : 'Rawaj Cloud Secure Payment Gateway'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-300/30 text-[10px] font-bold text-emerald-200 shrink-0">
                  <Lock className="w-3 h-3" />
                  <span>TLS 1.3 · PCI-DSS</span>
                </span>
              </div>
              <p className="text-[11px] text-purple-100/80 truncate mt-0.5">
                {step === 'success'
                  ? (isAr ? 'تم اعتماد المعاملة وتحديث باقتك السحابية بنجاح' : 'Transaction approved and cloud tier updated')
                  : (isAr ? 'ترقية فورية للباقة مع تشفير مصرفي كامل لبيانات البطاقة' : 'Instant plan upgrade with bank-grade card encryption')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSafeClose}
            disabled={step === 'verifying'}
            aria-label={isAr ? 'إغلاق بوابة الدفع' : 'Close payment gateway'}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* ==================== STEP 1: CREDIT CARD FORM ==================== */}
          {step === 'form' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              
              {/* Summary & Virtual Card Column */}
              <div className="lg:col-span-5 space-y-4 order-1">
                
                {/* Live Interactive Virtual Bank Card */}
                <div className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#3A0A4A] via-[#5E1675] to-[#7C3AED] shadow-lg shadow-[#4A0E5C]/25 border border-white/15 select-none">
                  <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between mb-5">
                    {/* EMV Metallic Chip */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-100/50 flex items-center justify-center shadow-inner">
                      <div className="w-6 h-4 border border-amber-700/40 rounded-xs grid grid-cols-2 gap-px p-0.5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/15 border border-white/20 text-[11px] font-black tracking-wide uppercase">
                        {detectedBrand === 'unknown'
                          ? 'VISA · MADA · MC'
                          : getCardBrandLabel(detectedBrand, isAr)}
                      </span>
                    </div>
                  </div>

                  {/* Card Number Display (always LTR) */}
                  <div
                    dir="ltr"
                    className="relative z-10 font-mono text-base sm:text-[17px] font-bold tracking-[0.14em] tabular-nums text-white/95 mb-5"
                  >
                    {previewCardNumber}
                  </div>

                  {/* Cardholder Name & Expiry */}
                  <div className="relative z-10 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase tracking-wider text-purple-200/75 font-semibold">
                        {isAr ? 'حامل البطاقة' : 'Cardholder'}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide truncate mt-0.5">
                        {cardholderName.trim() || (isAr ? 'الاسم الكامل' : 'FULL NAME')}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[9px] uppercase tracking-wider text-purple-200/75 font-semibold">
                        {isAr ? 'الانتهاء' : 'Expires'}
                      </div>
                      <div dir="ltr" className="text-xs font-mono font-bold tabular-nums mt-0.5">
                        {expiry || 'MM/YY'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Plan & Billing Summary */}
                <div className="rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F8F4FA] dark:bg-slate-800/60 p-4 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-400">
                      {isAr ? 'الباقة المختارة للترقية' : 'Selected Upgrade Plan'}
                    </span>
                    <span className="text-[11px] font-bold text-[#4A0E5C] dark:text-purple-300 flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{formatStorageLabel(selectedPlan.storageGB)}</span>
                    </span>
                  </div>

                  {/* Plan Selector Dropdown if user wants to change tier right here */}
                  <select
                    value={selectedPlan.id}
                    onChange={(e) => {
                      const next = paidPlans.find(p => p.id === e.target.value);
                      if (next) setSelectedPlan(next);
                    }}
                    aria-label={isAr ? 'اختر باقة الترقية' : 'Select upgrade tier'}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-[#1E1E24] dark:text-white focus:outline-none focus:border-[#6D28D9] cursor-pointer"
                  >
                    {paidPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {isAr ? plan.nameAr : plan.nameEn} — {formatStorageLabel(plan.storageGB)}
                        {plan.id === currentPlan.id ? (isAr ? ' (باقتك الحالية)' : ' (Current)') : ''}
                      </option>
                    ))}
                  </select>

                  {/* Monthly / Annual Billing Switch */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        billingCycle === 'monthly'
                          ? 'bg-[#4A0E5C] text-white'
                          : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
                      }`}
                    >
                      {isAr ? 'شهري' : 'Monthly'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        billingCycle === 'annual'
                          ? 'bg-[#4A0E5C] text-white'
                          : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
                      }`}
                    >
                      <span>{isAr ? 'سنوي' : 'Annual'}</span>
                      <span className="px-1 py-0.2 rounded bg-[#1AD062] text-[9px] text-white font-black">
                        -20%
                      </span>
                    </button>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-2 pt-1 text-xs border-t border-[#DCD3DF]/80 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6A75] dark:text-slate-400">
                        {isAr ? 'السعر الأساسي' : 'Plan Subtotal'}
                      </span>
                      <span className="font-mono font-semibold text-[#1E1E24] dark:text-white tabular-nums">
                        ${(billingCycle === 'annual' ? annualRegularPrice : monthlyPrice).toFixed(2)}
                      </span>
                    </div>

                    {billingCycle === 'annual' && annualSavings > 0 && (
                      <div className="flex items-center justify-between text-[#1AD062]">
                        <span>{isAr ? 'خصم الاشتراك السنوي (20%)' : 'Annual Savings (20%)'}</span>
                        <span className="font-mono font-bold tabular-nums">-${annualSavings.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6A75] dark:text-slate-400">
                        {isAr ? 'الضريبة / رسوم التفعيل' : 'VAT & Activation'}
                      </span>
                      <span className="font-mono font-semibold text-[#1AD062] tabular-nums">$0.00</span>
                    </div>

                    <div className="pt-2 border-t border-[#DCD3DF] dark:border-slate-700 flex items-center justify-between">
                      <span className="font-black text-[#1E1E24] dark:text-white">
                        {isAr ? 'الإجمالي المستحق اليوم' : 'Total Due Today'}
                      </span>
                      <span className="font-mono text-base font-black text-[#4A0E5C] dark:text-purple-300 tabular-nums">
                        ${totalDue.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Card Details Form Column */}
              <form onSubmit={handleSubmitPayment} noValidate className="lg:col-span-7 space-y-4 order-2">
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#4A0E5C] dark:text-purple-400" />
                    <h3 className="text-sm font-black text-[#1E1E24] dark:text-white">
                      {isAr ? 'بيانات البطاقة الائتمانية' : 'Credit / Debit Card Details'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5EFF7] hover:bg-[#ECE1F0] dark:bg-purple-950/50 dark:hover:bg-purple-900/50 border border-[#DCD3DF] dark:border-purple-800/60 text-[11px] font-bold text-[#4A0E5C] dark:text-purple-200 transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعبئة بطاقة تجريبية' : 'Fill Test Card'}</span>
                  </button>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label htmlFor="pg-cardholder" className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1.5">
                    {isAr ? 'الاسم الكامل على البطاقة' : 'Cardholder Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5 pointer-events-none" />
                    <input
                      id="pg-cardholder"
                      type="text"
                      autoComplete="cc-name"
                      value={cardholderName}
                      onChange={(e) => {
                        setCardholderName(e.target.value);
                        if (errors.cardholderName) setErrors(prev => ({ ...prev, cardholderName: undefined }));
                      }}
                      placeholder={isAr ? 'مثال: SAAD ALHADRAMI' : 'e.g. SAAD ALHADRAMI'}
                      className={`w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-950 text-[#1E1E24] dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                        errors.cardholderName
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-[#DCD3DF] dark:border-slate-700 focus:border-[#6D28D9]'
                      }`}
                    />
                  </div>
                  {errors.cardholderName && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.cardholderName}</span>
                    </p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="pg-cardnumber" className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
                      {isAr ? 'رقم البطاقة الائتمانية' : 'Card Number'}
                    </label>
                    <span className="text-[10px] font-bold text-[#6E6A75] dark:text-slate-400">
                      Visa · Mastercard · Mada
                    </span>
                  </div>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3.5 pointer-events-none" />
                    <input
                      id="pg-cardnumber"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      dir="ltr"
                      value={cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const brand = detectCardBrand(raw);
                        setCardNumber(formatCardDigits(raw, brand));
                        if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: undefined }));
                      }}
                      placeholder="4242 4242 4242 4242"
                      className={`w-full pl-10 pr-24 py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-bold tracking-wider tabular-nums bg-white dark:bg-slate-950 text-[#1E1E24] dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                        errors.cardNumber
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-[#DCD3DF] dark:border-slate-700 focus:border-[#6D28D9]'
                      }`}
                    />
                    {detectedBrand !== 'unknown' && (
                      <span className="absolute top-1/2 -translate-y-1/2 right-2.5 px-2 py-0.5 rounded-md bg-[#F5EFF7] dark:bg-purple-950/60 text-[#4A0E5C] dark:text-purple-200 border border-[#DCD3DF] dark:border-purple-800 text-[10px] font-black">
                        {getCardBrandLabel(detectedBrand, isAr)}
                      </span>
                    )}
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.cardNumber}</span>
                    </p>
                  )}
                </div>

                {/* Expiry & CVV Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pg-expiry" className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1.5">
                      {isAr ? 'تاريخ الانتهاء (MM/YY)' : 'Expiry Date (MM/YY)'}
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
                      <input
                        id="pg-expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        dir="ltr"
                        maxLength={5}
                        value={expiry}
                        onChange={(e) => {
                          setExpiry(formatExpiryInput(e.target.value));
                          if (errors.expiry) setErrors(prev => ({ ...prev, expiry: undefined }));
                        }}
                        placeholder="MM/YY"
                        className={`w-full pl-9 pr-3 py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-bold tabular-nums bg-white dark:bg-slate-950 text-[#1E1E24] dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                          errors.expiry
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-[#DCD3DF] dark:border-slate-700 focus:border-[#6D28D9]'
                        }`}
                      />
                    </div>
                    {errors.expiry && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.expiry}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pg-cvv" className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1.5">
                      {isAr ? 'رمز الأمان (CVV)' : 'Security Code (CVV)'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none" />
                      <input
                        id="pg-cvv"
                        type={showCvv ? 'text' : 'password'}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        dir="ltr"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => {
                          setCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                          if (errors.cvv) setErrors(prev => ({ ...prev, cvv: undefined }));
                        }}
                        placeholder={detectedBrand === 'amex' ? '1234' : '123'}
                        className={`w-full pl-9 pr-9 py-2.5 rounded-xl border font-mono text-xs sm:text-sm font-bold tabular-nums bg-white dark:bg-slate-950 text-[#1E1E24] dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                          errors.cvv
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-[#DCD3DF] dark:border-slate-700 focus:border-[#6D28D9]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(prev => !prev)}
                        aria-label={showCvv ? 'Hide CVV' : 'Show CVV'}
                        className="absolute top-1/2 -translate-y-1/2 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.cvv && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.cvv}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Billing Receipt Email */}
                <div>
                  <label htmlFor="pg-email" className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1.5">
                    {isAr ? 'البريد الإلكتروني لإرسال الفاتورة' : 'Billing Receipt Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ltr:left-3.5 rtl:right-3.5 pointer-events-none" />
                    <input
                      id="pg-email"
                      type="email"
                      dir="ltr"
                      value={billingEmail}
                      onChange={(e) => {
                        setBillingEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      placeholder="name@example.com"
                      className={`w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border text-xs font-medium bg-white dark:bg-slate-950 text-[#1E1E24] dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-[#DCD3DF] dark:border-slate-700 focus:border-[#6D28D9]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Security Assurance Note */}
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/50 flex items-start gap-2.5 text-[11px] text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {isAr
                      ? 'تتم معالجة الدفع عبر اتصال مشفر 256-bit مع مصادقة 3D Secure. لا يتم تخزين رمز الأمان (CVV) مطلقاً، مع ضمان استرداد كامل لمدة 30 يوماً.'
                      : 'Processed over 256-bit TLS with 3D Secure authentication. Your CVV is never stored, backed by a 30-day money-back guarantee.'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-l from-[#4A0E5C] to-[#6D28D9] hover:from-[#3B0A4B] hover:to-[#5B21B6] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#4A0E5C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Lock className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>
                      {isAr
                        ? `تأكيد الدفع الآمن ($${totalDue.toFixed(2)})`
                        : `Pay Securely ($${totalDue.toFixed(2)})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSafeClose}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-[#DCD3DF] dark:border-slate-700 text-xs font-bold text-[#6E6A75] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== STEP 2: SIMULATED VERIFICATION ==================== */}
          {step === 'verifying' && (
            <div className="max-w-lg mx-auto py-6 sm:py-10 space-y-6 text-center">
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#F5EFF7] dark:bg-purple-950/60 border border-[#DCD3DF] dark:border-purple-800 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#4A0E5C] dark:text-purple-300 animate-spin" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'جارٍ التحقق الآمن من بيانات البطاقة...' : 'Verifying your card securely...'}
                </h3>
                <p className="text-xs text-[#6E6A75] dark:text-slate-400">
                  {isAr
                    ? 'يرجى الانتظار لحظات وعدم إغلاق هذه النافذة حتى اكتمال المصادقة البنكية'
                    : 'Please wait a moment while we complete bank authentication and activate your plan'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4A0E5C] via-[#7C3AED] to-[#1AD062] transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${verifyStage === 1 ? 35 : verifyStage === 2 ? 72 : 96}%` }}
                />
              </div>

              {/* 3-Stage Verification Timeline */}
              <div className="space-y-2.5 text-right rtl:text-right ltr:text-left">
                {verificationSteps.map((item) => {
                  const isDone = verifyStage > item.stage;
                  const isActive = verifyStage === item.stage;
                  return (
                    <div
                      key={item.stage}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                        isDone
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/50'
                          : isActive
                          ? 'bg-[#F8F4FA] dark:bg-purple-950/30 border-[#6D28D9]/40'
                          : 'bg-slate-50/60 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-[#1AD062] text-white'
                            : isActive
                            ? 'bg-[#4A0E5C] text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4" />
                        ) : isActive ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="text-[11px] font-bold font-mono">{item.stage}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#1E1E24] dark:text-white">
                          {isAr ? item.titleAr : item.titleEn}
                        </div>
                        <div className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                          {isAr ? item.subAr : item.subEn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== STEP 3: SUCCESS CONFIRMATION ==================== */}
          {step === 'success' && receipt && (
            <div className="max-w-xl mx-auto py-3 sm:py-5 space-y-5">
              
              {/* Celebratory Verification Header */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[#1AD062]/15 border border-[#1AD062]/30 text-[#1AD062] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#1E1E24] dark:text-white">
                  {isAr ? 'تم تأكيد الاشتراك وترقية الباقة بنجاح!' : 'Subscription Confirmed & Plan Upgraded!'}
                </h3>
                <p className="text-xs text-[#6E6A75] dark:text-slate-400 max-w-md mx-auto">
                  {isAr
                    ? `تم تفعيل باقة "${receipt.planNameAr}" بسعة ${receipt.storageLabel} فوراً على حسابك، وتم إرسال نسخة من الفاتورة إلى ${receipt.email}.`
                    : `"${receipt.planNameEn}" (${receipt.storageLabel}) is now active on your account. A receipt has been sent to ${receipt.email}.`}
                </p>
              </div>

              {/* Official Digital Receipt Summary */}
              <div className="rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-[#F8F4FA] dark:bg-slate-800/60 overflow-hidden">
                <div className="px-4 py-3 bg-[#4A0E5C] text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <Receipt className="w-4 h-4 text-amber-300" />
                    <span>{isAr ? 'إيصال الدفع الإلكتروني' : 'Official Payment Receipt'}</span>
                  </div>
                  <span className="font-mono text-[11px] text-purple-200 tabular-nums">
                    {receipt.invoiceNumber}
                  </span>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6E6A75] dark:text-slate-400">
                      {isAr ? 'الباقة المفعلة الآن' : 'Active Plan'}
                    </span>
                    <span className="font-black text-[#4A0E5C] dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {isAr ? receipt.planNameAr : receipt.planNameEn} ({receipt.storageLabel})
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6E6A75] dark:text-slate-400">
                      {isAr ? 'دورة الفوترة' : 'Billing Cycle'}
                    </span>
                    <span className="font-bold text-[#1E1E24] dark:text-white">
                      {receipt.billingCycle === 'annual'
                        ? (isAr ? 'اشتراك سنوي (تجديد آلي)' : 'Annual (Auto-Renew)')
                        : (isAr ? 'اشتراك شهري (تجديد آلي)' : 'Monthly (Auto-Renew)')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6E6A75] dark:text-slate-400">
                      {isAr ? 'وسيلة الدفع' : 'Payment Method'}
                    </span>
                    <span className="font-mono font-bold text-[#1E1E24] dark:text-white tabular-nums">
                      {receipt.cardBrandLabel} •••• {receipt.cardLast4}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6E6A75] dark:text-slate-400">
                      {isAr ? 'رقم المرجع البنكي' : 'Transaction Reference'}
                    </span>
                    <span className="font-mono font-semibold text-[#1E1E24] dark:text-slate-200 tabular-nums">
                      {receipt.transactionRef}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#6E6A75] dark:text-slate-400">
                      {isAr ? 'التاريخ والوقت' : 'Date & Time'}
                    </span>
                    <span className="font-mono text-[#1E1E24] dark:text-slate-200 tabular-nums">
                      {receipt.paidAt}
                    </span>
                  </div>

                  <div className="pt-2.5 mt-1 border-t border-[#DCD3DF] dark:border-slate-700 flex items-center justify-between">
                    <span className="font-black text-[#1E1E24] dark:text-white">
                      {isAr ? 'المبلغ المدفوع' : 'Amount Paid'}
                    </span>
                    <span className="font-mono text-base font-black text-[#1AD062] tabular-nums">
                      ${receipt.amountUSD.toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Navigation Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    closePaymentGateway();
                    setActiveTab('my-plans');
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#4A0E5C] hover:bg-[#3B0A4B] text-white text-xs font-bold shadow-md shadow-[#4A0E5C]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>{isAr ? 'عرض باقتي المحدثة' : 'View My Active Plan'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    closePaymentGateway();
                    setActiveTab('subscriptions');
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F5EFF7] dark:hover:bg-slate-700 text-[#1E1E24] dark:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-[#4A0E5C] dark:text-purple-300" />
                  <span>{isAr ? 'سجل الاشتراكات والفواتير' : 'Subscriptions & Invoices'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
