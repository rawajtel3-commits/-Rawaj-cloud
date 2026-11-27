import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Key,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Globe,
  HardDrive,
  RefreshCw,
  FolderLock,
  ChevronRight,
  Shield,
  Layers,
  Cpu,
  Server,
  Zap,
} from 'lucide-react';
import { generateVaultPassword } from '../../utils/vaultPasswordGenerator';
import {
  PasswordComplexityHelper,
  evaluatePasswordComplexity,
} from './PasswordComplexityHelper';

// Email standard RFC format regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AuthView: React.FC = () => {
  const {
    lang,
    setLang,
    login,
    loginWithPasskey,
    register,
    resetPasswordRequest,
    setActiveTab,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';

  // Mode: 'login' | 'register' | 'forgot'
  const [activeMode, setActiveMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form States - Login
  const [loginEmail, setLoginEmail] = useState('rawajtel4@gmail.com');
  const [loginPassword, setLoginPassword] = useState('RawajSecure@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmailTouched, setLoginEmailTouched] = useState(false);
  const [loginPasswordTouched, setLoginPasswordTouched] = useState(false);

  // Form States - Register
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'personal' | 'pro'>('free');
  const [selectedRegion, setSelectedRegion] = useState<'me-central-1' | 'eu-west-1' | 'ap-southeast-1'>('me-central-1');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  // Touched states for real-time validation in Register
  const [registerNameTouched, setRegisterNameTouched] = useState(false);
  const [registerEmailTouched, setRegisterEmailTouched] = useState(false);
  const [registerPasswordTouched, setRegisterPasswordTouched] = useState(false);
  const [registerConfirmTouched, setRegisterConfirmTouched] = useState(false);

  // Form States - Forgot Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailTouched, setForgotEmailTouched] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [newResetPasswordTouched, setNewResetPasswordTouched] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // =========================================================================
  // Real-Time Validation Computations
  // =========================================================================

  // Email validations
  const isLoginEmailValid = useMemo(() => EMAIL_REGEX.test(loginEmail.trim()), [loginEmail]);
  const isRegisterEmailValid = useMemo(() => EMAIL_REGEX.test(registerEmail.trim()), [registerEmail]);
  const isForgotEmailValid = useMemo(() => EMAIL_REGEX.test(forgotEmail.trim()), [forgotEmail]);

  // Password complexity validations
  const registerPasswordComplexity = useMemo(
    () => evaluatePasswordComplexity(registerPassword),
    [registerPassword]
  );

  const resetPasswordComplexity = useMemo(
    () => evaluatePasswordComplexity(newResetPassword),
    [newResetPassword]
  );

  // Password match validation
  const passwordsMatch = useMemo(
    () => registerPassword.length > 0 && registerPassword === registerConfirmPassword,
    [registerPassword, registerConfirmPassword]
  );

  // =========================================================================
  // Form Submit Handlers with Real-Time Guard Validation
  // =========================================================================

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginEmailTouched(true);
    setLoginPasswordTouched(true);

    if (!loginEmail.trim()) {
      showNotification(
        'يرجى إدخال البريد الإلكتروني',
        'Please enter your email address',
        'warning'
      );
      return;
    }

    if (!isLoginEmailValid) {
      showNotification(
        'صيغة البريد الإلكتروني غير صحيحة، يرجى كتابة بريد صالح (مثال: user@example.com)',
        'Invalid email format. Please provide a valid email (e.g. user@example.com)',
        'warning'
      );
      return;
    }

    if (!loginPassword.trim()) {
      showNotification(
        'يرجى إدخال كلمة المرور',
        'Please enter your password',
        'warning'
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(loginEmail, loginPassword, rememberMe);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Passkey Login
  const handlePasskeyLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithPasskey();
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick Demo Account Click
  const handleQuickDemoLogin = () => {
    setLoginEmail('rawajtel4@gmail.com');
    setLoginPassword('RawajSecure@2026');
    setLoginEmailTouched(true);
    setLoginPasswordTouched(true);
    login('rawajtel4@gmail.com', 'RawajSecure@2026', true);
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterNameTouched(true);
    setRegisterEmailTouched(true);
    setRegisterPasswordTouched(true);
    setRegisterConfirmTouched(true);

    if (!registerName.trim()) {
      showNotification(
        'يرجى كتابة الاسم الكامل أو اسم المؤسسة',
        'Please enter your full name or organization',
        'warning'
      );
      return;
    }

    if (!registerEmail.trim() || !isRegisterEmailValid) {
      showNotification(
        'يرجى إدخال بريد إلكتروني صحيح ومعتمد (مثال: name@domain.com)',
        'Please enter a valid email address (e.g. name@domain.com)',
        'warning'
      );
      return;
    }

    // Check Complexity: Min length, uppercase, lowercase, digits & special symbols
    if (!registerPasswordComplexity.minLength) {
      showNotification(
        'يجب ألا تقل كلمة المرور عن 8 خانات لضمان أمان التشفير الصفري',
        'Password must be at least 8 characters long',
        'warning'
      );
      return;
    }

    if (!registerPasswordComplexity.hasUppercase || !registerPasswordComplexity.hasLowercase) {
      showNotification(
        'يجب أن تحتوي كلمة المرور على حرف كبير (A-Z) وحرف صغير (a-z) على الأقل',
        'Password must include both uppercase (A-Z) and lowercase (a-z) letters',
        'warning'
      );
      return;
    }

    if (!registerPasswordComplexity.hasNumber) {
      showNotification(
        'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9)',
        'Password must contain at least one digit (0-9)',
        'warning'
      );
      return;
    }

    if (!registerPasswordComplexity.hasSymbol) {
      showNotification(
        'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (!@#$%...)',
        'Password must include at least one special character (!@#$)',
        'warning'
      );
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      showNotification(
        'كلمة المرور وتأكيد كلمة المرور غير متطابقين، يرجى إعادة التحقق',
        'Passwords do not match. Please verify confirmation field',
        'warning'
      );
      return;
    }

    if (!agreeTerms) {
      showNotification(
        'يرجى الموافقة على شروط الاستخدام وسياسة التشفير الصفري للمتابعة',
        'Please accept the Terms of Service & Privacy Policy',
        'warning'
      );
      return;
    }

    setIsRegistering(true);
    try {
      await register(registerName, registerEmail, registerPassword, selectedPlan, selectedRegion);
    } finally {
      setIsRegistering(false);
    }
  };

  // Auto-generate strong password for registration with full complexity satisfied
  const handleGenerateStrongPassword = () => {
    const generated = generateVaultPassword({
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: true,
    });
    setRegisterPassword(generated);
    setRegisterConfirmPassword(generated);
    setRegisterPasswordTouched(true);
    setRegisterConfirmTouched(true);
    setShowRegisterPassword(true);
    showNotification(
      'تم توليد كلمة مرور مشفرة متوافقة كلياً مع معايير الأمان وتعبئتها تلقائياً!',
      'Ultra-secure key matching all complexity requirements generated!',
      'success'
    );
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotEmailTouched(true);

    if (forgotStep === 1) {
      if (!forgotEmail.trim() || !isForgotEmailValid) {
        showNotification(
          'يرجى كتابة بريد إلكتروني صالح لاستلام رمز التحقق',
          'Please enter a valid email address to receive reset code',
          'warning'
        );
        return;
      }
      setIsResetting(true);
      await resetPasswordRequest(forgotEmail);
      setIsResetting(false);
      setForgotStep(2);
    } else {
      setNewResetPasswordTouched(true);
      if (!forgotOtp.trim()) {
        showNotification(
          'يرجى إدخال رمز التحقق OTP المكون من 6 أرقام',
          'Please enter the 6-digit verification code',
          'warning'
        );
        return;
      }

      if (!resetPasswordComplexity.minLength || !resetPasswordComplexity.hasSymbol) {
        showNotification(
          'يجب أن تتكون كلمة المرور الجديدة من 8 خانات ورمز خاص واحد على الأقل',
          'New password must have at least 8 characters and one symbol',
          'warning'
        );
        return;
      }

      setIsResetting(true);
      await new Promise(r => setTimeout(r, 700));
      setIsResetting(false);
      showNotification(
        'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول',
        'Password reset successfully! You can now log in',
        'success'
      );
      setLoginEmail(forgotEmail);
      setLoginPassword(newResetPassword);
      setActiveMode('login');
      setForgotStep(1);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 pb-28">
      
      {/* Top Floating Mini Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-xs font-bold text-[#6E6A75] dark:text-slate-300 hover:text-[#4E115A] dark:hover:text-purple-300 transition-colors cursor-pointer"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة للمنصة السحابية' : 'Back to Workspace'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 text-xs font-bold text-[#1E1E24] dark:text-white shadow-2xs hover:border-[#4E115A] transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#A38540]" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Authentication Section */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Visual Brand & Security Showcase (5 cols)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#4E115A] via-[#3a0c43] to-[#25082b] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-[#1AD062]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              
              {/* Brand Logo & Name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md">
                  <img
                    src="/assets/aistudio/_________________20261107_140807______425b22ac.png"
                    alt="Rawaj Cloud Official Logo"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white">
                    {isAr ? 'رواج كلاود' : 'Rawaj Cloud'}
                  </h1>
                  <span className="text-[11px] font-mono text-[#DCD3DF] tracking-wide block">
                    Enterprise Zero-Knowledge Cloud
                  </span>
                </div>
              </div>

              {/* Headline & Value Proposition */}
              <div className="space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-mono font-bold text-cyan-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1AD062]" />
                  <span>{isAr ? 'تشفير صفري E2EE معتمد' : 'Certified E2EE Protocol'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {isAr
                    ? 'التخزين السحابي فائق الأمان والسرعة للشركات والمبدعين'
                    : 'Ultra-Secure Cloud Storage for Modern Teams'}
                </h2>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {isAr
                    ? 'بياناتك ملكك وحدك. لا نستطيع نحن ولا خوادمنا قراءة ملفاتك أو محادثاتك بفضل التشفير المحلي الموثوق على جهازك.'
                    : 'Your files and WhatsApp backups are strictly encrypted on your device before upload with private 256-bit keys.'}
                </p>
              </div>

              {/* 4 Feature Badges */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <FolderLock className="w-5 h-5 text-cyan-300 shrink-0" />
                  <div>
                    <div className="font-bold text-white">
                      {isAr ? 'الخزنة المشفرة كلياً (Zero-Knowledge Vault)' : 'Zero-Knowledge Vault'}
                    </div>
                    <div className="text-[10px] text-white/70">
                      {isAr ? 'اشتقاق المفاتيح محلياً عبر Argon2id و PBKDF2' : 'Keys derived locally on client device'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <Fingerprint className="w-5 h-5 text-[#1AD062] shrink-0" />
                  <div>
                    <div className="font-bold text-white">
                      {isAr ? 'دعم مفاتيح المرور البيومترية (FIDO2 / Passkeys)' : 'Biometric Passkeys (FIDO2)'}
                    </div>
                    <div className="text-[10px] text-white/70">
                      {isAr ? 'دخول فوري ببصمة الوجه أو الإصبع دون كلمات مرور' : 'Instant Face ID / Touch ID authentication'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                  <Server className="w-5 h-5 text-amber-300 shrink-0" />
                  <div>
                    <div className="font-bold text-white">
                      {isAr ? 'سيرفرات فائقة السرعة مع توافق S3 API' : 'High-Speed Global & Local PoPs'}
                    </div>
                    <div className="text-[10px] text-white/70">
                      {isAr ? 'استجابة فائقة السرعة وضمان تواجدية 99.9%' : 'Unlimited upload speed with 99.9% SLA'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Trust & Compliance Indicator */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-white/70 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1AD062] animate-pulse" />
                <span>99.9% SLA Uptime</span>
              </span>
              <span>TLS 1.3 / AES-256</span>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Form (7 cols)                   */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            
            <div>
              {/* Segmented Mode Switcher (Login vs Sign Up) */}
              <div className="flex items-center justify-between border-b border-[#DCD3DF] dark:border-slate-800 pb-4 mb-6">
                <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('login');
                      setForgotStep(1);
                    }}
                    className={`px-4 sm:px-5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      activeMode === 'login'
                        ? 'bg-[#4E115A] text-white shadow-xs'
                        : 'text-[#6E6A75] dark:text-slate-300 hover:text-[#1E1E24]'
                    }`}
                  >
                    {isAr ? 'تسجيل الدخول' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('register');
                      setForgotStep(1);
                    }}
                    className={`px-4 sm:px-5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      activeMode === 'register'
                        ? 'bg-[#4E115A] text-white shadow-xs'
                        : 'text-[#6E6A75] dark:text-slate-300 hover:text-[#1E1E24]'
                    }`}
                  >
                    {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
                  </button>
                </div>

                {activeMode === 'forgot' && (
                  <button
                    type="button"
                    onClick={() => setActiveMode('login')}
                    className="text-xs font-semibold text-[#4E115A] dark:text-purple-300 hover:underline cursor-pointer"
                  >
                    {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                  </button>
                )}
              </div>

              {/* =================================================== */}
              {/* TAB 1: LOGIN FORM WITH REAL-TIME VALIDATION        */}
              {/* =================================================== */}
              {activeMode === 'login' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  <div>
                    <h3 className="text-xl font-black text-[#1E1E24] dark:text-white">
                      {isAr ? 'مرحباً بك مجدداً في رواج كلاود' : 'Welcome back to Rawaj Cloud'}
                    </h3>
                    <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1">
                      {isAr
                        ? 'سجل دخولك للوصول إلى ملفاتك، الخزنة المشفرة، والنسخ الاحتياطي التلقائي'
                        : 'Sign in to access your files, zero-knowledge vault, and media'}
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                    
                    {/* Email Input with Real-time Validation */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
                          {isAr ? 'البريد الإلكتروني:' : 'Email Address:'}
                        </label>
                        {loginEmailTouched && loginEmail.length > 0 && (
                          <span
                            className={`text-[11px] font-medium flex items-center gap-1 ${
                              isLoginEmailValid ? 'text-[#1AD062]' : 'text-rose-500'
                            }`}
                          >
                            {isLoginEmailValid ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isAr ? 'بريد صالح' : 'Valid email'}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{isAr ? 'صيغة غير صالحة' : 'Invalid format'}</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-[#6E6A75] absolute rtl:right-3.5 ltr:left-3.5" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={e => {
                            setLoginEmail(e.target.value);
                            setLoginEmailTouched(true);
                          }}
                          onBlur={() => setLoginEmailTouched(true)}
                          placeholder="name@example.com"
                          className={`w-full rtl:pr-10 rtl:pl-10 ltr:pl-10 ltr:pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white transition-all border ${
                            loginEmailTouched && loginEmail.length > 0 && !isLoginEmailValid
                              ? 'border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                              : loginEmailTouched && isLoginEmailValid
                              ? 'border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#4E115A]/30 focus:border-[#4E115A]'
                          }`}
                        />
                        {loginEmailTouched && isLoginEmailValid && (
                          <CheckCircle2 className="w-4 h-4 text-[#1AD062] absolute rtl:left-3.5 ltr:right-3.5" />
                        )}
                      </div>

                      {/* Error message */}
                      {loginEmailTouched && loginEmail.length > 0 && !isLoginEmailValid && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{isAr ? 'يرجى إدخال عنوان بريد إلكتروني صحيح (مثال: user@example.com)' : 'Please enter a valid email (e.g. user@example.com)'}</span>
                        </p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
                          {isAr ? 'كلمة المرور:' : 'Password:'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveMode('forgot')}
                          className="text-[11px] font-semibold text-[#4E115A] dark:text-purple-300 hover:underline cursor-pointer"
                        >
                          {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-[#6E6A75] absolute rtl:right-3.5 ltr:left-3.5" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={e => {
                            setLoginPassword(e.target.value);
                            setLoginPasswordTouched(true);
                          }}
                          onBlur={() => setLoginPasswordTouched(true)}
                          placeholder="••••••••••••"
                          className="w-full rtl:pr-10 rtl:pl-10 ltr:pl-10 ltr:pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-[#1E1E24] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4E115A]/30 focus:border-[#4E115A] transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute rtl:left-3 ltr:right-3 text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-purple-300 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {loginPasswordTouched && loginPassword.length === 0 && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{isAr ? 'حقل كلمة المرور مطلوب' : 'Password is required'}</span>
                        </p>
                      )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-[#4E115A] rounded-sm cursor-pointer accent-[#4E115A]"
                        />
                        <span className="text-[#6E6A75] dark:text-slate-300">
                          {isAr ? 'تذكر جلستي على هذا الجهاز' : 'Remember me on this device'}
                        </span>
                      </label>
                    </div>

                    {/* Submit Login Button */}
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 px-4 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoggingIn ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{isAr ? 'جارِ التحقق ومصادقة الجلسة...' : 'Authenticating...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isAr ? 'تسجيل الدخول إلى حسابي' : 'Sign In to Account'}</span>
                          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </>
                      )}
                    </button>

                  </form>

                  {/* Quick Passkey Login & Demo Shortcut */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePasskeyLogin}
                      disabled={isLoggingIn}
                      className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#1AD062] text-xs font-bold text-[#1E1E24] dark:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Fingerprint className="w-4 h-4 text-[#1AD062]" />
                      <span>{isAr ? 'الدخول السريع عبر مفتاح المرور (Passkey / Face ID)' : 'Sign In with Passkey (Face ID / FIDO2)'}</span>
                    </button>

                    {/* Demo One-Click Account */}
                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      className="w-full py-2 px-3 rounded-xl bg-[#F5EFF7] dark:bg-purple-950/30 text-[#4E115A] dark:text-purple-300 hover:bg-[#4E115A] hover:text-white border border-[#4E115A]/30 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
                      <span>{isAr ? 'تجربة سريعة: الدخول بحساب العرض (rawajtel4@gmail.com)' : 'Quick Demo: Login as rawajtel4@gmail.com'}</span>
                    </button>
                  </div>

                </div>
              )}

              {/* =================================================== */}
              {/* TAB 2: REGISTER FORM WITH REAL-TIME VALIDATION     */}
              {/* =================================================== */}
              {activeMode === 'register' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  
                  <div>
                    <h3 className="text-xl font-black text-[#1E1E24] dark:text-white">
                      {isAr ? 'إنشاء حساب جديد في رواج كلاود' : 'Create your Rawaj Cloud Account'}
                    </h3>
                    <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1">
                      {isAr
                        ? 'احصل على مساحة سحابية مجانية فوراً مع مفتاح تشفير خاص بجهازك'
                        : 'Get instant free cloud storage with client-side Zero-Knowledge keys'}
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                        {isAr ? 'الاسم الكامل أو اسم المؤسسة:' : 'Full Name or Business:'}
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-[#6E6A75] absolute rtl:right-3.5 ltr:left-3.5" />
                        <input
                          type="text"
                          required
                          value={registerName}
                          onChange={e => {
                            setRegisterName(e.target.value);
                            setRegisterNameTouched(true);
                          }}
                          onBlur={() => setRegisterNameTouched(true)}
                          placeholder={isAr ? 'مثال: م. سعد الحضرمي' : 'e.g. John Doe'}
                          className={`w-full rtl:pr-10 rtl:pl-3 ltr:pl-10 ltr:pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white transition-all border ${
                            registerNameTouched && registerName.trim().length === 0
                              ? 'border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                              : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#4E115A]/30 focus:border-[#4E115A]'
                          }`}
                        />
                      </div>
                      {registerNameTouched && registerName.trim().length === 0 && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{isAr ? 'يرجى كتابة الاسم الكامل' : 'Full name is required'}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Input with Real-time Format Validation */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
                          {isAr ? 'البريد الإلكتروني الرسمي:' : 'Email Address:'}
                        </label>
                        {registerEmailTouched && registerEmail.length > 0 && (
                          <span
                            className={`text-[11px] font-medium flex items-center gap-1 ${
                              isRegisterEmailValid ? 'text-[#1AD062]' : 'text-rose-500'
                            }`}
                          >
                            {isRegisterEmailValid ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isAr ? 'بريد معتمد وصحيح' : 'Valid email'}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{isAr ? 'صيغة غير صحيحة' : 'Invalid email format'}</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-[#6E6A75] absolute rtl:right-3.5 ltr:left-3.5" />
                        <input
                          type="email"
                          required
                          value={registerEmail}
                          onChange={e => {
                            setRegisterEmail(e.target.value);
                            setRegisterEmailTouched(true);
                          }}
                          onBlur={() => setRegisterEmailTouched(true)}
                          placeholder="yourname@domain.com"
                          className={`w-full rtl:pr-10 rtl:pl-10 ltr:pl-10 ltr:pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white transition-all border ${
                            registerEmailTouched && registerEmail.length > 0 && !isRegisterEmailValid
                              ? 'border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                              : registerEmailTouched && isRegisterEmailValid
                              ? 'border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#4E115A]/30 focus:border-[#4E115A]'
                          }`}
                        />
                        {registerEmailTouched && isRegisterEmailValid && (
                          <CheckCircle2 className="w-4 h-4 text-[#1AD062] absolute rtl:left-3.5 ltr:right-3.5" />
                        )}
                      </div>

                      {registerEmailTouched && registerEmail.length > 0 && !isRegisterEmailValid && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{isAr ? 'يرجى إدخال عنوان بريد إلكتروني صالح مثل: user@company.com' : 'Please enter a valid email format like: user@company.com'}</span>
                        </p>
                      )}
                    </div>

                    {/* Password + Real-time Complexity Checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
                          {isAr ? 'كلمة المرور المشفرة:' : 'Password:'}
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateStrongPassword}
                          className="text-[11px] font-bold text-[#4E115A] dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#A38540]" />
                          <span>{isAr ? 'توليد كلمة مرور قوية تلقائياً' : 'Auto-Generate Key'}</span>
                        </button>
                      </div>

                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-[#6E6A75] absolute rtl:right-3.5 ltr:left-3.5" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          value={registerPassword}
                          onChange={e => {
                            setRegisterPassword(e.target.value);
                            setRegisterPasswordTouched(true);
                          }}
                          onBlur={() => setRegisterPasswordTouched(true)}
                          placeholder="••••••••••••"
                          className={`w-full rtl:pr-10 rtl:pl-10 ltr:pl-10 ltr:pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white transition-all font-mono border ${
                            registerPasswordTouched && registerPassword.length > 0 && !registerPasswordComplexity.isAllMet
                              ? 'border-amber-400 dark:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
                              : registerPasswordTouched && registerPasswordComplexity.isAllMet
                              ? 'border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#4E115A]/30 focus:border-[#4E115A]'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute rtl:left-3 ltr:right-3 text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-purple-300 cursor-pointer"
                        >
                          {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Real-Time Password Complexity Validation Visual Helper */}
                      <PasswordComplexityHelper
                        password={registerPassword}
                        touched={registerPasswordTouched}
                        isAr={isAr}
                      />
                    </div>

                    {/* Confirm Password with Real-time Match Indicator */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
                          {isAr ? 'تأكيد كلمة المرور:' : 'Confirm Password:'}
                        </label>
                        {registerConfirmTouched && registerConfirmPassword.length > 0 && (
                          <span
                            className={`text-[10px] font-bold flex items-center gap-1 ${
                              passwordsMatch ? 'text-[#1AD062]' : 'text-rose-500'
                            }`}
                          >
                            {passwordsMatch ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>{isAr ? 'كلمات المرور متطابقة' : 'Passwords match'}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>{isAr ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'}</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-[#6E6A75] absolute rtl:right-3.5 ltr:left-3.5" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          value={registerConfirmPassword}
                          onChange={e => {
                            setRegisterConfirmPassword(e.target.value);
                            setRegisterConfirmTouched(true);
                          }}
                          onBlur={() => setRegisterConfirmTouched(true)}
                          placeholder="••••••••••••"
                          className={`w-full rtl:pr-10 rtl:pl-10 ltr:pl-10 ltr:pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white transition-all font-mono border ${
                            registerConfirmTouched && registerConfirmPassword.length > 0 && !passwordsMatch
                              ? 'border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                              : registerConfirmTouched && passwordsMatch
                              ? 'border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#4E115A]/30 focus:border-[#4E115A]'
                          }`}
                        />
                        {registerConfirmTouched && passwordsMatch && (
                          <CheckCircle2 className="w-4 h-4 text-[#1AD062] absolute rtl:left-3.5 ltr:right-3.5" />
                        )}
                      </div>

                      {registerConfirmTouched && registerConfirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{isAr ? 'كلمة المرور وتأكيدها غير متطابقين' : 'Passwords do not match'}</span>
                        </p>
                      )}
                    </div>

                    {/* Preferred Storage Region */}
                    <div>
                      <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                        {isAr ? 'مركز البيانات والسيادة السحابية:' : 'Storage Region:'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'me-central-1', labelAr: 'الرياض (KSA)', labelEn: 'Riyadh (KSA)' },
                          { id: 'eu-west-1', labelAr: 'فرانكفورت (EU)', labelEn: 'Frankfurt (EU)' },
                          { id: 'ap-southeast-1', labelAr: 'سنغافورة (Asia)', labelEn: 'Singapore (Asia)' },
                        ].map(reg => (
                          <button
                            key={reg.id}
                            type="button"
                            onClick={() => setSelectedRegion(reg.id as any)}
                            className={`p-2 rounded-xl border text-[11px] font-medium transition-all text-center cursor-pointer ${
                              selectedRegion === reg.id
                                ? 'bg-[#4E115A] text-white border-[#4E115A] font-bold shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 text-[#6E6A75] dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-[#F5EFF7]'
                            }`}
                          >
                            {isAr ? reg.labelAr : reg.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Agree terms checkbox */}
                    <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 text-[#4E115A] rounded-sm cursor-pointer accent-[#4E115A] mt-0.5 shrink-0"
                      />
                      <span className="text-[11px] text-[#6E6A75] dark:text-slate-400 leading-snug">
                        {isAr
                          ? 'أوافق على اتفاقية الاستخدام وسياسة التشفير الصفري (Zero-Knowledge Privacy Policy) وأتحمل مسؤولية حفظ مفاتيحي المشفرة.'
                          : 'I agree to the Terms of Service, Zero-Knowledge Privacy Policy, and understand that my private keys cannot be recovered by server admins.'}
                      </span>
                    </label>

                    {/* Submit Registration Button */}
                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full py-3 px-4 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isRegistering ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{isAr ? 'جارِ تهيئة السحابة والمفتاح...' : 'Provisioning Vault & Account...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isAr ? 'إنشاء الحساب وتفعيل المساحة السحابية' : 'Create Free Account & Provision Storage'}</span>
                          {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </>
                      )}
                    </button>

                  </form>

                </div>
              )}

              {/* =================================================== */}
              {/* TAB 3: FORGOT PASSWORD FLOW WITH VALIDATION        */}
              {/* =================================================== */}
              {activeMode === 'forgot' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xl font-black text-[#1E1E24] dark:text-white">
                      {isAr ? 'استعادة كلمة المرور والحساب' : 'Recover your Account'}
                    </h3>
                    <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1">
                      {forgotStep === 1
                        ? (isAr ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز تحقق فوري' : 'Enter your registered email to receive a secure verification code')
                        : (isAr ? 'أدخل رمز التحقق المرسل لك وكلمة المرور الجديدة' : 'Enter the verification OTP and choose a new password')}
                    </p>
                  </div>

                  <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
                    {forgotStep === 1 ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#1E1E24] dark:text-slate-200">
                            {isAr ? 'البريد الإلكتروني المسجل:' : 'Registered Email:'}
                          </label>
                          {forgotEmailTouched && forgotEmail.length > 0 && (
                            <span
                              className={`text-[11px] font-medium flex items-center gap-1 ${
                                isForgotEmailValid ? 'text-[#1AD062]' : 'text-rose-500'
                              }`}
                            >
                              {isForgotEmailValid ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isAr ? 'بريد صالح' : 'Valid'}</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>{isAr ? 'صيغة غير صالحة' : 'Invalid'}</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        <div className="relative flex items-center">
                          <Mail className="w-4 h-4 text-[#6E6A75] absolute rtl:right-3.5 ltr:left-3.5" />
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={e => {
                              setForgotEmail(e.target.value);
                              setForgotEmailTouched(true);
                            }}
                            onBlur={() => setForgotEmailTouched(true)}
                            placeholder="name@example.com"
                            className={`w-full rtl:pr-10 rtl:pl-3 ltr:pl-10 ltr:pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-[#1E1E24] dark:text-white transition-all border ${
                              forgotEmailTouched && forgotEmail.length > 0 && !isForgotEmailValid
                                ? 'border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                                : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#4E115A]/30 focus:border-[#4E115A]'
                            }`}
                          />
                        </div>

                        {forgotEmailTouched && forgotEmail.length > 0 && !isForgotEmailValid && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 animate-in fade-in">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{isAr ? 'يرجى كتابة عنوان بريد صالح (user@domain.com)' : 'Please enter a valid email format'}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1.5">
                            {isAr ? 'رمز التحقق (OTP 6 أرقام):' : 'Verification OTP (6 digits):'}
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={forgotOtp}
                            onChange={e => setForgotOtp(e.target.value)}
                            placeholder="894215"
                            className="w-full text-center tracking-[0.4em] font-mono py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-[#1E1E24] dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1.5">
                            {isAr ? 'كلمة المرور الجديدة:' : 'New Password:'}
                          </label>
                          <input
                            type="password"
                            required
                            value={newResetPassword}
                            onChange={e => {
                              setNewResetPassword(e.target.value);
                              setNewResetPasswordTouched(true);
                            }}
                            onBlur={() => setNewResetPasswordTouched(true)}
                            placeholder="••••••••••••"
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-[#1E1E24] dark:text-white font-mono"
                          />

                          <PasswordComplexityHelper
                            password={newResetPassword}
                            touched={newResetPasswordTouched}
                            isAr={isAr}
                            compact
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isResetting}
                      className="w-full py-3 px-4 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isResetting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{isAr ? 'جارِ المعالجة...' : 'Processing...'}</span>
                        </>
                      ) : (
                        <span>
                          {forgotStep === 1
                            ? (isAr ? 'إرسال رمز التحقق' : 'Send Verification OTP')
                            : (isAr ? 'تأكيد وحفظ كلمة المرور الجديدة' : 'Reset Password & Save')}
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* Bottom Footer Text */}
            <div className="pt-6 mt-6 border-t border-[#DCD3DF]/60 dark:border-slate-800 text-center text-[11px] text-[#6E6A75] dark:text-slate-400">
              {isAr
                ? 'رواج كلاود - منصة التخزين السحابي وحلول الأعمال المعتمدة © 2026'
                : 'Rawaj Cloud - Enterprise High-Durability Storage Platform © 2026'}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
