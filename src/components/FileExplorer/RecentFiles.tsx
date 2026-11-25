import React, { useState } from 'react';
import { FileItem } from '../../types/storage';
import { useStorage } from '../../context/StorageContext';
import { formatBytes, formatDate } from '../../utils/formatters';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  Eye,
  Download,
  Share2,
  Folder,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { FileContextMenu } from './FileContextMenu';

interface RecentFilesProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  onShareClick?: (file: FileItem) => void;
}

export const RecentFiles: React.FC<RecentFilesProps> = ({
  files,
  onFileClick,
  onShareClick,
}) => {
  const { lang, folders, setCurrentFolderId, setActiveCategory, showNotification } = useStorage();
  const isAr = lang === 'ar';
  const ChevronNext = isAr ? ChevronLeft : ChevronRight;

  const [filterType, setFilterType] = useState<'all' | 'media' | 'docs'>('all');

  const [contextMenu, setContextMenu] = useState<{
    file: FileItem;
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      file,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Filter out trash and vault files, sort by updatedAt or createdAt descending
  const recentFiles = React.useMemo(() => {
    let active = files.filter(f => !f.isTrash && !f.isVault);

    if (filterType === 'media') {
      active = active.filter(f => f.type === 'image' || f.type === 'video');
    } else if (filterType === 'docs') {
      active = active.filter(f => ['document', 'pdf', 'spreadsheet', 'presentation', 'code'].includes(f.type));
    }

    return active
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      })
      .slice(0, 10);
  }, [files, filterType]);

  const renderFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#A38540]" />;
      case 'video':
        return <Video className="w-4 h-4 text-[#8B2199]" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-[#4E115A]" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-[#1AD062]" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-[#6366F1]" />;
      default:
        return <FileText className="w-4 h-4 text-[#0284C7]" />;
    }
  };

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return isAr ? 'الجذر الرئيسي' : 'Root';
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.name : isAr ? 'مجلد' : 'Folder';
  };

  const handleFolderClick = (e: React.MouseEvent, folderId: string | null) => {
    e.stopPropagation();
    setCurrentFolderId(folderId);
    setActiveCategory('all');
  };

  if (recentFiles.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-[#DCD3DF] dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#F5EFF7] dark:bg-slate-800 flex items-center justify-center text-[#4E115A] dark:text-purple-300">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1E1E24] dark:text-white flex items-center gap-2">
              <span>{isAr ? 'الملفات المحدثة مؤخراً' : 'Recent Files'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5EFF7] text-[#4E115A] border border-[#DCD3DF] font-mono font-bold">
                {recentFiles.length}
              </span>
            </h2>
            <p className="text-[11px] text-[#6E6A75] hidden sm:block">
              {isAr ? 'وصول واسترجاع سريع لآخر الملفات المعدلة والمرفوعة بحسابك' : 'Quick retrieval for your latest modified or accessed items'}
            </p>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#F5EFF7] dark:bg-slate-800/80 p-1 rounded-xl border border-[#DCD3DF] dark:border-slate-700/60 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-2xs border border-[#DCD3DF] dark:border-transparent'
                : 'text-[#6E6A75] hover:text-[#1E1E24]'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilterType('media')}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
              filterType === 'media'
                ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-2xs border border-[#DCD3DF] dark:border-transparent'
                : 'text-[#6E6A75] hover:text-[#1E1E24]'
            }`}
          >
            {isAr ? 'الوسائط' : 'Media'}
          </button>
          <button
            onClick={() => setFilterType('docs')}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
              filterType === 'docs'
                ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-2xs border border-[#DCD3DF] dark:border-transparent'
                : 'text-[#6E6A75] hover:text-[#1E1E24]'
            }`}
          >
            {isAr ? 'المستندات' : 'Docs'}
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel / Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 pt-1">
        {recentFiles.map(file => {
          const folderName = getFolderName(file.folderId);
          return (
            <div
              key={file.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-rawaj-file-ids', JSON.stringify([file.id]));
                e.dataTransfer.setData('text/plain', file.name);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onClick={() => onFileClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className="group relative bg-[#F5EFF7] dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 p-3 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between overflow-hidden select-none"
            >
              {/* Top Row: Thumbnail/Icon + Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700/60 border border-[#DCD3DF] dark:border-slate-600 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  {file.thumbnailUrl ? (
                    <img
                      src={file.thumbnailUrl}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    renderFileIcon(file)
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 text-[#6E6A75] dark:text-slate-300 border border-[#DCD3DF] dark:border-slate-600 uppercase">
                    {file.extension}
                  </span>
                  {file.isOffline && (
                    <span className="w-2 h-2 rounded-full bg-[#1AD062]" title={isAr ? 'متاح دون اتصال' : 'Offline synced'} />
                  )}
                </div>
              </div>

              {/* File Title */}
              <div className="space-y-1 mb-2">
                <div
                  className="text-xs font-bold text-[#1E1E24] dark:text-white truncate group-hover:text-[#4E115A] transition-colors"
                  title={file.name}
                >
                  {file.name}
                </div>
                
                {/* Folder Origin */}
                <button
                  type="button"
                  onClick={e => handleFolderClick(e, file.folderId)}
                  className="flex items-center gap-1 text-[10px] text-[#6E6A75] hover:text-[#4E115A] truncate transition-colors max-w-full"
                  title={isAr ? `الانتقال إلى ${folderName}` : `Go to ${folderName}`}
                >
                  <Folder className="w-3 h-3 text-[#A38540] shrink-0" />
                  <span className="truncate">{folderName}</span>
                </button>
              </div>

              {/* Bottom Meta: Size & Time */}
              <div className="pt-2 border-t border-[#DCD3DF]/80 dark:border-slate-700/50 flex items-center justify-between text-[10px] font-mono text-[#6E6A75]">
                <span className="font-semibold text-[#1E1E24] dark:text-slate-300">
                  {formatBytes(file.sizeBytes, 1, isAr)}
                </span>
                <span title={file.updatedAt || file.createdAt}>
                  {formatDate(file.updatedAt || file.createdAt, isAr).split(',')[0]}
                </span>
              </div>

              {/* Hover Quick Action Overlay Button */}
              <div className="absolute inset-0 bg-[#4E115A]/10 dark:bg-purple-900/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                <div className="px-3 py-1.5 rounded-xl bg-[#4E115A] text-white text-[11px] font-bold shadow-md flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isAr ? 'معاينة واسترجاع' : 'Open'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu for Recent Files */}
      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenPreview={(f) => onFileClick(f)}
          onOpenShareModal={(f) => onShareClick && onShareClick(f)}
          onOpenVersionHistory={(f) => onFileClick(f)}
        />
      )}

    </section>
  );
};
