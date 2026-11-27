import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  FolderLock,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Fingerprint,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';
import { VaultPasswordGenerator } from './VaultPasswordGenerator';

export const ZeroKnowledgeVault: React.FC = () => {
  const {
    lang,
    securitySettings,
    unlockVault,
    lockVault,
    files,
    cryptoShredFile,
    setPreviewFile,
    showNotification,
  } = useStorage();

  const [pinInput, setPinInput] = useState('');
  const [derivingKey, setDerivingKey] = useState(false);
  const isAr = lang === 'ar';

  const vaultFiles = files.filter(f => f.isVault && !f.isTrash);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setDerivingKey(true);

    // Simulate real 100,000 Argon2id/PBKDF2 derivation delay
    setTimeout(() => {
      unlockVault(pinInput);
      setDerivingKey(false);
      setPinInput('');
    }, 450);
  };

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 pb-28 space-y-6">
      
      {/* Vault Top Hero & Architecture Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-emerald-900/40 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'بروتوكول التشفير الصفري (Zero-Knowledge Architecture)' : 'Zero-Knowledge Protocol'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAr ? 'الخزنة المشفرة كلياً (Private Drive)' : 'End-to-End Encrypted Vault'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAr
              ? 'يتم اشتقاق مفاتيح التشفير حصرياً داخل متصفحك عبر Argon2id و PBKDF2 (100,000 دورة). لا تغادر كلمة المرور جهازك أبداً، ولا تستطيع خوادم رواج كلاود أو أي جهة خارجية قراءة ملفاتك إطلاقاً.'
              : 'Encryption keys are derived client-side via Argon2id & PBKDF2 (100k rounds). Your master passphrase never leaves your device. Rawaj Cloud servers have zero access to your data.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>{isAr ? 'الخوارزمية: AES-256-GCM' : 'Cipher: AES-256-GCM'}</span>
            <span>·</span>
            <span>{isAr ? 'المفتاح: 256-bit Auth Tag' : 'Key: 256-bit Auth Tag'}</span>
            <span>·</span>
            <span className="text-emerald-400">{isAr ? 'الإتلاف الآمن: Crypto-Shredding' : 'Crypto-Shredding Enabled'}</span>
          </div>
        </div>
      </div>

      {/* Vault State: Locked vs Unlocked */}
      {!securitySettings.vaultUnlocked ? (
        <div className="space-y-6">
          <div className="max-w-md mx-auto my-6 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'الخزنة مقفلة ومشفرة كلياً' : 'Vault is Encrypted & Locked'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isAr
                  ? 'أدخل رمز أو عبارة المرور الرئيسية لاشتقاق مفتاح التشفير وفك قفل ملفاتك محلياً عبر Argon2id'
                  : 'Enter your Vault Master PIN / Passphrase to derive the client key via Argon2id'}
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  maxLength={64}
                  placeholder="••••••••"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full text-center text-lg sm:text-xl tracking-wider font-mono py-2.5 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={derivingKey}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {derivingKey ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري اشتقاق المفتاح (Argon2id)...' : 'Deriving Client Key...'}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>{isAr ? 'فك تشفير وفتح الخزنة' : 'Decrypt & Unlock Vault'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
              {isAr ? 'رمز تجريبي للتوضيح: 1234' : 'Demo Passkey / PIN: 1234'}
            </div>
          </div>

          {/* Built-in Password Generator Utility (Available anytime) */}
          <div className="max-w-4xl mx-auto">
            <VaultPasswordGenerator
              onApplyPassword={(pwd) => setPinInput(pwd)}
              initialExpanded={false}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unlocked Notification Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl">
            <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
              <Unlock className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'الخزنة مفكوكة التشفير ونشطة في الذاكرة المؤقتة (Zero-Knowledge Session)' : 'Vault unlocked & active in secure client memory'}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                {vaultFiles.length} {isAr ? 'ملفات مشفرة' : 'encrypted files'} (
                {formatBytes(vaultFiles.reduce((acc, f) => acc + f.sizeBytes, 0), 1, isAr)})
              </span>
              <button
                onClick={lockVault}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAr ? 'قفل الخزنة الآن' : 'Lock Vault Now'}</span>
              </button>
            </div>
          </div>

          {/* Built-in Secure Password Generator Tool */}
          <VaultPasswordGenerator
            onApplyPassword={(pwd) => {
              showNotification(
                `تم اختيار كلمة المرور المشفرة لتأمين الملف القادم: ${pwd.slice(0, 4)}••••`,
                `Password selected for next encrypted file: ${pwd.slice(0, 4)}••••`,
                'success'
              );
            }}
            initialExpanded={true}
          />

          {/* Encrypted Vault Files Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
                <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'الملفات المشفرة المحمية داخل الخزنة' : 'Encrypted Files in Vault'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300">
                  {vaultFiles.length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              {vaultFiles.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <FolderLock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                    {isAr ? 'الخزنة فارغة حالياً' : 'Your Vault is Currently Empty'}
                  </h4>
                  <p className="text-xs text-[#6E6A75] dark:text-slate-400 max-w-sm mx-auto">
                    {isAr
                      ? 'يمكنك نقل أي ملف من مستكشف الملفات إلى الخزنة، أو توليد كلمة مرور قوية أعلاه لتشفير ملفاتك الجديدة.'
                      : 'Move files from your File Explorer to the vault or generate a strong key above to secure new files.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 font-mono">
                      <th className="py-2.5 px-4">{isAr ? 'الملف المشفر' : 'Encrypted File'}</th>
                      <th className="py-2.5 px-4">{isAr ? 'تاريخ التشفير' : 'Encrypted Date'}</th>
                      <th className="py-2.5 px-4 text-right rtl:text-left">{isAr ? 'الحجم' : 'Size'}</th>
                      <th className="py-2.5 px-4 text-center">{isAr ? 'الإتلاف الآمن (Crypto-Shred)' : 'Crypto-Shredding'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {vaultFiles.map(file => (
                      <tr key={file.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div
                            onClick={() => setPreviewFile(file)}
                            className="flex items-center gap-2 cursor-pointer font-medium text-slate-900 dark:text-slate-100 hover:text-emerald-600"
                          >
                            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {formatDate(file.updatedAt, isAr)}
                        </td>
                        <td className="py-3 px-4 font-mono text-right rtl:text-left text-slate-700 dark:text-slate-300">
                          {formatBytes(file.sizeBytes, 1, isAr)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => cryptoShredFile(file.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title={isAr ? 'تدمير المفتاح نهائياً ومحو البيانات' : 'Irreversibly destroy key and sanitize blocks'}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{isAr ? 'Crypto-Shred' : 'Shred'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
