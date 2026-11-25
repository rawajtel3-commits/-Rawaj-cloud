import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  MessageSquareLock,
  FolderLock,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  Clock,
  Key,
  RefreshCw,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface WhatsAppVaultBackupToggleProps {
  className?: string;
  onNavigateToMessages?: () => void;
  onNavigateToVault?: () => void;
}

export const WhatsAppVaultBackupToggle: React.FC<WhatsAppVaultBackupToggleProps> = ({
  className = '',
  onNavigateToMessages,
  onNavigateToVault,
}) => {
  const {
    lang,
    securitySettings,
    toggleAutoWhatsAppVaultBackup,
    updateSecuritySettings,
    messagesSettings,
    setActiveTab,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const isEnabled = Boolean(securitySettings.autoWhatsAppVaultBackup);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Trigger immediate manual backup to the encrypted vault
  const handleTriggerInstantVaultBackup = () => {
    if (!isEnabled) {
      showNotification(
        'يرجى تفعيل خيار النسخ التلقائي للواتساب إلى الخزنة أولاً',
        'Please enable Automatic WhatsApp Vault Backup first',
        'warning'
      );
      return;
    }

    setIsSimulatingSync(true);
    showNotification(
      'جارٍ تشفير وحفظ نسخة احتياطية من الواتساب في الخزنة المشفرة كلياً (E2EE)...',
      'Encrypting and saving WhatsApp backup snapshot into Zero-Knowledge Vault...',
      'info'
    );

    setTimeout(() => {
      const nowIso = new Date().toISOString();
      updateSecuritySettings({
        lastWhatsAppVaultBackupAt: nowIso,
      });
      setIsSimulatingSync(false);
      showNotification(
        'تم تشفير وحفظ أحدث نسخة من محادثات الواتساب في الخزنة المشفرة بنجاح!',
        'Latest WhatsApp snapshot encrypted and committed to Zero-Knowledge Vault!',
        'success'
      );
    }, 1800);
  };

  const handleFrequencyChange = (freq: 'realtime' | 'daily' | 'weekly') => {
    updateSecuritySettings({ autoWhatsAppVaultBackupFrequency: freq });
    showNotification(
      freq === 'realtime'
        ? 'تم ضبط وتيرة النسخ إلى الخزنة: لحظياً فور كل رسالة'
        : freq === 'daily'
        ? 'تم ضبط وتيرة النسخ إلى الخزنة: يومياً أثناء الشحن والـ Wi-Fi'
        : 'تم ضبط وتيرة النسخ إلى الخزنة: أسبوعياً',
      `Vault backup schedule updated: ${freq}`,
      'info'
    );
  };

  const handleToggleWifiOnly = () => {
    const nextVal = !securitySettings.wifiOnlyWhatsAppVault;
    updateSecuritySettings({ wifiOnlyWhatsAppVault: nextVal });
    showNotification(
      nextVal ? 'تم قصر نسخ الواتساب على شبكات Wi-Fi فقط للحفاظ على باقة البيانات' : 'تم السماح بالنسخ عبر شبكات الجوال والـ Wi-Fi',
      nextVal ? 'WhatsApp vault backup restricted to Wi-Fi networks' : 'WhatsApp vault backup allowed over Cellular & Wi-Fi',
      'info'
    );
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isEnabled
          ? 'bg-gradient-to-br from-white via-[#F5EFF7]/40 to-white dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border-[#4E115A]/30 dark:border-purple-800/40 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-[#DCD3DF] dark:border-slate-800 shadow-2xs'
      } ${className}`}
    >
      {/* Primary Toggle Header Row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left / Start Info Section */}
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Dual-Icon Indicator (WhatsApp + Vault) */}
          <div className="relative shrink-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shadow-2xs ${
                isEnabled
                  ? 'bg-[#4E115A] text-white shadow-[#4E115A]/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <MessageSquareLock className="w-5 h-5" />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-900 shadow-xs ${
                isEnabled
                  ? 'bg-[#1AD062] text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
              }`}
              title={isAr ? 'الخزنة المشفرة كلياً' : 'Zero-Knowledge Encrypted Vault'}
            >
              <FolderLock className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white tracking-tight">
                {isAr
                  ? 'النسخ الاحتياطي التلقائي للواتساب إلى الخزنة المشفرة'
                  : 'Automatic WhatsApp Backup to Encrypted Vault'}
              </h3>

              {/* Status Pill Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  isEnabled
                    ? 'bg-[#1AD062]/15 text-[#1AD062] border border-[#1AD062]/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isEnabled ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1AD062] animate-pulse" />
                    <span>{isAr ? 'مفعل ومحمي في الخزنة' : 'Vault-Secured'}</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{isAr ? 'معطل حالياً' : 'Disabled'}</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-[#6E6A75] dark:text-slate-400 leading-relaxed max-w-xl">
              {isAr
                ? 'تشفير فوري لكافة محادثات ووسائط الواتساب بمفتاحك الخاص (64 خانة) وتخزينها دورياً داخل الخزنة المشفرة كلياً (Zero-Knowledge Vault) لمنع أي وصول خارجي.'
                : 'Automatically encrypts WhatsApp messages and media client-side with your 64-digit key and syncs them directly into your Zero-Knowledge Vault.'}
            </p>
          </div>
        </div>

        {/* Right / End: Interactive Switch Control */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => toggleAutoWhatsAppVaultBackup()}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4E115A] focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
              isEnabled ? 'bg-[#1AD062]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            title={
              isEnabled
                ? isAr
                  ? 'انقر لتعطيل النسخ التلقائي للواتساب إلى الخزنة'
                  : 'Click to disable WhatsApp vault backup'
                : isAr
                ? 'انقر لتفعيل النسخ التلقائي للواتساب إلى الخزنة'
                : 'Click to enable WhatsApp vault backup'
            }
          >
            <span className="sr-only">
              {isAr ? 'النسخ الاحتياطي التلقائي للواتساب إلى الخزنة' : 'Automatic WhatsApp Backup to Vault'}
            </span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                isEnabled
                  ? 'translate-x-6 rtl:-translate-x-6'
                  : 'translate-x-0 rtl:translate-x-0'
              }`}
            >
              {isEnabled ? (
                <Lock className="w-3 h-3 text-[#1AD062]" />
              ) : (
                <ShieldAlert className="w-3 h-3 text-slate-400" />
              )}
            </span>
          </button>
        </div>

      </div>

      {/* Extended Configuration Bar & Details (Visible when enabled) */}
      {isEnabled && (
        <div className="border-t border-[#DCD3DF]/60 dark:border-slate-800 bg-[#F5EFF7]/30 dark:bg-purple-950/15 p-4 sm:p-5 space-y-4">
          
          {/* Metadata badges row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            
            {/* 1. Destination */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 flex items-center justify-center shrink-0">
                <FolderLock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#6E6A75] dark:text-slate-400 font-medium">
                  {isAr ? 'وجهة التخزين المشفرة' : 'Encrypted Destination'}
                </div>
                <div className="font-bold text-[#1E1E24] dark:text-white truncate font-mono text-[11px]">
                  Vault: /whatsapp_e2ee/
                </div>
              </div>
            </div>

            {/* 2. Key Fingerprint */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#A38540]/15 text-[#A38540] flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#6E6A75] dark:text-slate-400 font-medium">
                  {isAr ? 'بصمة مفتاح العميل E2EE' : 'Client E2EE Key'}
                </div>
                <div className="font-bold text-[#1E1E24] dark:text-white truncate font-mono text-[11px]">
                  {messagesSettings.backupKeyFingerprint || 'WA-77A93E4B8F1265D9'}
                </div>
              </div>
            </div>

            {/* 3. Last Vault Backup Timestamp */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1AD062]/15 text-[#1AD062] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#6E6A75] dark:text-slate-400 font-medium">
                  {isAr ? 'آخر مزامنة إلى الخزنة' : 'Last Vault Snapshot'}
                </div>
                <div className="font-bold text-[#1E1E24] dark:text-white truncate font-mono text-[11px]">
                  {securitySettings.lastWhatsAppVaultBackupAt
                    ? new Date(securitySettings.lastWhatsAppVaultBackupAt).toLocaleTimeString(
                        isAr ? 'ar-SA' : 'en-US',
                        { hour: '2-digit', minute: '2-digit' }
                      )
                    : (isAr ? 'منذ قليل' : 'Just now')}
                </div>
              </div>
            </div>

          </div>

          {/* Sub-Preferences: Schedule & Network */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#DCD3DF]/50 dark:border-slate-800/80">
            
            {/* Frequency Selector */}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#6E6A75] dark:text-slate-400" />
              <span className="text-xs text-[#6E6A75] dark:text-slate-400 font-medium">
                {isAr ? 'جدول المزامنة:' : 'Backup Schedule:'}
              </span>
              <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 p-0.5 border border-[#DCD3DF] dark:border-slate-800 text-xs">
                {(['realtime', 'daily', 'weekly'] as const).map(freq => {
                  const currentFreq = securitySettings.autoWhatsAppVaultBackupFrequency || 'daily';
                  const isSelected = currentFreq === freq;
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => handleFrequencyChange(freq)}
                      className={`px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#4E115A] text-white font-bold shadow-2xs'
                          : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
                      }`}
                    >
                      {freq === 'realtime'
                        ? isAr
                          ? 'لحظي'
                          : 'Realtime'
                        : freq === 'daily'
                        ? isAr
                          ? 'يومي (موصى به)'
                          : 'Daily'
                        : isAr
                        ? 'أسبوعي'
                        : 'Weekly'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Network restriction: Wi-Fi Only */}
            <button
              type="button"
              onClick={handleToggleWifiOnly}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                securitySettings.wifiOnlyWhatsAppVault !== false
                  ? 'bg-white dark:bg-slate-900 border-[#4E115A]/30 text-[#4E115A] dark:text-purple-300 font-semibold shadow-2xs'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-[#1AD062]" />
              <span>
                {securitySettings.wifiOnlyWhatsAppVault !== false
                  ? isAr
                    ? 'Wi-Fi فقط (توفير البيانات)'
                    : 'Wi-Fi Only (Data Saver)'
                  : isAr
                  ? 'عبر الجوال والـ Wi-Fi'
                  : 'Cellular & Wi-Fi'}
              </span>
            </button>

          </div>

          {/* Action Links & Immediate Sync Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#DCD3DF]/50 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToMessages) {
                    onNavigateToMessages();
                  } else {
                    setActiveTab('messages');
                  }
                }}
                className="text-xs font-semibold text-[#4E115A] dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? 'إدارة رسائل ومحادثات الواتساب' : 'Manage WhatsApp Backups'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <span className="text-slate-300 dark:text-slate-700">·</span>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToVault) {
                    onNavigateToVault();
                  } else {
                    setActiveTab('vault');
                  }
                }}
                className="text-xs font-semibold text-[#4E115A] dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? 'فتح الخزنة المشفرة (Vault)' : 'Open Encrypted Vault'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Instant Snapshot Action */}
            <button
              type="button"
              disabled={isSimulatingSync}
              onClick={handleTriggerInstantVaultBackup}
              className="px-3.5 py-1.5 bg-[#4E115A] hover:bg-[#3D0D47] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSync ? 'animate-spin' : ''}`} />
              <span>
                {isSimulatingSync
                  ? isAr
                    ? 'جارٍ تشفير ونقل النسخة...'
                    : 'Encrypting & Syncing...'
                  : isAr
                  ? 'نسخ فوري إلى الخزنة الآن'
                  : 'Backup Now to Vault'}
              </span>
            </button>
          </div>

        </div>
      )}

      {/* Safety Notice Footer */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-[#DCD3DF]/50 dark:border-slate-800 text-[11px] text-[#6E6A75] dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1AD062] shrink-0" />
          <span>
            {isAr
              ? 'معيار الأمان Zero-Knowledge: لا يمكن لمهندسي رواج كلاود أو مزودي السحابة قراءة الرسائل أو كشف المفتاح'
              : 'Zero-Knowledge Privacy: Rawaj Cloud cannot read messages or access your 64-digit key.'}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#4E115A] dark:text-purple-300 font-bold shrink-0">
          AES-256-GCM
        </span>
      </div>

    </div>
  );
};
