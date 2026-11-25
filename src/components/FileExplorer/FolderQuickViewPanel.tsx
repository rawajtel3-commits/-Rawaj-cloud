import React, { useEffect, useMemo, useState } from 'react';
import { FolderItem, FileItem } from '../../types/storage';
import { useStorage } from '../../context/StorageContext';
import { formatBytes, formatDate } from '../../utils/formatters';
import {
  X,
  Folder,
  FolderOpen,
  Eye,
  Download,
  Share2,
  FileText,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  Music,
  HardDrive,
  Lock,
  WifiOff,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface FolderQuickViewPanelProps {
  folder: FolderItem | null;
  onClose: () => void;
  onNavigateInto: (folderId: string) => void;
}

export const FolderQuickViewPanel: React.FC<FolderQuickViewPanelProps> = ({
  folder,
  onClose,
  onNavigateInto,
}) => {
  const {
    lang,
    folders,
    files,
    setPreviewFile,
    setShareFile,
    setShareFolder,
    downloadFilesBatch,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const [filterType, setFilterType] = useState<'all' | 'files' | 'subfolders'>('all');

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Aggregate files inside this folder
  const directFiles = useMemo(() => {
    if (!folder) return [];
    return files.filter(f => f.folderId === folder.id && !f.isTrash);
  }, [folder, files]);

  // Direct subfolders inside this folder
  const directSubfolders = useMemo(() => {
    if (!folder) return [];
    return folders.filter(f => f.parentId === folder.id);
  }, [folder, folders]);

  // Total size calculated from direct files
  const totalSizeBytes = useMemo(() => {
    return directFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  }, [directFiles]);

  // Types breakdown
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; bytes: number; labelAr: string; labelEn: string; color: string }> = {
      image: { count: 0, bytes: 0, labelAr: 'صور', labelEn: 'Images', color: '#A38540' },
      document: { count: 0, bytes: 0, labelAr: 'مستندات', labelEn: 'Docs', color: '#4E115A' },
      video: { count: 0, bytes: 0, labelAr: 'فيديو', labelEn: 'Videos', color: '#3B82F6' },
      archive: { count: 0, bytes: 0, labelAr: 'أرشيف', labelEn: 'Archives', color: '#8B5CF6' },
      other: { count: 0, bytes: 0, labelAr: 'أخرى', labelEn: 'Others', color: '#6E6A75' },
    };

    directFiles.forEach(file => {
      let key = 'other';
      if (file.type === 'image') key = 'image';
      else if (['pdf', 'document', 'spreadsheet', 'presentation', 'code'].includes(file.type)) key = 'document';
      else if (file.type === 'video') key = 'video';
      else if (file.type === 'archive') key = 'archive';

      stats[key].count += 1;
      stats[key].bytes += file.sizeBytes;
    });

    return stats;
  }, [directFiles]);

  const renderFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#A38540]" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-[#1AD062]" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-teal-500" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-slate-500" />;
      default:
        return <FileText className="w-4 h-4 text-sky-500" />;
    }
  };

  const handleDownloadAll = () => {
    if (directFiles.length === 0) {
      showNotification(
        'المجلد لا يحتوي على ملفات قابلة للتنزيل',
        'Folder contains no downloadable files',
        'info'
      );
      return;
    }
    const fileIds = directFiles.map(f => f.id);
    downloadFilesBatch(fileIds);
    showNotification(
      `جاري تنزيل ${fileIds.length} ملفات من مجلد "${folder?.name}"`,
      `Downloading ${fileIds.length} files from "${folder?.name}"`,
      'success'
    );
  };

  if (!folder) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Side Panel Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? `نظرة سريعة على مجلد ${folder.name}` : `Quick View: ${folder.name}`}
        className="fixed inset-y-0 ltr:right-0 rtl:left-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 border-l rtl:border-l-0 rtl:border-r border-[#DCD3DF] dark:border-slate-800 shadow-2xl flex flex-col animate-in ltr:slide-in-from-right rtl:slide-in-from-left duration-250 ease-out"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/80 dark:bg-slate-800/60 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-[#DCD3DF] dark:border-slate-700 shadow-2xs"
              style={{ backgroundColor: `${folder.color || '#4E115A'}20` }}
            >
              <Folder
                className="w-6 h-6"
                style={{ color: folder.color || '#4E115A' }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1E1E24] dark:text-white truncate">
                  {folder.name}
                </h3>
                {folder.isVault && (
                  <span className="text-[10px] bg-[#1AD062]/15 text-[#1AD062] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>E2EE</span>
                  </span>
                )}
                {folder.isSyncPinned && (
                  <span className="text-[10px] bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                    {isAr ? 'محلي' : 'Local'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? 'أنشئ في:' : 'Created:'} {formatDate(folder.createdAt, isAr)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6E6A75] hover:text-[#1E1E24] dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-[#DCD3DF] dark:hover:border-slate-700 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق (Esc)' : 'Close (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar inside Drawer */}
        <div className="px-5 py-3 border-b border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
          <button
            onClick={() => onNavigateInto(folder.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#4E115A] hover:bg-[#3d0d46] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>{isAr ? 'فتح المجلد والتنقل داخله' : 'Open & Navigate Inside'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-270" />
          </button>

          <button
            onClick={() => setShareFolder(folder)}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl border border-[#4E115A]/30 dark:border-purple-500/30 text-[#4E115A] dark:text-purple-300 bg-[#F5EFF7] dark:bg-purple-950/30 hover:bg-[#4E115A] hover:text-white dark:hover:bg-purple-900 text-xs font-semibold transition-all cursor-pointer"
            title={isAr ? 'مشاركة المجلد وإنشاء رابط' : 'Share folder & create secure link'}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isAr ? 'مشاركة' : 'Share'}</span>
          </button>

          <button
            onClick={handleDownloadAll}
            disabled={directFiles.length === 0}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={isAr ? 'تنزيل جميع ملفات هذا المجلد' : 'Download all files in this folder'}
          >
            <Download className="w-4 h-4 text-[#A38540]" />
            <span className="hidden sm:inline">{isAr ? 'تنزيل الكل' : 'Download'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Metadata Statistics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800/60 border border-[#DCD3DF] dark:border-slate-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-[#4E115A] dark:text-purple-300 flex items-center justify-center shadow-2xs shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#6E6A75] font-semibold uppercase tracking-wider font-mono">
                  {isAr ? 'إجمالي الحجم' : 'Total Size'}
                </div>
                <div className="text-sm font-bold text-[#1E1E24] dark:text-white font-mono mt-0.5">
                  {formatBytes(totalSizeBytes, 1, isAr)}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800/60 border border-[#DCD3DF] dark:border-slate-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-[#1AD062] flex items-center justify-center shadow-2xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#6E6A75] font-semibold uppercase tracking-wider font-mono">
                  {isAr ? 'المحتويات المباشرة' : 'Direct Items'}
                </div>
                <div className="text-sm font-bold text-[#1E1E24] dark:text-white font-mono mt-0.5">
                  {directFiles.length} {isAr ? 'ملف' : 'files'} · {directSubfolders.length} {isAr ? 'مجلد' : 'dirs'}
                </div>
              </div>
            </div>
          </div>

          {/* Storage Composition Bar (if files exist) */}
          {directFiles.length > 0 && totalSizeBytes > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1E1E24] dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
                  <span>{isAr ? 'توزيع أنواع الملفات' : 'File Type Distribution'}</span>
                </span>
                <span className="text-[11px] font-mono text-[#6E6A75]">
                  {directFiles.length} {isAr ? 'عنصر' : 'items'}
                </span>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#F5EFF7] dark:bg-slate-800 overflow-hidden flex">
                {Object.entries(categoryStats).map(([key, stat]) => {
                  if (stat.bytes === 0) return null;
                  const pct = Math.max(3, Math.round((stat.bytes / totalSizeBytes) * 100));
                  return (
                    <div
                      key={key}
                      style={{ width: `${pct}%`, backgroundColor: stat.color }}
                      className="h-full transition-all duration-300"
                      title={`${isAr ? stat.labelAr : stat.labelEn}: ${formatBytes(stat.bytes, 1, isAr)} (${pct}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                {Object.entries(categoryStats).map(([key, stat]) => {
                  if (stat.count === 0) return null;
                  return (
                    <div key={key} className="flex items-center gap-1.5 text-[#6E6A75] dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span>{isAr ? stat.labelAr : stat.labelEn} ({stat.count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contents Filter Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-[#DCD3DF] dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1 p-1 bg-[#F5EFF7] dark:bg-slate-800 rounded-xl border border-[#DCD3DF] dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-2xs'
                    : 'text-[#6E6A75] hover:text-[#1E1E24]'
                }`}
              >
                {isAr ? `الكل (${directFiles.length + directSubfolders.length})` : `All (${directFiles.length + directSubfolders.length})`}
              </button>
              <button
                onClick={() => setFilterType('files')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'files'
                    ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-2xs'
                    : 'text-[#6E6A75] hover:text-[#1E1E24]'
                }`}
              >
                {isAr ? `الملفات (${directFiles.length})` : `Files (${directFiles.length})`}
              </button>
              <button
                onClick={() => setFilterType('subfolders')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterType === 'subfolders'
                    ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-2xs'
                    : 'text-[#6E6A75] hover:text-[#1E1E24]'
                }`}
              >
                {isAr ? `المجلدات (${directSubfolders.length})` : `Folders (${directSubfolders.length})`}
              </button>
            </div>
          </div>

          {/* Subfolders Listing */}
          {(filterType === 'all' || filterType === 'subfolders') && directSubfolders.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A75] font-mono">
                {isAr ? `مجلدات فرعية (${directSubfolders.length})` : `Subfolders (${directSubfolders.length})`}
              </div>
              <div className="space-y-1.5">
                {directSubfolders.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => onNavigateInto(sub.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A] hover:bg-[#F5EFF7]/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${sub.color || '#4E115A'}15` }}
                      >
                        <Folder className="w-4 h-4" style={{ color: sub.color || '#4E115A' }} />
                      </div>
                      <span className="text-xs font-semibold text-[#1E1E24] dark:text-white truncate group-hover:text-[#4E115A] transition-colors">
                        {sub.name}
                      </span>
                      {sub.isVault && (
                        <span className="text-[9px] text-[#1AD062] font-mono font-bold">E2EE</span>
                      )}
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A75] group-hover:text-[#4E115A] transition-colors rtl:rotate-270 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Listing */}
          {(filterType === 'all' || filterType === 'files') && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A75] font-mono">
                {isAr ? `الملفات المندرجة (${directFiles.length})` : `Contained Files (${directFiles.length})`}
              </div>

              {directFiles.length === 0 ? (
                <div className="py-8 text-center bg-[#F5EFF7]/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-[#DCD3DF] dark:border-slate-800 p-4">
                  <Folder className="w-8 h-8 text-[#6E6A75] mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-semibold text-[#1E1E24] dark:text-slate-300">
                    {isAr ? 'لا توجد ملفات داخل هذا المجلد حالياً' : 'No files in this folder yet'}
                  </p>
                  <p className="text-[11px] text-[#6E6A75] mt-1">
                    {isAr ? 'يمكنك سحب وإفلات الملفات مباشرة على هذا المجلد في المستكشف' : 'You can drag and drop files directly onto this folder in explorer'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {directFiles.map(file => (
                    <div
                      key={file.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 hover:shadow-2xs transition-all"
                    >
                      <div
                        onClick={() => setPreviewFile(file)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F5EFF7] dark:bg-slate-700/60 flex items-center justify-center shrink-0 border border-[#DCD3DF] dark:border-slate-600">
                          {renderFileIcon(file)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#1E1E24] dark:text-white truncate group-hover:text-[#4E115A] transition-colors" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-[10px] text-[#6E6A75] dark:text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{formatBytes(file.sizeBytes, 1, isAr)}</span>
                            <span>·</span>
                            <span className="uppercase">{file.extension}</span>
                            <span>·</span>
                            <span>{formatDate(file.updatedAt || file.createdAt, isAr)}</span>
                          </div>
                        </div>
                      </div>

                      {/* File Quick Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 rounded-lg text-[#6E6A75] hover:text-[#4E115A] hover:bg-[#F5EFF7] dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title={isAr ? 'معاينة سريعة للملف' : 'Quick Preview File'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setShareFile(file)}
                          className="p-1.5 rounded-lg text-[#6E6A75] hover:text-[#4E115A] hover:bg-[#F5EFF7] dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title={isAr ? 'مشاركة الملف' : 'Share File'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security & Cloud Sync Compliance Note */}
          <div className="p-3.5 rounded-2xl bg-[#F5EFF7] dark:bg-slate-800/60 border border-[#DCD3DF] dark:border-slate-700/60 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1AD062] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#6E6A75] leading-relaxed">
              <span className="font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'حماية البيانات والتزامن:' : 'Data Security & Sync:'}
              </span>{' '}
              {folder.isVault
                ? (isAr
                    ? 'هذا المجلد مشفر بنموذج Zero-Knowledge AES-256-GCM. المفاتيح تدار بالكامل على جهاز العميل.'
                    : 'This folder is encrypted with Zero-Knowledge AES-256-GCM. Decryption keys never leave the client.')
                : (isAr
                    ? 'المجلد متزامن سحابياً مع تشفير نقل البيانات TLS 1.3 وتخزين آمن في مراكز البيانات.'
                    : 'Folder is synced with TLS 1.3 in-transit and secure encrypted object storage at rest.')}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/60 dark:bg-slate-800/40 flex items-center justify-between text-xs text-[#6E6A75]">
          <span className="font-mono text-[11px]">
            ID: {folder.id.slice(0, 14)}...
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-[#DCD3DF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1E1E24] dark:text-slate-200 hover:bg-[#F5EFF7] font-semibold transition-all cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </aside>
    </>
  );
};
