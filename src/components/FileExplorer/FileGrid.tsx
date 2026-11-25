import React from 'react';
import { useStorage } from '../../context/StorageContext';
import { FileItem, FolderItem } from '../../types/storage';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  Music,
  Code,
  FileSpreadsheet,
  Star,
  Share2,
  MoreVertical,
  History,
  Trash2,
  Download,
  WifiOff,
  Lock,
  Eye,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { formatBytes, formatDate, getFileTypeInfo } from '../../utils/formatters';
import { FileContextMenu } from './FileContextMenu';
import { FolderContextMenu } from './FolderContextMenu';

interface FileGridProps {
  currentFolders: FolderItem[];
  currentFiles: FileItem[];
  onFolderClick: (id: string) => void;
  onFileClick: (file: FileItem) => void;
  onShareClick: (file: FileItem) => void;
  onVersionsClick: (file: FileItem) => void;
  onQuickViewFolder?: (folder: FolderItem) => void;
  onShareFolder?: (folder: FolderItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  currentFolders,
  currentFiles,
  onFolderClick,
  onFileClick,
  onShareClick,
  onVersionsClick,
  onQuickViewFolder,
  onShareFolder,
}) => {
  const {
    lang,
    toggleFavorite,
    deleteFile,
    cryptoShredFile,
    selectedFileIds,
    toggleSelectFile,
    selectedFolderIds,
    toggleSelectFolder,
    toggleOfflineSync,
    moveFiles,
    uploadFiles,
    setShareFolder,
  } = useStorage();

  const isAr = lang === 'ar';

  // Drag and Drop States
  const [draggedFileId, setDraggedFileId] = React.useState<string | null>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    setDraggedFileId(file.id);
    const idsToMove = selectedFileIds.includes(file.id) && selectedFileIds.length > 1
      ? selectedFileIds
      : [file.id];
    e.dataTransfer.setData('application/x-rawaj-file-ids', JSON.stringify(idsToMove));
    e.dataTransfer.setData('text/plain', file.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedFileId(null);
    setDropTargetFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetFolderId(null);
    setDraggedFileId(null);

    const raw = e.dataTransfer.getData('application/x-rawaj-file-ids');
    if (raw) {
      try {
        const ids: string[] = JSON.parse(raw);
        if (ids && ids.length > 0) {
          moveFiles(ids, targetFolderId);
          return;
        }
      } catch (err) {
        console.error('Failed to parse drag transfer file IDs', err);
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files, targetFolderId);
    }
  };

  // Context Menu State (Files)
  const [contextMenu, setContextMenu] = React.useState<{
    file: FileItem;
    x: number;
    y: number;
  } | null>(null);

  // Context Menu State (Folders)
  const [folderContextMenu, setFolderContextMenu] = React.useState<{
    folder: FolderItem;
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setFolderContextMenu(null);
    setContextMenu({
      file,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folder: FolderItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setFolderContextMenu({
      folder,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const renderFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-amber-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case 'archive':
        return <FileArchive className="w-8 h-8 text-purple-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-teal-500" />;
      case 'code':
        return <FileCode className="w-8 h-8 text-slate-500" />;
      default:
        return <FileText className="w-8 h-8 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Folders Section */}
      {currentFolders.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 font-mono">
            {isAr ? `المجلدات (${currentFolders.length})` : `Folders (${currentFolders.length})`}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {currentFolders.map(folder => {
              const isDropTarget = dropTargetFolderId === folder.id;
              const isFolderSelected = selectedFolderIds.includes(folder.id);
              return (
                <div
                  key={folder.id}
                  onClick={() => onFolderClick(folder.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('Files') ? 'copy' : 'move';
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDropTargetFolderId(folder.id);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (dropTargetFolderId === folder.id) {
                      setDropTargetFolderId(null);
                    }
                  }}
                  onDrop={(e) => handleFolderDrop(e, folder.id)}
                  onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                  className={`group relative flex items-center gap-2.5 p-3 rounded-2xl transition-all cursor-pointer ${
                    isDropTarget
                      ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-2 border-[#4E115A] ring-2 ring-[#4E115A]/30 scale-[1.03] shadow-md'
                      : isFolderSelected
                      ? 'bg-[#F5EFF7] dark:bg-purple-950/30 border-2 border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 hover:shadow-xs'
                  }`}
                >
                  {isDropTarget && (
                    <span className="absolute -top-2.5 rtl:left-2 ltr:right-2 text-[10px] bg-[#4E115A] text-white px-2.5 py-0.5 rounded-full font-bold shadow-md animate-bounce z-10">
                      {draggedFileId ? (isAr ? 'إفلات للنقل' : 'Drop to move') : (isAr ? 'إفلات للرفع هنا' : 'Drop to upload')}
                    </span>
                  )}

                  {/* Bulk Selection Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectFolder(folder.id);
                    }}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      isFolderSelected
                        ? 'bg-[#4E115A] border-[#4E115A] text-white shadow-xs'
                        : selectedFolderIds.length > 0 || selectedFileIds.length > 0
                        ? 'border-[#DCD3DF] dark:border-slate-600 bg-white dark:bg-slate-800 opacity-90 hover:border-[#4E115A]'
                        : 'border-[#DCD3DF] dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 opacity-40 group-hover:opacity-100 hover:border-[#4E115A]'
                    }`}
                    title={isFolderSelected ? (isAr ? 'إلغاء تحديد المجلد' : 'Deselect folder') : (isAr ? 'تحديد المجلد' : 'Select folder')}
                  >
                    {isFolderSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${folder.color || '#4E115A'}15` }}
                  >
                    <Folder
                      className="w-4.5 h-4.5 transition-transform group-hover:scale-110"
                      style={{ color: folder.color || '#4E115A' }}
                    />
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#1E1E24] dark:text-white truncate">
                      {folder.name}
                    </div>
                    <div className="text-[10px] text-[#6E6A75] dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{folder.isSyncPinned ? (isAr ? 'محفوظ محلياً' : 'Synced') : (isAr ? 'سحابي' : 'Cloud')}</span>
                      {folder.isVault && <span className="text-[#1AD062] font-bold">E2EE</span>}
                      {folder.isShared && (
                        <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5" title={isAr ? 'مجلد مشترك' : 'Shared'}>
                          <Share2 className="w-2.5 h-2.5" />
                          <span>{isAr ? 'مشترك' : 'Shared'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Folder Options & Share Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onShareFolder) onShareFolder(folder);
                        else setShareFolder(folder);
                      }}
                      className="p-1.5 rounded-xl text-[#6E6A75] hover:text-[#4E115A] dark:hover:text-purple-300 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                      title={isAr ? 'مشاركة المجلد' : 'Share Folder'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {onQuickViewFolder && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickViewFolder(folder);
                        }}
                        className="p-1.5 rounded-xl text-[#6E6A75] hover:text-[#4E115A] hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-all cursor-pointer opacity-70 group-hover:opacity-100 hidden sm:block"
                        title={isAr ? 'نظرة سريعة على المجلد' : 'Quick View Folder'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderContextMenu(e, folder);
                      }}
                      className="p-1.5 rounded-xl text-[#6E6A75] hover:text-[#1E1E24] hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                      title={isAr ? 'خيارات المجلد' : 'Folder Options'}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div>
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 font-mono">
          {isAr ? `الملفات (${currentFiles.length})` : `Files (${currentFiles.length})`}
        </div>

        {currentFiles.length === 0 ? (
          <div className="py-16 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Folder className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isAr ? 'لا توجد ملفات في هذا المسار حالياً' : 'No files found in this folder'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {isAr ? 'قم بسحب وإفلات الملفات هنا أو اضغط على زر "رفع ملف" للأعلى' : 'Drag and drop files here or click "Upload File" above'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentFiles.map(file => {
              const isSelected = selectedFileIds.includes(file.id);
              const isBeingDragged = draggedFileId === file.id || (isSelected && draggedFileId !== null && selectedFileIds.includes(draggedFileId));
              const typeInfo = getFileTypeInfo(file.extension);

              return (
                <div
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing select-none ${
                    isBeingDragged
                      ? 'opacity-40 border-dashed border-[#4E115A] scale-95 shadow-none'
                      : isSelected
                      ? 'border-[#4E115A] ring-2 ring-[#4E115A]/20 shadow-md'
                      : 'border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A]/60 hover:shadow-xs'
                  }`}
                >
                  {/* Card Header & Checkbox & Actions */}
                  <div className="p-3 pb-0 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectFile(file.id);
                      }}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#4E115A] border-[#4E115A] text-white shadow-xs'
                          : selectedFileIds.length > 0 || selectedFolderIds.length > 0
                          ? 'border-[#DCD3DF] dark:border-slate-600 bg-white dark:bg-slate-800 opacity-90 hover:border-[#4E115A]'
                          : 'border-[#DCD3DF] dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 opacity-40 group-hover:opacity-100 hover:border-[#4E115A]'
                      }`}
                      title={isSelected ? (isAr ? 'إلغاء التحديد' : 'Deselect') : (isAr ? 'تحديد الملف' : 'Select File')}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <div className="flex items-center gap-1">
                      {file.isOffline && (
                        <span
                          title={isAr ? 'متاح دون اتصال' : 'Available Offline'}
                          className="text-[10px] text-sky-600 dark:text-sky-400 p-0.5 rounded"
                        >
                          <WifiOff className="w-3.5 h-3.5" />
                        </span>
                      )}

                      {file.isVault && (
                        <span
                          title={isAr ? 'مشفر كلياً Zero-Knowledge' : 'Zero-Knowledge Encrypted'}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 p-0.5 rounded"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(file.id);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          file.isFavorite
                            ? 'text-amber-500'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail / File Icon Area */}
                  <div
                    onClick={() => onFileClick(file)}
                    className="p-4 flex items-center justify-center cursor-pointer min-h-[110px]"
                  >
                    {file.thumbnailUrl ? (
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 relative">
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/40 group-hover:scale-105 transition-transform">
                        {renderFileIcon(file)}
                      </div>
                    )}
                  </div>

                  {/* File Metadata & Title */}
                  <div className="px-3 pb-3 pt-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div
                        onClick={() => onFileClick(file)}
                        className="text-xs font-semibold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        title={file.name}
                      >
                        {file.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                        <span>{formatBytes(file.sizeBytes, 1, isAr)}</span>
                        <span>·</span>
                        <span className="uppercase">{file.extension}</span>
                      </div>
                    </div>

                    {/* Bottom Utility Strip */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-slate-500 dark:text-slate-400">
                      
                      {/* Version count badge */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onVersionsClick(file);
                        }}
                        className="text-[10px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                        title={isAr ? 'سجل النسخ السابقة' : 'Version History'}
                      >
                        <History className="w-3 h-3" />
                        <span>v{file.versions.length > 0 ? file.versions[0].versionNumber : '1.0'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareClick(file);
                          }}
                          className="p-1 text-[#4E115A] hover:bg-[#F5EFF7] dark:text-purple-300 dark:hover:bg-slate-800 rounded transition-colors"
                          title={isAr ? 'إنشاء رابط مشاركة محمي' : 'Create Share Link'}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleContextMenu(e, file)}
                          className="p-1 text-[#6E6A75] hover:text-[#1E1E24] dark:hover:text-white rounded transition-colors cursor-pointer"
                          title={isAr ? 'خيارات إضافية ورابط المشاركة' : 'More Options & Share'}
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (file.isVault) {
                              cryptoShredFile(file.id);
                            } else {
                              deleteFile(file.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                          title={file.isVault ? (isAr ? 'محو مشفر كلياً (Crypto-Shred)' : 'Crypto-Shred') : (isAr ? 'حذف' : 'Delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Interactive Context Menu (Files) */}
      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenPreview={(f) => onFileClick(f)}
          onOpenShareModal={(f) => onShareClick(f)}
          onOpenVersionHistory={(f) => onVersionsClick(f)}
        />
      )}

      {/* Interactive Context Menu (Folders) */}
      {folderContextMenu && (
        <FolderContextMenu
          folder={folderContextMenu.folder}
          x={folderContextMenu.x}
          y={folderContextMenu.y}
          onClose={() => setFolderContextMenu(null)}
          onOpenFolder={(id) => onFolderClick(id)}
          onQuickView={(f) => onQuickViewFolder && onQuickViewFolder(f)}
          onShareFolder={(f) => {
            if (onShareFolder) onShareFolder(f);
            else setShareFolder(f);
          }}
        />
      )}

    </div>
  );
};
