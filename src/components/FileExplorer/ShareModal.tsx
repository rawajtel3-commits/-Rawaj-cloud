import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  X,
  Share2,
  Lock,
  Calendar,
  Shield,
  Eye,
  Copy,
  Check,
  UserPlus,
  RefreshCw,
  Globe,
  Download,
} from 'lucide-react';
import { generateSharePassword } from '../../utils/crypto';

export const ShareModal: React.FC = () => {
  const {
    lang,
    shareFile,
    setShareFile,
    updateFileShare,
    showNotification,
  } = useStorage();

  if (!shareFile) return null;
  const isAr = lang === 'ar';

  const [isPublic, setIsPublic] = useState(shareFile.shareConfig?.isPublic ?? true);
  const [hasPassword, setHasPassword] = useState(shareFile.shareConfig?.hasPassword ?? false);
  const [password, setPassword] = useState(shareFile.shareConfig?.password || generateSharePassword());
  const [expiresInDays, setExpiresInDays] = useState<'1' | '7' | '30' | 'never'>('7');
  const [allowDownload, setAllowDownload] = useState(shareFile.shareConfig?.allowDownload ?? true);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaborators, setCollaborators] = useState(shareFile.shareConfig?.collaborators || []);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = shareFile.shareConfig?.shareUrl || `https://rawajcloud.com/s/${shareFile.id.slice(0, 8)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showNotification(
      'تم نسخ رابط المشاركة الآمن إلى الحافظة',
      'Secure share link copied to clipboard',
      'success'
    );
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegeneratePassword = () => {
    setPassword(generateSharePassword());
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorEmail.trim() || !collaboratorEmail.includes('@')) {
      showNotification('يرجى إدخال بريد إلكتروني صالح', 'Please enter a valid email address', 'warning');
      return;
    }
    setCollaborators(prev => [...prev, { email: collaboratorEmail.trim(), role: 'viewer' }]);
    setCollaboratorEmail('');
    showNotification(`تمت إضافة ${collaboratorEmail} إلى قائمة المشاركين`, `Invited ${collaboratorEmail}`, 'success');
  };

  const handleSaveShare = () => {
    const expiresAt =
      expiresInDays === 'never'
        ? undefined
        : new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000).toISOString();

    updateFileShare(shareFile.id, {
      isPublic,
      shareUrl,
      hasPassword,
      password: hasPassword ? password : undefined,
      expiresAt,
      allowDownload,
      accessLevel: 'view',
      collaborators,
    });
    setShareFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#DCD3DF] dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCD3DF] dark:border-slate-800 flex items-center justify-between bg-[#F5EFF7] dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'إنشاء رابط مشاركة خارجي آمن' : 'Create Secure Share Link'}
              </h3>
              <p className="text-[11px] text-[#6E6A75] truncate max-w-[280px]">
                {shareFile.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShareFile(null)}
            className="p-1.5 text-[#6E6A75] hover:text-[#1E1E24] dark:hover:text-slate-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          
          {/* Share Link Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1E1E24] dark:text-slate-300">
                {isAr ? 'رابط المشاركة السحابي المؤقت' : 'Temporary Cloud Share Link'}
              </label>
              <span className="text-[10px] text-[#1AD062] font-mono font-semibold">
                {isAr ? 'مشفر E2EE' : 'E2EE Encrypted'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-[#F5EFF7] dark:bg-slate-950 border border-[#DCD3DF] dark:border-slate-800 rounded-2xl text-[#1E1E24] dark:text-slate-300 font-mono text-[11px] truncate selection:bg-[#4E115A] selection:text-white">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-2xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                <span>{copiedLink ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* Access Controls Grid */}
          <div className="p-4 bg-[#F5EFF7] dark:bg-slate-800/40 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 space-y-3.5">
            
            {/* Password Protection */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[#A38540] shrink-0 border border-[#DCD3DF]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[#1E1E24] dark:text-slate-200">
                    {isAr ? 'حماية برمز سر مؤقت (Password-Protected)' : 'Password Protection'}
                  </div>
                  <div className="text-[11px] text-[#6E6A75]">
                    {isAr ? 'يلزم إدخال كلمة المرور للوصول إلى الملف خارجياً' : 'External recipients must enter this password to view or download'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hasPassword}
                onChange={e => setHasPassword(e.target.checked)}
                className="w-4 h-4 accent-[#4E115A] rounded-md mt-1 cursor-pointer"
              />
            </div>

            {hasPassword && (
              <div className="pt-2 flex items-center gap-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 rounded-xl font-mono text-xs text-[#1E1E24] dark:text-slate-200 focus:outline-hidden focus:border-[#4E115A]"
                  placeholder={isAr ? 'كلمة المرور...' : 'Password...'}
                />
                <button
                  type="button"
                  onClick={handleRegeneratePassword}
                  className="p-2 text-[#4E115A] hover:bg-white rounded-xl border border-[#DCD3DF] transition-colors cursor-pointer"
                  title={isAr ? 'توليد كلمة مرور عشوائية جديدة' : 'Regenerate Strong Password'}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Expiration Date */}
            <div className="pt-2 border-t border-[#DCD3DF] dark:border-slate-700/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[#4E115A] shrink-0 border border-[#DCD3DF]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[#1E1E24] dark:text-slate-200">
                    {isAr ? 'مدة صلاحية الرابط المؤقت' : 'Temporary Link Lifetime'}
                  </div>
                  <div className="text-[11px] text-[#6E6A75]">
                    {isAr ? 'يتعطل الرابط تلقائياً بعد انقضاء المدة' : 'Link self-destructs after this duration'}
                  </div>
                </div>
              </div>
              <select
                value={expiresInDays}
                onChange={e => setExpiresInDays(e.target.value as any)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 rounded-xl text-xs text-[#1E1E24] dark:text-slate-200 cursor-pointer focus:outline-hidden"
              >
                <option value="1">{isAr ? '24 ساعة (يوم واحد)' : '24 Hours (1 Day)'}</option>
                <option value="7">{isAr ? '7 أيام (أسبوع)' : '7 Days (1 Week)'}</option>
                <option value="30">{isAr ? '30 يوماً (شهر)' : '30 Days (1 Month)'}</option>
                <option value="never">{isAr ? 'بدون انتهاء صلاحية' : 'Never Expire'}</option>
              </select>
            </div>

            {/* View Only / Download Restrictions */}
            <div className="pt-2 border-t border-[#DCD3DF] dark:border-slate-700/40 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[#1AD062] shrink-0 border border-[#DCD3DF]">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[#1E1E24] dark:text-slate-200">
                    {isAr ? 'السماح بتنزيل الملف' : 'Allow File Download'}
                  </div>
                  <div className="text-[11px] text-[#6E6A75]">
                    {isAr ? 'عند التعطيل يقتصر الرابط على المعاينة المقيدة فقط' : 'When disabled, viewers cannot save or extract original data'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={e => setAllowDownload(e.target.checked)}
                className="w-4 h-4 accent-[#4E115A] rounded-md mt-1 cursor-pointer"
              />
            </div>

          </div>

          {/* Email Collaborator Invite */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#1E1E24] dark:text-slate-300 block">
              {isAr ? 'دعوة مستخدمين محددين عبر البريد' : 'Invite Specific External Users'}
            </label>
            <form onSubmit={handleAddCollaborator} className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={collaboratorEmail}
                onChange={e => setCollaboratorEmail(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 rounded-2xl text-xs placeholder:text-[#6E6A75] text-[#1E1E24] dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white hover:bg-[#F5EFF7] text-[#1E1E24] border border-[#DCD3DF] rounded-2xl font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#4E115A]" />
                <span>{isAr ? 'إضافة' : 'Invite'}</span>
              </button>
            </form>

            {collaborators.length > 0 && (
              <div className="mt-2 space-y-1">
                {collaborators.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-1.5 bg-[#F5EFF7] dark:bg-slate-950 rounded-xl border border-[#DCD3DF] text-[11px]"
                  >
                    <span className="font-mono text-[#1E1E24] dark:text-slate-300">{c.email}</span>
                    <span className="text-[#6E6A75] font-semibold capitalize">{c.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7] dark:bg-slate-800/40 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setShareFile(null)}
            className="px-4 py-2 text-xs font-semibold text-[#6E6A75] dark:text-slate-400 hover:bg-white rounded-2xl border border-[#DCD3DF] transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSaveShare}
            className="px-5 py-2 text-xs font-bold bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-2xl transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {isAr ? 'حفظ وتفعيل رابط المشاركة' : 'Save & Activate Link'}
          </button>
        </div>

      </div>
    </div>
  );
};
