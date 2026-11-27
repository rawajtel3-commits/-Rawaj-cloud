import React, { useMemo } from 'react';
import { CheckCircle2, Circle, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { evaluatePasswordStrength } from '../../utils/vaultPasswordGenerator';

export interface PasswordComplexityRule {
  id: 'minLength' | 'hasUppercase' | 'hasLowercase' | 'hasNumber' | 'hasSymbol';
  met: boolean;
  labelAr: string;
  labelEn: string;
  shortAr: string;
  shortEn: string;
  detailAr?: string;
  detailEn?: string;
}

export interface PasswordComplexityResult {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  metCount: number;
  totalCount: number;
  isAllMet: boolean;
  rules: PasswordComplexityRule[];
}

export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?~]/;

export function evaluatePasswordComplexity(password: string): PasswordComplexityResult {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = SPECIAL_CHAR_REGEX.test(password);

  const rules: PasswordComplexityRule[] = [
    {
      id: 'minLength',
      met: minLength,
      labelAr: '8 أحرف على الأقل',
      labelEn: 'At least 8 characters',
      shortAr: '8 أحرف',
      shortEn: '8+ chars',
      detailAr: `${password.length}/8`,
      detailEn: `${password.length}/8`,
    },
    {
      id: 'hasUppercase',
      met: hasUppercase,
      labelAr: 'حرف كبير واحد (A–Z)',
      labelEn: 'Uppercase letter (A–Z)',
      shortAr: 'حرف كبير',
      shortEn: 'uppercase',
    },
    {
      id: 'hasLowercase',
      met: hasLowercase,
      labelAr: 'حرف صغير واحد (a–z)',
      labelEn: 'Lowercase letter (a–z)',
      shortAr: 'حرف صغير',
      shortEn: 'lowercase',
    },
    {
      id: 'hasNumber',
      met: hasNumber,
      labelAr: 'رقم واحد على الأقل (0–9)',
      labelEn: 'At least 1 digit (0–9)',
      shortAr: 'رقم',
      shortEn: 'digit',
    },
    {
      id: 'hasSymbol',
      met: hasSymbol,
      labelAr: 'رمز خاص واحد (!@#$...)',
      labelEn: 'Special character (!@#$...)',
      shortAr: 'رمز خاص',
      shortEn: 'special char',
    },
  ];

  const metCount = rules.filter(r => r.met).length;

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
    metCount,
    totalCount: rules.length,
    isAllMet: metCount === rules.length,
    rules,
  };
}

interface PasswordComplexityHelperProps {
  password: string;
  touched: boolean;
  isAr: boolean;
  compact?: boolean;
}

