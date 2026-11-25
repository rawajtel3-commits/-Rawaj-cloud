import React, { useEffect, useRef } from 'react';
import { FileItem } from '../../types/storage';
import { useStorage } from '../../context/StorageContext';
import {
  Link2,
  Share2,
  Eye,
  Download,
  Star,
  History,
  Trash2,
  Lock,
  WifiOff,
  Copy,
  Info,
} from 'lucide-react';

interface FileContextMenuProps {
  file: FileItem;
  x: number;
  y: number;
  onClose: () => void;
  onOpenPreview: (file: FileItem) => void;
  onOpenShareModal: (file: FileItem) => void;
  onOpenVersionHistory: (file: FileItem) => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  file,
  x,
  y,
  onClose,
  onOpenPreview,
  onOpenShareModal,
  onOpenVersionHistory,
}) => {
  const {
    lang,
    toggleFavorite,
    deleteFile,
    cryptoShredFile,
    toggleOfflineSync,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so menu does not overflow viewport window
  const menuWidth = 240;
  const menuHeight = 310;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 16);

  const handleCreateShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    onOpenShareModal(file);
  };

  const handleCopyDirectLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = file.shareConfig?.shareUrl || `https://rawajcloud.com/s/${file.id.slice(0, 8)}`;
    navigator.clipboard.writeText(link);
    showNotification(
      'تم نسخ رابط الملف الخارجي المشفر إلى الحافظة',
      'Encrypted share link copied to clipboard',
      'success'
    );
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-60 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 text-xs text-[#1E1E24] dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* File Header Preview */}
      <div className="px-3 py-2 border-b border-[#DCD3DF] dark:border-slate-800 flex items-center gap-2 mb-1">
        <span className="font-bold truncate text-[#1E1E24] dark:text-white flex-1" title={file.name}>
          {file.name}
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#F5EFF7] dark:bg-slate-800 text-[#4E115A] dark:text-purple-300 font-bold uppercase">
          {file.extension}
        </span>
      </div>

      <div className="space-y-0.5">
        {/* PRIMARY ITEM: Create Share Link (Highlighted with Plum / Accent) */}
        <button
          onClick={handleCreateShareLink}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-white bg-[#4E115A] hover:bg-[#3d0d46] font-bold transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-white" />
            <span>{isAr ? 'إنشاء رابط مشاركة محمي' : 'Create Share Link'}</span>
          </div>
          <span className="text-[10px] font-mono bg-white/20 text-white px-1.5 py-0.2 rounded-md">
            {isAr ? 'محمي بكلمة سر' : 'Password'}
          </span>
        </button>

        {/* Copy existing link if configured */}
        <button
          onClick={handleCopyDirectLink}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Copy className="w-4 h-4 text-[#A38540]" />
          <span>{isAr ? 'نسخ رابط المشاركة السريع' : 'Copy Quick Share Link'}</span>
        </button>

        {/* Preview / View */}
        <button
          onClick={() => {
            onClose();
            onOpenPreview(file);
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[#0284C7]" />
          <span>{isAr ? 'معاينة الملف والمحتوى' : 'Preview File'}</span>
        </button>

        {/* Favorite */}
        <button
          onClick={() => {
            toggleFavorite(file.id);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Star className={`w-4 h-4 ${file.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-[#6E6A75]'}`} />
          <span>{file.isFavorite ? (isAr ? 'إزالة من المفضلة' : 'Remove Favorite') : (isAr ? 'إضافة إلى المفضلة' : 'Add to Favorites')}</span>
        </button>

        {/* Version History */}
        <button
          onClick={() => {
            onClose();
            onOpenVersionHistory(file);
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4 text-purple-500" />
          <span>{isAr ? 'سجل النسخ السابقة' : 'Version History'}</span>
        </button>

        {/* Offline Sync */}
        <button
          onClick={() => {
            toggleOfflineSync(file.id);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <WifiOff className={`w-4 h-4 ${file.isOffline ? 'text-[#1AD062]' : 'text-[#6E6A75]'}`} />
          <span>
            {file.isOffline
              ? (isAr ? 'إلغاء التثبيت المحلي (كلاود فقط)' : 'Cloud-Only (Unpin)')
              : (isAr ? 'إتاحة دون اتصال بالإنترنت' : 'Make Available Offline')}
          </span>
        </button>
      </div>

      {/* Delete / Shred Separator */}
      <div className="pt-1 mt-1 border-t border-[#DCD3DF] dark:border-slate-800">
        <button
          onClick={() => {
            if (file.isVault) {
              cryptoShredFile(file.id);
            } else {
              deleteFile(file.id);
            }
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[#B91C1C] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span>
            {file.isVault
              ? (isAr ? 'محو مشفر كلياً (Crypto-Shred)' : 'Crypto-Shred File')
              : (isAr ? 'حذف الملف' : 'Delete File')}
          </span>
        </button>
      </div>
    </div>
  );
};
