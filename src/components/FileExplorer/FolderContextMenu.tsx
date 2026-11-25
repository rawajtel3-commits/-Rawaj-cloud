import React, { useEffect, useRef } from 'react';
import { FolderItem } from '../../types/storage';
import { useStorage } from '../../context/StorageContext';
import {
  Share2,
  FolderOpen,
  Eye,
  Download,
  Trash2,
  Lock,
  WifiOff,
  Copy,
  Layers,
  FolderCheck,
  Link2,
} from 'lucide-react';

interface FolderContextMenuProps {
  folder: FolderItem;
  x: number;
  y: number;
  onClose: () => void;
  onOpenFolder: (id: string) => void;
  onQuickView: (folder: FolderItem) => void;
  onShareFolder: (folder: FolderItem) => void;
}

export const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  folder,
  x,
  y,
  onClose,
  onOpenFolder,
  onQuickView,
  onShareFolder,
}) => {
  const {
    lang,
    deleteFolder,
    toggleFolderSync,
    downloadFilesBatch,
    files,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
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
  const menuWidth = 250;
  const menuHeight = 290;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 16);

  const directFiles = files.filter(f => f.folderId === folder.id && !f.isTrash);

  const handleDownloadFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    if (directFiles.length === 0) {
      showNotification('المجلد فارغ لا يحتوي على ملفات قابلة للتنزيل', 'Folder has no downloadable files', 'info');
      return;
    }
    downloadFilesBatch(directFiles.map(f => f.id));
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = folder.shareConfig?.shareUrl || `https://rawajcloud.com/f/shared-${folder.id.replace('folder-', '').slice(0, 8)}`;
    navigator.clipboard.writeText(link);
    showNotification('تم نسخ رابط المجلد السحابي إلى الحافظة', 'Folder link copied to clipboard', 'success');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-64 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 text-xs text-[#1E1E24] dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* Folder Header */}
      <div className="px-3 py-2 border-b border-[#DCD3DF] dark:border-slate-800 flex items-center justify-between gap-2 mb-1">
        <span className="font-bold truncate text-[#1E1E24] dark:text-white flex-1" title={folder.name}>
          {folder.name}
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5EFF7] dark:bg-slate-800 text-[#4E115A] dark:text-purple-300 font-bold">
          {directFiles.length} {isAr ? 'ملف' : 'files'}
        </span>
      </div>

      <div className="space-y-0.5">
        
        {/* PRIMARY ITEM: Share Folder (Highlighted with Royal Plum Brand Color) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onShareFolder(folder);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-white bg-[#4E115A] hover:bg-[#3d0d46] font-bold transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-white" />
            <span>{isAr ? 'مشاركة المجلد وصلاحيات الوصول' : 'Share Folder & Permissions'}</span>
          </div>
          <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.2 rounded-md">
            {folder.isShared ? (isAr ? 'نشط' : 'Shared') : (isAr ? 'رابط آمن' : 'Link')}
          </span>
        </button>

        {/* Copy existing link if shared */}
        {folder.isShared && (
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#A38540]" />
            <span>{isAr ? 'نسخ رابط المشاركة السريع' : 'Copy Share Link'}</span>
          </button>
        )}

        {/* Quick View Drawer */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onQuickView(folder);
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[#0284C7]" />
          <span>{isAr ? 'نظرة سريعة على المحتويات' : 'Quick View Contents'}</span>
        </button>

        {/* Open Folder */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onOpenFolder(folder.id);
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <FolderOpen className="w-4 h-4 text-[#A38540]" />
          <span>{isAr ? 'فتح المجلد والتنقل داخله' : 'Open Folder'}</span>
        </button>

        {/* Download Folder Content */}
        <button
          onClick={handleDownloadFolder}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#1AD062]" />
          <span>{isAr ? 'تنزيل جميع ملفات المجلد' : 'Download Folder Contents'}</span>
        </button>

        {/* Selective Sync Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFolderSync(folder.id);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-[#1E1E24] dark:text-slate-200 transition-colors cursor-pointer"
        >
          <WifiOff className={`w-4 h-4 ${folder.isSyncPinned ? 'text-[#1AD062]' : 'text-[#6E6A75]'}`} />
          <span>
            {folder.isSyncPinned
              ? (isAr ? 'إلغاء التثبيت المحلي (كلاود فقط)' : 'Cloud-Only (Unpin)')
              : (isAr ? 'تثبيت المزامنة دون اتصال' : 'Pin for Offline Sync')}
          </span>
        </button>
      </div>

      {/* Delete Separator */}
      <div className="pt-1 mt-1 border-t border-[#DCD3DF] dark:border-slate-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteFolder(folder.id);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[#B91C1C] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isAr ? 'حذف المجلد' : 'Delete Folder'}</span>
        </button>
      </div>
    </div>
  );
};