export const PasswordComplexityHelper: React.FC<PasswordComplexityHelperProps> = ({
  password,
  touched,
  isAr,
  compact = false,
}) => {
  const complexity = useMemo(() => evaluatePasswordComplexity(password), [password]);
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const hasInput = password.length > 0;
  const showFailureState = touched || hasInput;

  // Number of lit segments out of 5 based on both met rules and entropy
  const activeSegments = useMemo(() => {
    if (!hasInput) return 0;
    if (complexity.isAllMet && strength.entropyBits >= 72) return 5;
    return Math.min(5, Math.max(1, complexity.metCount));
  }, [hasInput, complexity.isAllMet, complexity.metCount, strength.entropyBits]);

  const segmentColorClass = useMemo(() => {
    if (!hasInput) return 'bg-slate-200 dark:bg-slate-800';
    if (activeSegments <= 1) return 'bg-rose-500';
    if (activeSegments === 2) return 'bg-amber-500';
    if (activeSegments === 3) return 'bg-amber-400';
    if (activeSegments === 4) return 'bg-sky-500';
    return 'bg-[#1AD062]';
  }, [hasInput, activeSegments]);

  const strengthTextClass = useMemo(() => {
    if (!hasInput) return 'text-[#6E6A75] dark:text-slate-400';
    if (activeSegments <= 1) return 'text-rose-600 dark:text-rose-400';
    if (activeSegments <= 3) return 'text-amber-600 dark:text-amber-400';
    if (activeSegments === 4) return 'text-sky-600 dark:text-sky-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }, [hasInput, activeSegments]);

  const missingRules = useMemo(
    () => complexity.rules.filter(r => !r.met),
    [complexity.rules]
  );

  return (
    <div
      className={`mt-2.5 rounded-xl border transition-colors ${
        complexity.isAllMet
          ? 'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/40 dark:bg-emerald-950/20'
          : showFailureState && !complexity.isAllMet
          ? 'border-[#DCD3DF] dark:border-slate-800 bg-[#FAF7FC] dark:bg-slate-950/70'
          : 'border-[#DCD3DF]/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60'
      } ${compact ? 'p-2.5 space-y-2' : 'p-3.5 space-y-3'}`}
      aria-live="polite"
    >
      {/* Top Row: Title + Live Rule Counter & Strength Label */}
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-[#1E1E24] dark:text-slate-200">
          {complexity.isAllMet ? (
            <ShieldCheck className="w-3.5 h-3.5 text-[#1AD062] shrink-0" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300 shrink-0" />
          )}
          <span>{isAr ? 'قوة ومتطلبات كلمة المرور' : 'Password Strength & Requirements'}</span>
        </div>

        <div className="flex items-center gap-2 font-mono tabular-nums shrink-0">
          {hasInput && (
            <span className={`font-bold ${strengthTextClass}`}>
              {isAr ? strength.labelAr : strength.labelEn}
            </span>
          )}
          <span className="text-[#6E6A75] dark:text-slate-400">
            {complexity.metCount}/{complexity.totalCount}
          </span>
        </div>
      </div>

      {/* 5-Segment Visual Strength Meter */}
      <div
        className="grid grid-cols-5 gap-1.5"
        role="progressbar"
        aria-label={isAr ? 'مؤشر قوة كلمة المرور' : 'Password strength meter'}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={activeSegments}
      >
        {[1, 2, 3, 4, 5].map(segment => (
          <div
            key={segment}
            className={`h-1.5 rounded-full transition-colors duration-200 ${
              segment <= activeSegments
                ? segmentColorClass
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Real-Time Complexity Requirements Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
        {complexity.rules.map(rule => {
          const isUnmetVisible = showFailureState && !rule.met;
          return (
            <li
              key={rule.id}
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border transition-colors ${
                rule.met
                  ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-white dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : isUnmetVisible
                  ? 'border-rose-200/70 dark:border-rose-900/50 bg-white dark:bg-slate-900/80 text-rose-600 dark:text-rose-400'
                  : 'border-transparent bg-white/70 dark:bg-slate-900/60 text-[#6E6A75] dark:text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                {rule.met ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1AD062] shrink-0" />
                ) : isUnmetVisible ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                <span className="truncate">{isAr ? rule.labelAr : rule.labelEn}</span>
              </span>

              {rule.id === 'minLength' && (
                <span className="font-mono tabular-nums text-[10px] opacity-80 shrink-0">
                  {password.length}/8
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Actionable Real-Time Feedback Footer */}
      {hasInput && (
        <div className="pt-2 border-t border-[#DCD3DF]/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {complexity.isAllMet ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {isAr
                ? 'كلمة المرور مستوفية لجميع معايير التشفير الصفري.'
                : 'All complexity criteria met for Zero-Knowledge encryption.'}
            </span>
          ) : (
            <span className="text-[#6E6A75] dark:text-slate-400">
              {isAr ? 'المتبقي: ' : 'Still needed: '}
              <strong className="text-[#1E1E24] dark:text-slate-200">
                {missingRules.map(r => (isAr ? r.shortAr : r.shortEn)).join(isAr ? '، ' : ', ')}
              </strong>
            </span>
          )}

          <span className="font-mono tabular-nums text-[10px] text-[#6E6A75] dark:text-slate-400">
            {strength.entropyBits} bits · {isAr ? strength.crackTimeAr : strength.crackTimeEn}
          </span>
        </div>
      )}
    </div>
  );
};
