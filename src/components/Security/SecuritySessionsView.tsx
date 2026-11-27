import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { WhatsAppVaultBackupToggle } from './WhatsAppVaultBackupToggle';
import {
  ShieldCheck,
  Key,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  LogOut,
  Fingerprint,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';

export const SecuritySessionsView: React.FC = () => {
  const {
    lang,
    securitySettings,
    toggleMfa,
    registerPasskey,
    generateNewRecoveryCodes,
    sessions,
    revokeSession,
    revokeAllOtherSessions,
    auditLogs,
    showNotification,
  } = useStorage();

  const [copiedCodes, setCopiedCodes] = useState(false);
  const [showMfaQr, setShowMfaQr] = useState(false);
  const isAr = lang === 'ar';

  const copyCodes = () => {
    navigator.clipboard.writeText(securitySettings.recoveryCodes.join('\n'));
    setCopiedCodes(true);
    showNotification(
      'تم نسخ رموز الاسترداد الاحتياطية للطوارئ',
      'Recovery codes copied to clipboard',
      'info'
    );
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-blue-500" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-purple-500" />;
      case 'desktop':
        return <Laptop className="w-5 h-5 text-indigo-500" />;
      default:
        return <Monitor className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 pb-28 space-y-6">
      
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/30 overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'الأمان المصرفي والتحكم بالجلسات' : 'Enterprise Authentication & Sessions'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAr ? 'المصادقة متعددة العوامل وإدارة الأجهزة' : 'Passkeys, MFA & Active Sessions'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAr
              ? 'حماية متقدمة تدعم معايير FIDO2 / WebAuthn ومفاتيح المرور البيومترية، مع إمكانية مراقبة جميع الأجهزة المتصلة بحسابك من الرياض ودبي وحول العالم وإنهاء أي جلسة مشبوهة بضغطة زر واحدة.'
              : 'Enterprise-grade protection with FIDO2 / WebAuthn Passkeys and biometric auth. Monitor active sessions worldwide and revoke unauthorized devices instantly.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>{isAr ? 'المعايير: FIDO2 / WebAuthn' : 'Standards: FIDO2 / WebAuthn'}</span>
            <span>·</span>
            <span>{isAr ? 'التطبيقات: Google Authenticator / 1Password' : 'Apps: TOTP 6-digit'}</span>
            <span>·</span>
            <span className="text-emerald-400">{isAr ? 'تشفير TLS 1.3 مع HSTS' : 'TLS 1.3 Strict HSTS'}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Encrypted Vault Automatic Backup Preference Toggle */}
      <WhatsAppVaultBackupToggle />

      {/* MFA & Passkeys Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Passkeys (WebAuthn / Biometrics) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                securitySettings.passkeyRegistered
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                {securitySettings.passkeyRegistered ? (isAr ? 'مفعل ومسجل' : 'Active Passkey') : (isAr ? 'غير مسجل' : 'Not Registered')}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr ? 'مفاتيح المرور البيومترية (Passkeys / FIDO2)' : 'Biometric Passkeys (FIDO2)'}
            </h3>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isAr
                ? 'تسجيل دخول فائق السرعة عبر بصمة الوجه (Face ID) أو بصمة الإصبع دون الحاجة لكتابة كلمات مرور، مع تخزين المفتاح في الشريحة الآمنة Secure Enclave.'
                : 'Fast, phishing-resistant authentication using Face ID or Touch ID. Stored directly inside your device Secure Enclave.'}
            </p>
          </div>

          <button
            onClick={() => registerPasskey()}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة مفتاح مرور جديد (Passkey)' : 'Register New Passkey'}</span>
          </button>
        </div>

        {/* TOTP 2FA Authenticator */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                securitySettings.mfaEnabled
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {securitySettings.mfaEnabled ? (isAr ? 'المصادقة نشطة' : 'MFA Active') : (isAr ? 'معطل' : 'Disabled')}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr ? 'المصادقة الثنائية (TOTP Authenticator)' : 'Two-Factor Authentication (TOTP)'}
            </h3>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isAr
                ? 'توليد رموز أمان متجددة كل 30 ثانية باستخدام Google Authenticator أو 1Password لمنع الوصول غير المصرح به.'
                : 'Rolling 6-digit codes via Google Authenticator, 1Password, or Authy for ironclad protection.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMfa}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                securitySettings.mfaEnabled
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{securitySettings.mfaEnabled ? (isAr ? 'تعطيل مؤقت' : 'Disable MFA') : (isAr ? 'تفعيل المصادقة' : 'Enable MFA')}</span>
            </button>

            <button
              onClick={() => setShowMfaQr(!showMfaQr)}
              className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              {showMfaQr ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'عرض المفتاح' : 'Secret')}
            </button>
          </div>

          {showMfaQr && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>{isAr ? 'المفتاح السري:' : 'Secret:'}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                {securitySettings.mfaSecret}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Emergency Recovery Codes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr ? 'رموز استرداد الحساب في حالات الطوارئ (Emergency Recovery Codes)' : 'Emergency Recovery Codes'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'احفظ هذه الرموز في مكان آمن لاستعادة حسابك في حال فقدان هاتفك أو تعذر الوصول إلى تطبيق المصادقة' : 'Store these offline to recover your account if you lose your phone'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateNewRecoveryCodes}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isAr ? 'توليد رموز جديدة' : 'Generate New'}
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={copyCodes}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-200"
            >
              {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCodes ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرموز' : 'Copy Codes')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {securitySettings.recoveryCodes.map((code, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center font-mono font-bold text-xs text-slate-800 dark:text-slate-200"
            >
              {code}
            </div>
          ))}
        </div>
      </div>

      {/* Connected Devices & Active Sessions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              {isAr ? `الجلسات والأجهزة النشطة (${sessions.length})` : `Active Sessions & Devices (${sessions.length})`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'عرض الأجهزة المسجلة للدخول مع الموقع وعنوان IP وإمكانية تسجيل الخروج عن بُعد' : 'Review connected devices and remotely log out anytime'}
            </p>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={revokeAllOtherSessions}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isAr ? 'إنهاء كل الجلسات الأخرى' : 'Revoke All Other Sessions'}</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {sessions.map(sess => (
            <div key={sess.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-850 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {getDeviceIcon(sess.deviceType)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sess.deviceName}
                    </span>
                    {sess.isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {isAr ? 'هذا الجهاز (نشط)' : 'Current Device'}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{isAr ? sess.locationAr : sess.locationEn}</span>
                    </span>
                    <span>·</span>
                    <span>{sess.browser}</span>
                    <span>·</span>
                    <span>IP: {sess.ipAddress}</span>
                    <span>·</span>
                    <span className="text-slate-400">{sess.lastActive}</span>
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => revokeSession(sess.id)}
                  className="self-end sm:self-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-slate-200 dark:border-slate-800 hover:border-rose-200"
                >
                  {isAr ? 'إنهاء الجلسة عن بعد' : 'Revoke Remote Session'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Security Audit Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
            {isAr ? 'سجل التدقيق الأمني المشفر (Immutable Audit Log)' : 'Immutable Security Audit Log'}
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
          {auditLogs.map(log => (
            <div key={log.id} className="p-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {isAr ? log.actionAr : log.actionEn}
                </div>
                <div className="text-[11px] text-slate-500">
                  {log.details}
                </div>
              </div>
              <div className="text-right rtl:text-left text-[11px] text-slate-400 shrink-0">
                <div>{log.timestamp}</div>
                <div>IP: {log.ip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
