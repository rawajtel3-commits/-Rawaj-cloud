import React, { useState, useEffect, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { FolderItem, FolderCollaborator, FolderShareConfig } from '../../types/storage';
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
  Folder,
  FolderOpen,
  Edit3,
  Clock,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  KeyRound,
  ExternalLink,
  Sliders,
  FolderCheck,
} from 'lucide-react';
import { generateSharePassword } from '../../utils/crypto';
import { formatBytes, formatDate } from '../../utils/formatters';

interface ShareFolderModalProps {
  folder?: FolderItem | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ShareFolderModal: React.FC<ShareFolderModalProps> = ({
  folder: propFolder,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    lang,
    shareFolder: contextFolder,
    setShareFolder,
    updateFolderShare,
    files,
    folders,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';

  // Determine active folder (either from props or context)
  const activeFolder = propFolder !== undefined ? propFolder : contextFolder;
  const isModalOpen = propIsOpen !== undefined ? propIsOpen : Boolean(contextFolder);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setShareFolder(null);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Form States
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [expiresInDays, setExpiresInDays] = useState<'1' | '7' | '30' | '90' | 'custom' | 'never'>('7');
  const [customDate, setCustomDate] = useState<string>('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState(generateSharePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [allowDownloadAll, setAllowDownloadAll] = useState(true);
  const [allowSubfolderCreation, setAllowSubfolderCreation] = useState(true);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState<'view' | 'edit'>('view');
  const [collaborators, setCollaborators] = useState<FolderCollaborator[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Synchronize state when activeFolder changes
  useEffect(() => {
    if (activeFolder) {
      const cfg = activeFolder.shareConfig;
      if (cfg) {
        setPermission(cfg.permission || 'view');
        setExpiresInDays(cfg.expiresInDays || (cfg.expiresAt ? 'custom' : '7'));
        setCustomDate(cfg.expiresAt ? cfg.expiresAt.split('T')[0] : '');
        setHasPassword(Boolean(cfg.hasPassword));
        setPassword(cfg.password || generateSharePassword());
        setAllowDownloadAll(cfg.allowDownloadAll ?? true);
        setAllowSubfolderCreation(cfg.allowSubfolderCreation ?? true);
        setCollaborators(cfg.collaborators || []);
      } else {
        setPermission('view');
        setExpiresInDays('7');
        setCustomDate('');
        setHasPassword(false);
        setPassword(generateSharePassword());
        setAllowDownloadAll(true);
        setAllowSubfolderCreation(true);
        setCollaborators([]);
      }
      setCopiedLink(false);
      setCopiedPassword(false);
    }
  }, [activeFolder]);

  // Compute files count and size inside this folder
  const folderStats = useMemo(() => {
    if (!activeFolder) return { count: 0, sizeBytes: 0 };
    const directFiles = files.filter(f => f.folderId === activeFolder.id && !f.isTrash);
    const sizeBytes = directFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
    return { count: directFiles.length, sizeBytes };
  }, [activeFolder, files]);

  // Generated Shareable URL
  const shareUrl = useMemo(() => {
    if (!activeFolder) return '';
    return activeFolder.shareConfig?.shareUrl || `https://rawajcloud.com/f/shared-${activeFolder.id.replace('folder-', '').slice(0, 8)}`;
  }, [activeFolder]);

  // Calculated expiration timestamp
  const computedExpirationDate = useMemo(() => {
    if (expiresInDays === 'never') return null;
    if (expiresInDays === 'custom' && customDate) {
      return new Date(customDate + 'T23:59:59Z');
    }
    const days = parseInt(expiresInDays, 10);
    if (!isNaN(days)) {
      return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    return null;
  }, [expiresInDays, customDate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showNotification(
      'تم نسخ رابط مشاركة المجلد الآمن إلى الحافظة',
      'Secure folder share link copied to clipboard',
      'success'
    );
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    showNotification(
      'تم نسخ كلمة المرور إلى الحافظة',
      'Password copied to clipboard',
      'info'
    );
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleRegeneratePassword = () => {
    setPassword(generateSharePassword());
    showNotification('تم توليد كلمة مرور أمان جديدة', 'New security password generated', 'info');
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    const email = collaboratorEmail.trim().toLowerCase();
    if (!email || !email.includes('@') || !email.includes('.')) {
      showNotification('يرجى إدخال بريد إلكتروني صالح', 'Please enter a valid email address', 'warning');
      return;
    }
    if (collaborators.some(c => c.email.toLowerCase() === email)) {
      showNotification('المستخدم مضاف بالفعل في قائمة المشاركين', 'User already added to collaborators', 'info');
      return;
    }

    const newCollaborator: FolderCollaborator = {
      email,
      role: collaboratorRole,
      addedAt: new Date().toISOString(),
    };

    setCollaborators(prev => [...prev, newCollaborator]);
    setCollaboratorEmail('');
    showNotification(
      `تمت إضافة ${email} بصلاحية ${collaboratorRole === 'edit' ? 'محرر' : 'مشاهد'}`,
      `Invited ${email} with ${collaboratorRole === 'edit' ? 'Editor' : 'Viewer'} access`,
      'success'
    );
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(prev => prev.filter(c => c.email !== email));
  };

  const handleSaveShare = () => {
    if (!activeFolder) return;

    const expiresAt = computedExpirationDate ? computedExpirationDate.toISOString() : undefined;

    const shareConfig: FolderShareConfig = {
      isShared: true,
      shareUrl,
      permission,
      expiresAt,
      expiresInDays,
      hasPassword,
      password: hasPassword ? password : undefined,
      allowDownloadAll,
      allowSubfolderCreation: permission === 'edit' ? allowSubfolderCreation : false,
      collaborators,
    };

    updateFolderShare(activeFolder.id, shareConfig);
    handleClose();
  };

  const handleRevokeShare = () => {
    if (!activeFolder) return;

    const shareConfig: FolderShareConfig = {
      isShared: false,
      shareUrl,
      permission: 'view',
      hasPassword: false,
      collaborators: [],
    };

    updateFolderShare(activeFolder.id, shareConfig);
    handleClose();
  };

  if (!isModalOpen || !activeFolder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#DCD3DF] dark:border-slate-800 flex flex-col overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* ========================================================= */}
        {/* MODAL HEADER                                              */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-b border-[#DCD3DF] dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#4E115A] to-[#3a0c43] text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xs"
              style={{ backgroundColor: `${activeFolder.color || '#F5EFF7'}30` }}
            >
              <Folder className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">
                  {isAr ? 'مشاركة المجلد وإنشاء رابط آمن' : 'Share Folder & Create Secure Link'}
                </h3>
                {activeFolder.isVault && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-0.5 border border-emerald-400/30">
                    <Lock className="w-2.5 h-2.5" />
                    <span>E2EE</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-200 truncate mt-0.5 flex items-center gap-2 font-mono">
                <span className="font-bold text-white font-sans">{activeFolder.name}</span>
                <span>·</span>
                <span>{folderStats.count} {isAr ? 'ملفات' : 'files'}</span>
                <span>·</span>
                <span>{formatBytes(folderStats.sizeBytes, 1, isAr)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title={isAr ? 'إغلاق (Esc)' : 'Close (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY (SCROLLABLE)                                   */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* Share Link Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1E1E24] dark:text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
                <span>{isAr ? 'رابط المشاركة السحابي المباشر:' : 'Direct Cloud Share Link:'}</span>
              </label>
              <span className="text-[10px] text-[#1AD062] font-mono font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{isAr ? 'حماية مشفرة TLS 1.3' : 'Encrypted TLS 1.3'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-[#F5EFF7] dark:bg-slate-950 border border-[#DCD3DF] dark:border-slate-800 rounded-2xl text-[#1E1E24] dark:text-slate-300 font-mono text-[11px] truncate select-all">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-2xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                <span>{copiedLink ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERMISSION SETTINGS: VIEW-ONLY vs EDITOR                  */}
          {/* ========================================================= */}
          <div className="space-y-2">
            <label className="font-bold text-[#1E1E24] dark:text-slate-200 block">
              {isAr ? 'مستوى الصلاحيات الممنوحة للرابط (Permissions):' : 'Folder Permissions & Access Level:'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: View-Only */}
              <div
                onClick={() => setPermission('view')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  permission === 'view'
                    ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 border-[#DCD3DF] dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      permission === 'view' ? 'bg-[#4E115A] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1E1E24] dark:text-white text-xs">
                        {isAr ? 'عرض وتنزيل فقط' : 'View-Only'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Read-Only Access
                      </span>
                    </div>
                  </div>
                  {permission === 'view' && (
                    <CheckCircle2 className="w-4 h-4 text-[#4E115A] dark:text-purple-300 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-[#6E6A75] dark:text-slate-400 leading-relaxed">
                  {isAr
                    ? 'يمكن للمستلمين استعراض وتنزيل الملفات والمستندات دون إمكانية التعديل، الحذف، أو رفع ملفات جديدة.'
                    : 'Recipients can view, preview, and download files. Cannot edit, upload, or delete.'}
                </p>
              </div>

              {/* Option 2: Editor */}
              <div
                onClick={() => setPermission('edit')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  permission === 'edit'
                    ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 border-[#DCD3DF] dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      permission === 'edit' ? 'bg-[#4E115A] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1E1E24] dark:text-white text-xs">
                        {isAr ? 'محرر ومشارك كامل' : 'Editor & Contributor'}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        Full Collaborative Access
                      </span>
                    </div>
                  </div>
                  {permission === 'edit' && (
                    <CheckCircle2 className="w-4 h-4 text-[#4E115A] dark:text-purple-300 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-[#6E6A75] dark:text-slate-400 leading-relaxed">
                  {isAr
                    ? 'صلاحيات تعاونية كاملة: رفع ملفات جديدة داخل المجلد، إنشاء مجلدات فرعية، وتحديث المحتويات.'
                    : 'Recipients can upload files, create subfolders, and collaboratively organize the folder.'}
                </p>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* OPTIONAL EXPIRATION DATES                                 */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1E1E24] dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#A38540]" />
                <span>{isAr ? 'تاريخ انتهاء صلاحية الرابط (اختياري):' : 'Optional Expiration Date:'}</span>
              </label>

              {computedExpirationDate ? (
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {isAr
                      ? `ينتهي في ${formatDate(computedExpirationDate.toISOString(), isAr)}`
                      : `Expires on ${formatDate(computedExpirationDate.toISOString(), isAr)}`}
                  </span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {isAr ? 'دائم (لا تنتهي الصلاحية)' : 'Permanent (Never Expires)'}
                </span>
              )}
            </div>

            {/* Expiration Preset Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { id: '1', labelAr: '24 ساعة', labelEn: '24h' },
                { id: '7', labelAr: '7 أيام', labelEn: '7 Days' },
                { id: '30', labelAr: '30 يوماً', labelEn: '30 Days' },
                { id: '90', labelAr: '90 يوماً', labelEn: '90 Days' },
                { id: 'never', labelAr: 'دائم', labelEn: 'Never' },
                { id: 'custom', labelAr: 'مخصص', labelEn: 'Custom' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExpiresInDays(opt.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer text-center ${
                    expiresInDays === opt.id
                      ? 'bg-[#4E115A] text-white border-[#4E115A] shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#DCD3DF] dark:border-slate-700 hover:border-[#4E115A]'
                  }`}
                >
                  {isAr ? opt.labelAr : opt.labelEn}
                </button>
              ))}
            </div>

            {/* Custom Date Picker Input */}
            {expiresInDays === 'custom' && (
              <div className="pt-2 animate-in fade-in">
                <input
                  type="date"
                  value={customDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setCustomDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white"
                />
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* PASSWORD PROTECTION & SECURITY RESTRICTIONS               */}
          {/* ========================================================= */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 space-y-3.5">
            
            {/* Password Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#A38540] border border-[#DCD3DF] dark:border-slate-700 shrink-0">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[#1E1E24] dark:text-white text-xs">
                    {isAr ? 'حماية الرابط بكلمة مرور خاصة' : 'Password Protection'}
                  </div>
                  <div className="text-[10px] text-[#6E6A75] dark:text-slate-400">
                    {isAr ? 'طلب كلمة سر قبل السماح بالدخول لمحتويات المجلد' : 'Require password before accessing folder'}
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={hasPassword}
                onChange={e => setHasPassword(e.target.checked)}
                className="w-4 h-4 rounded text-[#4E115A] focus:ring-[#4E115A] cursor-pointer"
              />
            </div>

            {/* Password Input (shown when checked) */}
            {hasPassword && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#4E115A] cursor-pointer"
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="p-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#4E115A] cursor-pointer"
                    title={isAr ? 'توليد كلمة سر عشوائية قوية' : 'Generate random key'}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-2 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#4E115A] cursor-pointer"
                    title={isAr ? 'نسخ كلمة المرور' : 'Copy password'}
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-[#1AD062]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2.5">
              {/* Allow Download All */}
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {isAr ? 'السماح بتنزيل المجلد بالكامل دفعة واحدة (ZIP)' : 'Allow downloading entire folder as ZIP'}
                </span>
                <input
                  type="checkbox"
                  checked={allowDownloadAll}
                  onChange={e => setAllowDownloadAll(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4E115A] focus:ring-[#4E115A]"
                />
              </label>

              {/* If Editor: Allow Subfolder Creation */}
              {permission === 'edit' && (
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {isAr ? 'السماح للمحرر بإنشاء مجلدات فرعية جديدة' : 'Allow creating new subfolders inside'}
                  </span>
                  <input
                    type="checkbox"
                    checked={allowSubfolderCreation}
                    onChange={e => setAllowSubfolderCreation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4E115A] focus:ring-[#4E115A]"
                  />
                </label>
              )}
            </div>

          </div>

          {/* ========================================================= */}
          {/* INVITE COLLABORATORS VIA EMAIL                            */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <label className="font-bold text-[#1E1E24] dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
                <span>{isAr ? 'دعوة أعضاء محددين بالبريد الإلكتروني:' : 'Invite Collaborators by Email:'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {collaborators.length} {isAr ? 'أعضاء' : 'invited'}
              </span>
            </label>

            <form onSubmit={handleAddCollaborator} className="flex items-center gap-2">
              <input
                type="email"
                value={collaboratorEmail}
                onChange={e => setCollaboratorEmail(e.target.value)}
                placeholder="colleague@domain.com"
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white placeholder:text-slate-400"
              />
              <select
                value={collaboratorRole}
                onChange={e => setCollaboratorRole(e.target.value as 'view' | 'edit')}
                className="px-2.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white cursor-pointer"
              >
                <option value="view">{isAr ? 'مشاهد (View)' : 'Viewer'}</option>
                <option value="edit">{isAr ? 'محرر (Edit)' : 'Editor'}</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-[#4E115A] text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAr ? 'دعوة' : 'Invite'}</span>
              </button>
            </form>

            {/* Collaborators List */}
            {collaborators.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {collaborators.map(c => (
                  <div
                    key={c.email}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-[#4E115A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.email[0].toUpperCase()}
                      </div>
                      <span className="truncate text-slate-800 dark:text-slate-200">{c.email}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold uppercase ${
                        c.role === 'edit'
                          ? 'bg-purple-100 dark:bg-purple-900/60 text-[#4E115A] dark:text-purple-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {c.role === 'edit' ? (isAr ? 'محرر' : 'Editor') : (isAr ? 'مشاهد' : 'Viewer')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(c.email)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                      title={isAr ? 'إزالة' : 'Remove'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER ACTIONS                                      */}
        {/* ========================================================= */}
        <div className="px-5 py-4 border-t border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/60 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <div>
            {activeFolder.isShared && (
              <button
                type="button"
                onClick={handleRevokeShare}
                className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'تعطيل الرابط وحظر الوصول' : 'Revoke Share Link'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSaveShare}
              className="px-5 py-2 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 text-[#1AD062]" />
              <span>{isAr ? 'حفظ وتفعيل رابط المشاركة' : 'Save & Enable Share Link'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
