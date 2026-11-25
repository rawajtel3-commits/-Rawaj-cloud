import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
  Lock,
  FileKey,
  CheckCircle2,
  Clock,
  History,
  Trash2,
  ChevronDown,
  Layers,
} from 'lucide-react';
import {
  generateVaultPassword,
  generateDicewarePassphrase,
  evaluatePasswordStrength,
  PasswordGeneratorOptions,
} from '../../utils/vaultPasswordGenerator';

interface VaultPasswordGeneratorProps {
  onApplyPassword?: (password: string) => void;
  className?: string;
  initialExpanded?: boolean;
}

export const VaultPasswordGenerator: React.FC<VaultPasswordGeneratorProps> = ({
  onApplyPassword,
  className = '',
  initialExpanded = true,
}) => {
  const { lang, showNotification, updateSecuritySettings } = useStorage();
  const isAr = lang === 'ar';

  const [mode, setMode] = useState<'random' | 'passphrase'>('random');
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 24,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });

  const [passphraseWordCount, setPassphraseWordCount] = useState<number>(4);
  const [passphraseIncludeNumber, setPassphraseIncludeNumber] = useState<boolean>(true);

  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ password: string; timestamp: string }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);

  // Generate new password
  const regenerate = useCallback(() => {
    setIsRotating(true);
    let newPass = '';
    if (mode === 'random') {
      newPass = generateVaultPassword(options);
    } else {
      newPass = generateDicewarePassphrase(passphraseWordCount, passphraseIncludeNumber);
    }
    setGeneratedPassword(newPass);

    // Save to session history (keep last 5)
    setHistory(prev => [
      { password: newPass, timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) },
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => setIsRotating(false), 300);
  }, [mode, options, passphraseWordCount, passphraseIncludeNumber, isAr]);

  // Initial generation on mount or option change
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  // Strength evaluation
  const strength = useMemo(() => {
    return evaluatePasswordStrength(generatedPassword);
  }, [generatedPassword]);

  // Copy handler
  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    showNotification(
      'تم نسخ كلمة المرور المشفرة بأمان إلى الحافظة',
      'Secure password copied to clipboard safely',
      'success'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  // Set as master pin / passphrase
  const handleSetAsVaultPin = () => {
    if (!generatedPassword) return;
    updateSecuritySettings({ vaultMasterPin: generatedPassword });
    showNotification(
      'تم اعتماد كلمة المرور المولدة كرمز مرور رئيسي جديد للخزنة المشفرة!',
      'Generated key set as new Vault Master Passphrase!',
      'success'
    );
  };

  // Toggle helper
  const handleToggle = (key: keyof Omit<PasswordGeneratorOptions, 'length'>) => {
    setOptions(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one character set remains selected
      if (
        !next.includeUppercase &&
        !next.includeLowercase &&
        !next.includeNumbers &&
        !next.includeSymbols
      ) {
        showNotification(
          'يجب تفعيل خيار واحد على الأقل من فئات الرموز',
          'At least one character set must remain enabled',
          'warning'
        );
        return prev;
      }
      return next;
    });
  };

  // Render colored characters for readability
  const renderColorCodedPassword = (pass: string) => {
    if (!showPassword) {
      return <span className="tracking-widest">{'•'.repeat(Math.min(pass.length, 32))}</span>;
    }
    return pass.split('').map((char, index) => {
      let colorClass = 'text-slate-800 dark:text-slate-100'; // Default lowercase
      if (/[A-Z]/.test(char)) {
        colorClass = 'text-[#4E115A] dark:text-purple-300 font-bold'; // Uppercase
      } else if (/[0-9]/.test(char)) {
        colorClass = 'text-amber-600 dark:text-amber-400 font-bold'; // Numbers
      } else if (/[^a-zA-Z0-9]/.test(char)) {
        colorClass = 'text-[#1AD062] dark:text-emerald-400 font-black'; // Symbols
      }
      return (
        <span key={index} className={colorClass}>
          {char}
        </span>
      );
    });
  };

  return (
    <div
      className={`rounded-2xl border border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#F5EFF7] via-white to-[#F5EFF7] dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-950/20 border-b border-[#DCD3DF]/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shadow-xs shrink-0">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white tracking-tight">
                {isAr ? 'مولد كلمات المرور والمفاتيح الآمنة' : 'Zero-Knowledge Key & Password Generator'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#1AD062]/15 text-[#1AD062] border border-[#1AD062]/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>WebCrypto CSPRNG</span>
              </span>
            </div>
            <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5">
              {isAr
                ? 'توليد كلمات مرور مشفرة وفائقة العشوائية محلياً لحماية ملفات الخزنة دون إرسالها لأي خادم'
                : 'Generate military-grade cryptographic keys locally in your browser for zero-knowledge file encryption'}
            </p>
          </div>
        </div>

        {/* Mode Switcher & Collapse Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="inline-flex rounded-xl bg-white dark:bg-slate-800 p-1 border border-[#DCD3DF] dark:border-slate-700 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setMode('random')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                mode === 'random'
                  ? 'bg-[#4E115A] text-white shadow-2xs'
                  : 'text-[#6E6A75] dark:text-slate-300 hover:text-[#1E1E24]'
              }`}
            >
              {isAr ? 'مفتاح عشوائي' : 'Random Key'}
            </button>
            <button
              type="button"
              onClick={() => setMode('passphrase')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                mode === 'passphrase'
                  ? 'bg-[#4E115A] text-white shadow-2xs'
                  : 'text-[#6E6A75] dark:text-slate-300 hover:text-[#1E1E24]'
              }`}
            >
              {isAr ? 'عبارة كلمات' : 'Passphrase'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#6E6A75] dark:text-slate-400 transition-transform cursor-pointer"
            title={isExpanded ? (isAr ? 'طي الأداة' : 'Collapse') : (isAr ? 'توسيع الأداة' : 'Expand')}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* 1. Main Generated Password Display Box */}
          <div className="relative group">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/40 dark:hover:border-purple-600/40 transition-colors shadow-inner">
              
              {/* Displayed Characters with Color Highlights */}
              <div
                className="flex-1 font-mono text-base sm:text-lg break-all select-all tracking-wider py-1"
                dir="ltr"
              >
                {renderColorCodedPassword(generatedPassword)}
              </div>

              {/* Action Buttons: Toggle Visibility, Regenerate, Copy */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                
                {/* Reveal / Hide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2.5 rounded-xl text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-purple-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-[#DCD3DF] transition-all cursor-pointer"
                  title={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {/* Regenerate Button */}
                <button
                  type="button"
                  onClick={regenerate}
                  className="p-2.5 rounded-xl text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-purple-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-[#DCD3DF] transition-all cursor-pointer"
                  title={isAr ? 'توليد كلمة مرور جديدة فوراً' : 'Generate new key'}
                >
                  <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin text-[#4E115A]' : ''}`} />
                </button>

                {/* Quick Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    copied
                      ? 'bg-[#1AD062] text-white shadow-[#1AD062]/20'
                      : 'bg-[#4E115A] hover:bg-[#3D0D47] text-white'
                  }`}
                  title={isAr ? 'نسخ إلى الحافظة' : 'Copy to clipboard'}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      <span>{isAr ? 'نسخ المفتاح' : 'Copy Key'}</span>
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* Quick legend for character colors */}
            {mode === 'random' && showPassword && (
              <div className="flex items-center gap-3 mt-1.5 px-2 text-[10px] text-[#6E6A75] dark:text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4E115A]" />
                  <span>{isAr ? 'أحرف كبيرة (A-Z)' : 'Uppercase'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400" />
                  <span>{isAr ? 'أحرف صغيرة (a-z)' : 'Lowercase'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{isAr ? 'أرقام (0-9)' : 'Digits'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1AD062]" />
                  <span>{isAr ? 'رموز خاصة (!@#)' : 'Symbols'}</span>
                </span>
              </div>
            )}
          </div>

          {/* 2. Password Strength & Entropy Bar */}
          <div className="p-4 rounded-2xl bg-[#F5EFF7]/50 dark:bg-slate-800/40 border border-[#DCD3DF]/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1AD062]" />
                <span className="font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'قوة المفتاح المشفر:' : 'Cryptographic Strength:'}
                </span>
                <span
                  className="font-black px-2 py-0.5 rounded-full text-[11px]"
                  style={{
                    backgroundColor: `${strength.color}15`,
                    color: strength.color,
                    border: `1px solid ${strength.color}40`,
                  }}
                >
                  {isAr ? strength.labelAr : strength.labelEn}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-[#6E6A75] dark:text-slate-400">
                <span>{strength.entropyBits} bits entropy</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A38540]" />
                  <span>{isAr ? `زمن الكسر: ${strength.crackTimeAr}` : `Crack: ${strength.crackTimeEn}`}</span>
                </span>
              </div>
            </div>

            {/* Dynamic Strength Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${strength.score}%`,
                  backgroundColor: strength.color,
                }}
              />
            </div>
          </div>

          {/* 3. Controls & Toggles */}
          {mode === 'random' ? (
            <div className="space-y-4">
              
              {/* Length Slider & Quick Presets */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#1E1E24] dark:text-white">
                    <Sliders className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
                    <span>{isAr ? 'طول كلمة المرور:' : 'Password Length:'}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#4E115A] text-white font-bold text-xs">
                      {options.length} {isAr ? 'خانة' : 'chars'}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={options.length}
                  onChange={e => setOptions(prev => ({ ...prev, length: Number(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#4E115A]"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-medium ltr:mr-1 rtl:ml-1">
                    {isAr ? 'أطوال قياسية:' : 'Presets:'}
                  </span>
                  {[
                    { len: 12, labelAr: '12 خانة (أساسي)', labelEn: '12 (Basic)' },
                    { len: 16, labelAr: '16 خانة (قياسي)', labelEn: '16 (Standard)' },
                    { len: 24, labelAr: '24 خانة (موصى به للخزنة)', labelEn: '24 (Recommended)' },
                    { len: 32, labelAr: '32 خانة (فائق 256-bit)', labelEn: '32 (Ultra)' },
                    { len: 64, labelAr: '64 خانة (مفتاح Hex سحابي)', labelEn: '64 (Hex E2EE)' },
                  ].map(preset => (
                    <button
                      key={preset.len}
                      type="button"
                      onClick={() => setOptions(prev => ({ ...prev, length: preset.len }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                        options.length === preset.len
                          ? 'bg-[#4E115A] text-white font-bold shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#6E6A75] dark:text-slate-300 hover:bg-[#F5EFF7] dark:hover:bg-slate-700'
                      }`}
                    >
                      {isAr ? preset.labelAr : preset.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Set Toggles (Symbols, Numbers, Uppercase, Lowercase, Ambiguous) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                
                {/* 1. Uppercase Letters (A-Z) */}
                <button
                  type="button"
                  onClick={() => handleToggle('includeUppercase')}
                  className={`p-3.5 rounded-2xl border transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer ${
                    options.includeUppercase
                      ? 'bg-white dark:bg-slate-900 border-[#4E115A]/40 dark:border-purple-600/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-[#DCD3DF]/60 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
                      <span>{isAr ? 'أحرف كبيرة (A-Z)' : 'Uppercase (A-Z)'}</span>
                    </div>
                    <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
                      ABC...XYZ
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      options.includeUppercase ? 'bg-[#4E115A] text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {options.includeUppercase && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* 2. Lowercase Letters (a-z) */}
                <button
                  type="button"
                  onClick={() => handleToggle('includeLowercase')}
                  className={`p-3.5 rounded-2xl border transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer ${
                    options.includeLowercase
                      ? 'bg-white dark:bg-slate-900 border-[#4E115A]/40 dark:border-purple-600/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-[#DCD3DF]/60 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
                      <span>{isAr ? 'أحرف صغيرة (a-z)' : 'Lowercase (a-z)'}</span>
                    </div>
                    <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
                      abc...xyz
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      options.includeLowercase ? 'bg-[#4E115A] text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {options.includeLowercase && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* 3. Numbers (0-9) */}
                <button
                  type="button"
                  onClick={() => handleToggle('includeNumbers')}
                  className={`p-3.5 rounded-2xl border transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer ${
                    options.includeNumbers
                      ? 'bg-white dark:bg-slate-900 border-[#4E115A]/40 dark:border-purple-600/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-[#DCD3DF]/60 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
                      <span>{isAr ? 'أرقام (0-9)' : 'Numbers (0-9)'}</span>
                    </div>
                    <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
                      0123456789
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      options.includeNumbers ? 'bg-[#4E115A] text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {options.includeNumbers && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* 4. Symbols (!@#$%) */}
                <button
                  type="button"
                  onClick={() => handleToggle('includeSymbols')}
                  className={`p-3.5 rounded-2xl border transition-all text-left rtl:text-right flex items-center justify-between cursor-pointer ${
                    options.includeSymbols
                      ? 'bg-white dark:bg-slate-900 border-[#4E115A]/40 dark:border-purple-600/40 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-[#DCD3DF]/60 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
                      <span>{isAr ? 'رموز خاصة (!@#$)' : 'Symbols (!@#$)'}</span>
                    </div>
                    <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
                      !@#$%^&*...
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      options.includeSymbols ? 'bg-[#4E115A] text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {options.includeSymbols && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

              </div>

              {/* Ambiguous Characters Filter Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-[#DCD3DF]/60 dark:border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={options.excludeAmbiguous}
                  onChange={() => handleToggle('excludeAmbiguous')}
                  className="w-4 h-4 text-[#4E115A] rounded-sm cursor-pointer accent-[#4E115A]"
                />
                <div className="text-[#6E6A75] dark:text-slate-300">
                  <span className="font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? 'استبعاد الأحرف المتشابهة والمربكة' : 'Avoid Ambiguous Characters'}
                  </span>
                  <span className="ltr:ml-1 rtl:mr-1 font-mono text-[11px]">
                    (0, O, o, 1, l, I, |)
                  </span>
                </div>
              </label>

            </div>
          ) : (
            /* Passphrase Mode (Diceware) */
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? 'عدد الكلمات في العبارة المشفرة:' : 'Number of Passphrase Words:'}
                  </div>
                  <div className="text-[11px] text-[#6E6A75] dark:text-slate-400">
                    {isAr ? 'عبارات كلمات يسهل حفظها مع الحفاظ على حماية تشفير E2EE فائقة' : 'Memorable yet mathematically resistant to brute-force attacks'}
                  </div>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 font-mono">
                  {[3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPassphraseWordCount(num)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        passphraseWordCount === num
                          ? 'bg-[#4E115A] text-white shadow-2xs'
                          : 'text-[#6E6A75] hover:text-[#1E1E24] dark:text-slate-400'
                      }`}
                    >
                      {num} {isAr ? 'كلمات' : 'words'}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-2 border-t border-[#DCD3DF]/50 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={passphraseIncludeNumber}
                  onChange={e => setPassphraseIncludeNumber(e.target.checked)}
                  className="w-4 h-4 text-[#4E115A] rounded-sm cursor-pointer accent-[#4E115A]"
                />
                <span className="text-[#1E1E24] dark:text-slate-200 font-medium">
                  {isAr ? 'إلحاق رقم عشوائي في نهاية العبارة لزيادة الأمان' : 'Append random digits to end of passphrase'}
                </span>
              </label>
            </div>
          )}

          {/* 4. Vault Application Action Hub */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DCD3DF]/60 dark:border-slate-800">
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Set as Vault Master PIN / Passphrase */}
              <button
                type="button"
                onClick={handleSetAsVaultPin}
                className="px-3.5 py-2 rounded-xl bg-[#F5EFF7] dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300 hover:bg-[#4E115A] hover:text-white border border-[#4E115A]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title={isAr ? 'تعيين هذا المفتاح كرمز دخول للخزنة' : 'Set as Vault Master PIN'}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'تعيين كرمز دخول رئيسي للخزنة' : 'Set as Vault Master PIN'}</span>
              </button>

              {/* Custom external apply callback if provided */}
              {onApplyPassword && (
                <button
                  type="button"
                  onClick={() => onApplyPassword(generatedPassword)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileKey className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تطبيق على الملف المشفر' : 'Apply to Encrypted File'}</span>
                </button>
              )}

              {/* View History toggle */}
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>
                  {isAr ? `سجل الجلسة (${history.length})` : `Session History (${history.length})`}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
              {isAr ? 'محلي 100% داخل المتصفح' : '100% Client-Side Sandbox'}
            </div>

          </div>

          {/* 5. In-Memory Session History Dropdown */}
          {showHistory && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-[#DCD3DF] dark:border-slate-800 space-y-2 text-xs animate-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 text-[#6E6A75] dark:text-slate-400 font-mono text-[11px]">
                <span>{isAr ? 'المفاتيح المولدة حديثاً في هذه الجلسة' : 'Recently generated keys in this session'}</span>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{isAr ? 'مسح السجل' : 'Clear'}</span>
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-2 text-slate-400 text-xs">
                  {isAr ? 'لا توجد مفاتيح سابقة' : 'No previous keys'}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 font-mono"
                    >
                      <span className="truncate text-[11px] text-[#1E1E24] dark:text-slate-200 select-all" dir="ltr">
                        {item.password}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.password);
                            showNotification('تم نسخ المفتاح من السجل', 'Key copied from history', 'info');
                          }}
                          className="p-1 text-slate-500 hover:text-[#4E115A] rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title={isAr ? 'نسخ' : 'Copy'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Zero Knowledge Privacy Notice Footer */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-t border-[#DCD3DF]/50 dark:border-slate-800 text-[11px] text-[#6E6A75] dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1AD062] shrink-0" />
          <span>
            {isAr
              ? 'ضمان الخصوصية: لا يتم إرسال أي كلمة مرور أو تخزينها على خوادم السحابة إطلاقاً'
              : 'Zero-Knowledge Privacy: Passwords are generated strictly client-side and never sent to cloud servers.'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#4E115A] dark:text-purple-300 font-bold shrink-0">
          PBKDF2 / Argon2id
        </span>
      </div>

    </div>
  );
};
